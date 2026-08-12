import { LegalSkill } from "./types";

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
    starsCount: num(row.stars_count ?? row.downloads_count),
    downloadsCount: row.downloads_count != null ? num(row.downloads_count) : undefined,
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

/**
 * Mapeia o objeto LegalSkill (frontend) para o formato do banco de dados (snake_case).
 */
export function mapLegalSkillToDb(skill: Partial<LegalSkill>): Record<string, any> {
  const db: Record<string, any> = {};
  
  if (skill.id) db.id = skill.id;
  if (skill.slug) db.slug = skill.slug;
  if (skill.name) db.name = skill.name;
  if (skill.description) db.description = skill.description;
  if (skill.markdownContent) db.markdown_body = skill.markdownContent;
  if (skill.version) db.version = skill.version;
  if (skill.authorProfile) db.author_id = skill.authorProfile;
  if (skill.authorOrganization) db.author_org = skill.authorOrganization;
  if (skill.ownerAvatar) db.owner_avatar = skill.ownerAvatar;
  if (skill.vertical) db.vertical = skill.vertical;
  if (skill.tags) db.tags = skill.tags;
  if (skill.qualityScore !== undefined) db.quality_score = skill.qualityScore;
  if (skill.regulatoryScore !== undefined) db.regulatory_score = skill.regulatoryScore;
  if (skill.complianceChecked !== undefined) db.compliance_checked = skill.complianceChecked;
  if (skill.objective) db.objective = skill.objective;
  if (skill.useCase) db.use_case = skill.useCase;
  if (skill.workflow) db.workflow = skill.workflow;
  if (skill.professionalRole) db.professional_role = skill.professionalRole;
  if (skill.playgroundSystemPrompt) db.playground_system_prompt = skill.playgroundSystemPrompt;
  if (skill.playgroundTestInput) db.playground_test_input = skill.playgroundTestInput;
  if (skill.playgroundExpectedOutput) db.playground_expected_output = skill.playgroundExpectedOutput;

  return db;
}
