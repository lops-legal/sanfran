/**
 * Colunas da tabela `skills` usadas em todo o app.
 * Centralizado para client e server usarem o mesmo contrato.
 */
export const SKILL_DETAIL_COLUMNS = `
  id, slug, name, description, version, markdown_body,
  author_id, author_org, owner_avatar, vertical, tags, legal_area,
  quality_score, regulatory_score, compliance_checked, quality_breakdown,
  stars_count, downloads_count, review_count, rating, hot_score,
  regulatory_issues, security_criteria_hits,
  playground_system_prompt, playground_test_input, playground_expected_output,
  objective, use_case, workflow, professional_role,
  updated_at, published_at, created_at
`;
