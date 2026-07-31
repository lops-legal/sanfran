import { LegalSkill } from "./types";
import { mapDbSkillToLegalSkill } from "./skillMapper";

export interface CatalogStats {
  totalPublished: number;
  totalOabVerified: number;
  totalDownloads: number;
  verticalCounts: Record<string, number>;
  taskCategoryCounts: Record<string, number>;
}

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

function buildSkillsUrl(params: SkillQueryParams): string {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.vertical) searchParams.set("vertical", params.vertical);
  if (params.taskCategory) searchParams.set("taskCategory", params.taskCategory);
  if ((params.minQualityScore ?? 0) > 0) searchParams.set("minQualityScore", String(params.minQualityScore));
  searchParams.set("sortBy", params.sortBy ?? "stars");
  searchParams.set("pageSize", String(params.pageSize ?? 12));
  if (params.cursor != null) searchParams.set("cursor", String(params.cursor));
  return `${API_BASE}/api/skills?${searchParams.toString()}`;
}

export async function fetchSkills(params: SkillQueryParams = {}): Promise<SkillQueryResult> {
  try {
    const res = await fetch(buildSkillsUrl(params), { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<SkillQueryResult>;
  } catch {
    return { skills: [], nextCursor: null, total: 0 };
  }
}

export async function fetchSkillBySlug(slug: string): Promise<LegalSkill | null> {
  try {
    const res = await fetch(`${API_BASE}/api/skills/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<LegalSkill>;
  } catch {
    return null;
  }
}

export async function fetchCatalogStats(): Promise<CatalogStats> {
  try {
    const res = await fetch(`${API_BASE}/api/catalog/stats`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<CatalogStats>;
  } catch {
    return FALLBACK_STATS;
  }
}
