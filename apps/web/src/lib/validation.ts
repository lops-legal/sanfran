/**
 * Pydantic-style input validation for skill creation.
 * Validates all fields before sending to Supabase.
 */

export interface SkillValidationError {
  field: string;
  message: string;
}

export interface SkillInput {
  name: string;
  description: string;
  vertical: string;
  tags: string[];
  markdown_body: string;
  version?: string;
}

const VALID_VERTICALS = ["Trabalhista", "LGPD", "Consumidor", "Societario", "Processual"];
const NAME_MIN = 3;
const NAME_MAX = 120;
const DESC_MIN = 10;
const DESC_MAX = 500;
const MARKDOWN_MAX = 100_000; // 100KB
const TAGS_MAX = 10;
const TAG_MAX_LEN = 30;
const VERSION_REGEX = /^\d+\.\d+\.\d+$/;

/**
 * Validate skill input fields.
 * Returns an array of errors (empty if valid).
 */
export function validateSkillInput(input: SkillInput): SkillValidationError[] {
  const errors: SkillValidationError[] = [];

  // Name
  if (!input.name || input.name.trim().length < NAME_MIN) {
    errors.push({ field: "name", message: `Nome deve ter pelo menos ${NAME_MIN} caracteres.` });
  } else if (input.name.length > NAME_MAX) {
    errors.push({ field: "name", message: `Nome não pode exceder ${NAME_MAX} caracteres.` });
  }

  // Description
  if (!input.description || input.description.trim().length < DESC_MIN) {
    errors.push({ field: "description", message: `Descrição deve ter pelo menos ${DESC_MIN} caracteres.` });
  } else if (input.description.length > DESC_MAX) {
    errors.push({ field: "description", message: `Descrição não pode exceder ${DESC_MAX} caracteres.` });
  }

  // Vertical
  if (!VALID_VERTICALS.includes(input.vertical)) {
    errors.push({
      field: "vertical",
      message: `Vertical inválida. Opções: ${VALID_VERTICALS.join(", ")}.`,
    });
  }

  // Tags
  if (input.tags.length > TAGS_MAX) {
    errors.push({ field: "tags", message: `No máximo ${TAGS_MAX} tags.` });
  }
  for (const tag of input.tags) {
    if (tag.length > TAG_MAX_LEN) {
      errors.push({ field: "tags", message: `Tag "${tag}" excede ${TAG_MAX_LEN} caracteres.` });
      break;
    }
  }

  // Markdown body
  if (input.markdown_body && input.markdown_body.length > MARKDOWN_MAX) {
    errors.push({ field: "markdown_body", message: `Corpo do markdown excede o limite de ${MARKDOWN_MAX / 1000}KB.` });
  }

  // Version
  if (input.version && !VERSION_REGEX.test(input.version)) {
    errors.push({ field: "version", message: "Versão deve seguir o formato semântico (ex: 1.0.0)." });
  }

  return errors;
}
