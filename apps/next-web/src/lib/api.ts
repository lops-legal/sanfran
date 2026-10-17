import { LegalSkill } from "./types";

export interface CatalogStats {
  totalPublished: number;
  totalOabVerified: number;
  totalDownloads: number;
  verticalCounts: Record<string, number>;
  taskCategoryCounts: Record<string, number>;
}

/** Sem dados: nunca exibir números inventados. */
export const FALLBACK_STATS: CatalogStats = {
  totalPublished: 0,
  totalOabVerified: 0,
  totalDownloads: 0,
  verticalCounts: {},
  taskCategoryCounts: {},
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

/** Resultado vazio usado quando a API está indisponível no navegador. */
export function emptySkillResult(): SkillQueryResult {
  return { skills: [], nextCursor: null, total: 0 };
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
    console.warn("[Sanfran] API /api/skills indisponível:", err);
    return emptySkillResult();
  }
}

export async function fetchSkillBySlug(slug: string): Promise<LegalSkill | null> {
  try {
    const response = await fetch(`${API_BASE}/skills/${encodeURIComponent(slug)}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
    return (await response.json()) as LegalSkill;
  } catch (err) {
    console.warn("[Sanfran] API /api/skills/[slug] indisponível:", err);
    return null;
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

