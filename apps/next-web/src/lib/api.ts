import { LegalSkill } from "./types";
import { mapDbSkillToLegalSkill } from "./skillMapper";
import { MOCK_SKILLS } from "./data";

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
  let filtered = [...MOCK_SKILLS];
  
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
  }
  if (params.vertical) {
    filtered = filtered.filter(s => s.vertical === params.vertical);
  }
  if ((params.minQualityScore ?? 0) > 0) {
    filtered = filtered.filter(s => s.qualityScore >= params.minQualityScore!);
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

export async function fetchSkillBySlug(slug: string): Promise<LegalSkill | null> {
  return MOCK_SKILLS.find(s => s.slug === slug) || null;
}

export async function fetchCatalogStats(): Promise<CatalogStats> {
  return FALLBACK_STATS;
}
