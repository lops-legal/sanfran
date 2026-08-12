import { createClient } from "@supabase/supabase-js";
import { SkillDataAdapter, SkillQueryParams, SkillQueryResult } from "../hooks/useInfiniteSkills";
import { createMockAdapter } from "../hooks/useInfiniteSkills";
import { LegalSkill } from "./types";
import { mapDbSkillToLegalSkill } from "./skillMapper";
import { MOCK_SKILLS } from "./data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Sanfran] NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY ausentes. Configure apps/next-web/.env e reinicie o servidor."
  );
}

/** Cliente Supabase — usado apenas para escrita (upsert) no browser. Leituras passam pela API local. */
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient("https://pxnnfxuxfzlzwtlmqpaw.supabase.co", "placeholder-anon-key");

export interface CatalogStats {
  totalPublished: number;
  /** Skills que passaram pela revisão de segurança baseada no OWASP Agentic Skills Top 10 */
  totalOabVerified: number;
  totalDownloads: number;
  verticalCounts: Record<string, number>;
  taskCategoryCounts: Record<string, number>;
}

const DETAIL_COLUMNS = `
  id, slug, name, description, version, markdown_body,
  author_id, author_org, owner_avatar, vertical, tags, legal_area,
  quality_score, regulatory_score, compliance_checked, quality_breakdown,
  stars_count, downloads_count, review_count, rating, hot_score,
  regulatory_issues, security_criteria_hits,
  playground_system_prompt, playground_test_input, playground_expected_output,
  objective, use_case, workflow, professional_role,
  updated_at, published_at, created_at
`;

function buildSkillsQuery(params: SkillQueryParams): string {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.vertical) searchParams.set("vertical", params.vertical);
  if (params.taskCategory) searchParams.set("taskCategory", params.taskCategory);
  if ((params.minQualityScore ?? 0) > 0) searchParams.set("minQualityScore", String(params.minQualityScore));
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.cursor != null) searchParams.set("cursor", String(params.cursor));
  return `/api/skills?${searchParams.toString()}`;
}

// Fallback stats quando a API não está disponível
const FALLBACK_STATS: CatalogStats = {
  totalPublished: 42,
  totalOabVerified: 28,
  totalDownloads: 12450,
  verticalCounts: {
    Trabalhista: 12,
    LGPD: 8,
    Consumidor: 10,
    Societario: 7,
    Processual: 5,
  },
  taskCategoryCounts: {
    auditoria: 42,
    peticao: 28,
    compliance: 35,
    notificacao: 19,
    pesquisa: 22,
  },
};

export const createSupabaseAdapter = (): SkillDataAdapter => {
  const mockAdapter = createMockAdapter(MOCK_SKILLS as LegalSkill[]);

  return async (params: SkillQueryParams, signal: AbortSignal): Promise<SkillQueryResult> => {
    try {
      const response = await fetch(buildSkillsQuery(params), { signal });

      if (!response.ok) {
        // Fallback para mock quando API não está disponível
        console.warn("[Sanfran] API não disponível, usando dados mock.");
        return mockAdapter(params, signal);
      }

      return (await response.json()) as SkillQueryResult;
    } catch (err) {
      // Fallback para mock em caso de erro de rede
      if (err instanceof DOMException && err.name === "AbortError") throw err;
      console.warn("[Sanfran] Erro ao conectar na API, usando dados mock:", err);
      return mockAdapter(params, signal);
    }
  };
};

export async function fetchSkillBySlug(slug: string): Promise<LegalSkill | null> {
  try {
    const response = await fetch(`/api/skills/${encodeURIComponent(slug)}`);

    if (response.status === 404) return null;
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error ?? `Erro HTTP ${response.status}`);
    }

    return (await response.json()) as LegalSkill;
  } catch (err) {
    // Fallback: busca no mock
    const skill = MOCK_SKILLS.find((s) => s.slug === slug || s.id === slug);
    return skill ?? null;
  }
}

export async function fetchCatalogStats(): Promise<CatalogStats> {
  try {
    const response = await fetch("/api/catalog/stats");

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error ?? `Erro HTTP ${response.status}`);
    }

    return (await response.json()) as CatalogStats;
  } catch (err) {
    console.warn("[Sanfran] API stats não disponível, usando fallback:", err);
    return FALLBACK_STATS;
  }
}

/**
 * Salva ou atualiza uma skill via Route Handler protegido (Server-side).
 * Não utiliza mais o cliente Supabase do browser diretamente para escrita.
 */
export const upsertSkill = async (
  skill: Partial<LegalSkill> & { author_id: string; slug: string }
): Promise<LegalSkill | null> => {
  try {
    // Obtém a sessão atual para o cabeçalho Authorization
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch("/api/skills/upsert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session?.access_token ? { "Authorization": `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify(skill),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Erro HTTP ${response.status}`);
    }

    return (await response.json()) as LegalSkill;
  } catch (err) {
    console.error("[Sanfran] Erro no upsert da skill:", err);
    return null;
  }
};