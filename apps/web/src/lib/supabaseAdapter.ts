import { createClient } from "@supabase/supabase-js";
import { SkillDataAdapter, SkillQueryParams, SkillQueryResult } from "../components/useInfiniteSkills";
import { LegalSkill } from "../types";
import { mapDbSkillToLegalSkill } from "./skillMapper";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Sanfran] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY ausentes. Configure apps/web/.env e reinicie o servidor."
  );
}

/** Cliente Supabase — usado apenas para escrita (upsert) no browser. Leituras passam pela API local. */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  if (params.minQualityScore > 0) searchParams.set("minQualityScore", String(params.minQualityScore));
  searchParams.set("sortBy", params.sortBy);
  searchParams.set("pageSize", String(params.pageSize));
  if (params.cursor != null) searchParams.set("cursor", String(params.cursor));
  return `/api/skills?${searchParams.toString()}`;
}

export const createSupabaseAdapter = (): SkillDataAdapter => {
  return async (params: SkillQueryParams, signal: AbortSignal): Promise<SkillQueryResult> => {
    const response = await fetch(buildSkillsQuery(params), { signal });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const message = payload.error ?? `Erro HTTP ${response.status}`;
      throw new Error(message);
    }

    return response.json() as Promise<SkillQueryResult>;
  };
};

export async function fetchSkillBySlug(slug: string): Promise<LegalSkill | null> {
  const response = await fetch(`/api/skills/${encodeURIComponent(slug)}`);

  if (response.status === 404) return null;
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? `Erro HTTP ${response.status}`);
  }

  return response.json() as Promise<LegalSkill>;
}

export async function fetchCatalogStats(): Promise<CatalogStats> {
  const response = await fetch("/api/catalog/stats");

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? `Erro HTTP ${response.status}`);
  }

  return response.json() as Promise<CatalogStats>;
}

export const upsertSkill = async (
  skill: Partial<LegalSkill> & { author_id: string; slug: string }
): Promise<LegalSkill | null> => {
  const { data, error } = await supabase
    .from("skills")
    .upsert(skill, { onConflict: "slug" })
    .select(DETAIL_COLUMNS)
    .single();

  if (error) {
    console.error("Supabase upsert error:", error);
    return null;
  }

  return mapDbSkillToLegalSkill(data);
};
