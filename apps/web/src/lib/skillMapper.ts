import { LegalSkill } from "../types";

type DbSkillRow = Record<string, unknown>;

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function str(value: unknown, fallback = ""): string {
  return value == null ? fallback : String(value);
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function mapQualityBreakdown(raw: unknown): LegalSkill["qualityBreakdown"] {
  const qb = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    precisaoNormativa: num(qb.precisaoNormativa ?? qb.precisao_normativa),
    especificidade: num(qb.especificidade),
    padraoEntrega: num(qb.padraoEntrega ?? qb.padrao_entrega),
    limitesAutonomia: num(qb.limitesAutonomia ?? qb.limites_autonomia),
    atualizacao: num(qb.atualizacao),
  };
}

export function mapDbSkillToLegalSkill(row: DbSkillRow): LegalSkill {
  return {
    id: str(row.id),
    slug: row.slug ? str(row.slug) : undefined,
    name: str(row.name),
    ownerName: str(row.author_id || row.author_org, "Sanfran"),
    ownerAvatar: str(row.owner_avatar, "⚖️"),
    description: str(row.description),
    markdownContent: str(row.markdown_body ?? row.markdownContent),
    rating: num(row.rating),
    reviewCount: num(row.review_count),
    starsCount: num(row.stars_count),
    downloadsCount: num(row.downloads_count ?? row.stars_count),
    tags: stringArray(row.tags),
    vertical: str(row.vertical, "Processual"),
    qualityScore: num(row.quality_score),
    regulatoryScore: num(row.regulatory_score),
    qualityBreakdown: mapQualityBreakdown(row.quality_breakdown ?? row.qualityBreakdown),
    regulatoryIssues: num(row.regulatory_issues),
    version: str(row.version, "1.0.0"),
    updatedAt: str(row.updated_at ?? row.published_at ?? row.created_at, new Date().toISOString()),
    complianceChecked: Boolean(row.compliance_checked),
    playgroundTestInput: row.playground_test_input ? str(row.playground_test_input) : undefined,
    playgroundExpectedOutput: row.playground_expected_output ? str(row.playground_expected_output) : undefined,
    playgroundSystemPrompt: row.playground_system_prompt ? str(row.playground_system_prompt) : undefined,
    authorOrganization: row.author_org ? str(row.author_org) : undefined,
    objective: row.objective ? str(row.objective) : undefined,
    useCase: row.use_case ? str(row.use_case) : undefined,
    legalArea: row.legal_area ? str(row.legal_area) : undefined,
    workflow: row.workflow ? str(row.workflow) : undefined,
    professionalRole: row.professional_role ? str(row.professional_role) : undefined,
  };
}

export function mapDbSkillsToLegalSkills(rows: DbSkillRow[] | null | undefined): LegalSkill[] {
  return (rows ?? []).map(mapDbSkillToLegalSkill);
}

/** Maps domain LegalSkill fields to Supabase column names for writes. */
export function toDbPayload(
  skill: Partial<LegalSkill> & { author_id: string; slug: string }
): Record<string, unknown> {
  return {
    slug: skill.slug,
    name: skill.name,
    description: skill.description,
    markdown_body: skill.markdownContent,
    version: skill.version ?? "1.0.0",
    author_id: skill.author_id,
    owner_avatar: skill.ownerAvatar ?? "⚖️",
    vertical: skill.vertical,
    tags: skill.tags ?? [],
    quality_score: skill.qualityScore ?? 80,
    regulatory_score: skill.regulatoryScore ?? 80,
    compliance_checked: skill.complianceChecked ?? false,
    stars_count: skill.starsCount ?? 0,
    downloads_count: skill.downloadsCount ?? skill.starsCount ?? 0,
    review_count: skill.reviewCount ?? 0,
    rating: skill.rating ?? 0,
  };
}
