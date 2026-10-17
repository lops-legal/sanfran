import type { LegalSkill } from "./types";
import type { RepoSkill } from "./repo-skill";
import { SKILLS_INDEX } from "./generated/skills-index";
import type { CatalogStats, SkillQueryParams, SkillQueryResult } from "./api";

/**
 * Catálogo de skills versionadas no repositório (content/skills).
 * Só pode ser importado no servidor: o índice inclui o conteúdo completo das skills.
 */

export const REPO_SKILLS: RepoSkill[] = SKILLS_INDEX;

const REVIEW_LABEL: Record<RepoSkill["review"]["status"], string> = {
  rascunho: "Rascunho",
  "em-revisao": "Em revisão",
  revisada: "Revisada",
};

export function reviewLabel(skill: RepoSkill) {
  return REVIEW_LABEL[skill.review.status];
}

export function getRepoSkill(slug: string): RepoSkill | undefined {
  return REPO_SKILLS.find((s) => s.slug === slug);
}

const ZERO_BREAKDOWN = { precisaoNormativa: 0, especificidade: 0, padraoEntrega: 0, limitesAutonomia: 0, atualizacao: 0 };

export function toLegalSkill(s: RepoSkill): LegalSkill {
  return {
    id: s.slug,
    slug: s.slug,
    name: s.title,
    ownerName: s.author,
    ownerAvatar: "",
    description: s.description,
    markdownContent: s.markdown,
    rating: 0,
    reviewCount: 0,
    starsCount: 0,
    downloadsCount: 0,
    tags: s.tags,
    vertical: s.area,
    qualityScore: 0,
    regulatoryScore: 0,
    qualityBreakdown: ZERO_BREAKDOWN,
    regulatoryIssues: 0,
    version: s.version,
    updatedAt: s.updatedAt,
    complianceChecked: s.review.status === "revisada",
    legalArea: s.area,
    professionalRole: s.personas.join(", "),
    authorOrganization: s.author,
    reviewStatus: s.review.status,
    skillType: s.type,
    legalBasis: s.legalBasis,
    files: s.files,
  };
}

/** Busca simples por texto (título, descrição, tags), sem acento e sem caixa. */
export function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function searchRepoSkills(query = "", filters: { area?: string | null; type?: string | null } = {}): RepoSkill[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return REPO_SKILLS.map((s) => {
    const hay = normalize([s.slug, s.title, s.description, s.area, ...s.tags, ...s.personas].join(" "));
    const title = normalize(s.title + " " + s.slug);
    const score = terms.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0) + (title.includes(t) ? 2 : 0), 0);
    return { s, score };
  })
    .filter(({ s, score }) => (terms.length === 0 || score > 0) && (!filters.area || s.area === filters.area) && (!filters.type || s.type === filters.type))
    .sort((a, b) => b.score - a.score || a.s.title.localeCompare(b.s.title, "pt-BR"))
    .map(({ s }) => s);
}

export function queryRepoSkills(params: SkillQueryParams): SkillQueryResult {
  let list = searchRepoSkills(params.search ?? "", { area: params.vertical });
  if (params.sortBy === "recent") list = [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const pageSize = Math.max(1, Math.min(params.pageSize ?? 12, 50));
  const cursor = params.cursor ?? 0;
  const page = list.slice(cursor, cursor + pageSize);
  return { skills: page.map(toLegalSkill), nextCursor: cursor + pageSize < list.length ? cursor + pageSize : null, total: list.length };
}

export function repoStats(): CatalogStats {
  const verticalCounts: Record<string, number> = {};
  for (const s of REPO_SKILLS) verticalCounts[s.area] = (verticalCounts[s.area] ?? 0) + 1;
  return {
    totalPublished: REPO_SKILLS.length,
    totalOabVerified: REPO_SKILLS.filter((s) => s.review.status === "revisada").length,
    totalDownloads: 0,
    verticalCounts,
    taskCategoryCounts: {},
  };
}
