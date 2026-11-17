/** Skill versionada no repositório (content/skills). Gerada por scripts/build-skills-index.mjs. */
export interface RepoSkill {
  slug: string;
  title: string;
  description: string;
  license: string;
  version: string;
  author: string;
  origin: string | null;
  type: "motor" | "execucao" | "conhecimento";
  area: string;
  personas: string[];
  tags: string[];
  legalBasis: { ref: string; url: string | null; checkedAt: string | null }[];
  review: { status: "rascunho" | "em-revisao" | "revisada"; reviewer: string | null; reviewedAt: string | null };
  updatedAt: string;
  files: string[];
  markdown: string;
  /** Conteúdo dos arquivos de apoio (references/, scripts/, evals/, sanfran.yaml), por caminho relativo. */
  references: Record<string, string>;
}
