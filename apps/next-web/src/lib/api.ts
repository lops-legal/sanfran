import { LegalSkill } from "./types";
import { MOCK_SKILLS } from "./data";

export interface CatalogStats {
  totalPublished: number;
  totalOabVerified: number;
  totalDownloads: number;
  verticalCounts: Record<string, number>;
  taskCategoryCounts: Record<string, number>;
}

export const FALLBACK_STATS: CatalogStats = {
  totalPublished: 22,
  totalOabVerified: 18,
  totalDownloads: 12450,
  verticalCounts: {
    Trabalhista: 2,
    LGPD: 3,
    Consumidor: 1,
    Societario: 8,
    Processual: 8,
  },
  taskCategoryCounts: {
    auditoria: 5,
    peticao: 4,
    compliance: 5,
    notificacao: 3,
    pesquisa: 5,
  },
};

/**
 * Endpoints locais do Next.js (Route Handlers em src/app/api).
 * Os Route Handlers consultam o Supabase no servidor com a service role
 * e mantêm fallback mock apenas em caso de erro real.
 */
const API_BASE = "/api";

export interface SkillQueryParams {
  search?: string;
  vertical?: string | null;
  taskCategory?: string | null;
  minQualityScore?: number;
  sortBy?: string;
  pageSize?: number;
  cursor?: number | null;
}

export interface SkillQueryResult {
  skills: LegalSkill[];
  nextCursor: number | null;
  total: number;
}

/** Fallback mock (sem rede) — usado também pelos Route Handlers. */
export function queryMockSkills(params: SkillQueryParams): SkillQueryResult {
  let filtered = [...MOCK_SKILLS];

  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
  }
  if (params.vertical) {
    filtered = filtered.filter((s) => s.vertical === params.vertical);
  }
  if ((params.minQualityScore ?? 0) > 0) {
    filtered = filtered.filter((s) => s.qualityScore >= params.minQualityScore!);
  }

  if (params.sortBy === "score") {
    filtered.sort((a, b) => b.qualityScore - a.qualityScore);
  } else if (params.sortBy === "recent") {
    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } else {
    filtered.sort((a, b) => b.starsCount - a.starsCount);
  }

  const pageSize = params.pageSize || 12;
  const cursor = params.cursor || 0;

  const skills = filtered.slice(cursor, cursor + pageSize);
  const nextCursor = cursor + pageSize < filtered.length ? cursor + pageSize : null;

  return { skills, nextCursor, total: filtered.length };
}

export async function fetchSkills(params: SkillQueryParams = {}): Promise<SkillQueryResult> {
  try {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set("search", params.search);
    if (params.vertical) searchParams.set("vertical", params.vertical);
    if (params.taskCategory) searchParams.set("taskCategory", params.taskCategory);
    if ((params.minQualityScore ?? 0) > 0) searchParams.set("minQualityScore", String(params.minQualityScore));
    searchParams.set("sortBy", params.sortBy ?? "stars");
    searchParams.set("pageSize", String(params.pageSize ?? 12));
    if (params.cursor != null) searchParams.set("cursor", String(params.cursor));

    const response = await fetch(`${API_BASE}/skills?${searchParams.toString()}`);
    if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
    return (await response.json()) as SkillQueryResult;
  } catch (err) {
    console.warn("[Sanfran] API /api/skills indisponível, usando mock:", err);
    return queryMockSkills(params);
  }
}

export async function fetchSkillBySlug(slug: string): Promise<LegalSkill | null> {
  try {
    const response = await fetch(`${API_BASE}/skills/${encodeURIComponent(slug)}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
    return (await response.json()) as LegalSkill;
  } catch (err) {
    console.warn("[Sanfran] API /api/skills/[slug] indisponível, usando mock:", err);
    return MOCK_SKILLS.find((s) => s.slug === slug || s.id === slug) ?? null;
  }
}

export async function fetchCatalogStats(): Promise<CatalogStats> {
  try {
    const response = await fetch(`${API_BASE}/catalog/stats`);
    if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
    return (await response.json()) as CatalogStats;
  } catch (err) {
    console.warn("[Sanfran] API /api/catalog/stats indisponível, usando fallback:", err);
    return FALLBACK_STATS;
  }
}

