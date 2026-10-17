/**
 * Ferramentas expostas pelo servidor MCP (/api/mcp).
 * `label` e `summary` são para o site (linguagem de quem trabalha com Direito);
 * `description` e `inputSchema` são para o modelo de IA.
 * Este arquivo não importa o catálogo, para poder ser usado em páginas sem carregar o índice.
 */

export interface McpToolDef {
  name: string;
  label: string;
  summary: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: Record<string, unknown>;
}

const READ_ONLY = { readOnlyHint: true, openWorldHint: false, idempotentHint: true };

export const MCP_TOOLS: McpToolDef[] = [
  {
    name: "buscar_skills",
    label: "Encontrar o procedimento certo",
    summary: "Procura, entre as skills jurídicas brasileiras, a que resolve a tarefa descrita na conversa.",
    description:
      "Busca skills jurídicas brasileiras (procedimentos de trabalho com fundamento legal) pelo que o usuário precisa fazer. " +
      "Use SEMPRE no início de uma tarefa jurídica brasileira — prazos, peças, contratos, LGPD, licitações, trabalhista, cálculos — " +
      "e depois chame obter_skill com o slug mais adequado. Retorna slug, título, área, tipo e status de revisão.",
    inputSchema: {
      type: "object",
      properties: {
        consulta: { type: "string", description: "O que o usuário precisa, em português. Ex.: 'contar prazo de contestação', 'revisar contrato de serviços'." },
        area: { type: "string", description: "Filtro opcional de área (veja listar_areas). Ex.: 'Processual', 'Contratos', 'LGPD'." },
        tipo: { type: "string", enum: ["motor", "execucao", "conhecimento"], description: "Filtro opcional por tipo de skill." },
        limite: { type: "integer", minimum: 1, maximum: 25, default: 8 },
      },
      required: ["consulta"],
      additionalProperties: false,
    },
    annotations: { title: "Buscar skills jurídicas", ...READ_ONLY },
  },
  {
    name: "obter_skill",
    label: "Seguir o procedimento",
    summary: "Carrega as instruções completas da skill, com as regras legais e o formato de resposta.",
    description:
      "Retorna o SKILL.md completo de uma skill: instruções passo a passo, regras legais, formato de resposta e limites. " +
      "Siga essas instruções para atender o usuário. Se a skill citar arquivos (references/, scripts/), use obter_arquivo_skill.",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string", description: "Identificador retornado por buscar_skills. Ex.: 'contagem-prazo'." } },
      required: ["slug"],
      additionalProperties: false,
    },
    annotations: { title: "Obter skill", ...READ_ONLY },
  },
  {
    name: "obter_arquivo_skill",
    label: "Consultar material de apoio",
    summary: "Abre tabelas, modelos e textos de referência que acompanham a skill.",
    description: "Retorna um arquivo de apoio de uma skill (ex.: references/clausulas-abusivas.md). Os caminhos disponíveis vêm em obter_skill.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        arquivo: { type: "string", description: "Caminho relativo dentro da skill, ex.: 'references/tipos-audiencia.md'." },
      },
      required: ["slug", "arquivo"],
      additionalProperties: false,
    },
    annotations: { title: "Obter arquivo de apoio", ...READ_ONLY },
  },
  {
    name: "listar_areas",
    label: "Ver o que existe",
    summary: "Mostra as áreas do catálogo e quantas skills há em cada uma.",
    description: "Lista as áreas do catálogo com a contagem de skills e os tipos disponíveis. Útil quando o usuário pergunta o que o sanfran sabe fazer.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { title: "Listar áreas", ...READ_ONLY },
  },
  {
    name: "validar_numero_cnj",
    label: "Conferir número de processo",
    summary: "Valida o dígito verificador e identifica tribunal, ano e origem de números de processo (padrão CNJ).",
    description:
      "Valida números de processo no padrão CNJ (Res. CNJ 65/2008): dígito verificador (módulo 97), segmento de justiça, tribunal, ano e origem. " +
      "Aceita uma lista de números OU um texto livre (e-mail, publicação) do qual os números são extraídos. " +
      "Use sempre esta ferramenta em vez de calcular o dígito verificador por conta própria. Não consulta tribunais nem traz partes.",
    inputSchema: {
      type: "object",
      properties: {
        numeros: { type: "array", items: { type: "string" }, maxItems: 1000, description: "Números com ou sem máscara." },
        texto: { type: "string", maxLength: 200000, description: "Texto livre para extrair os números." },
      },
      additionalProperties: false,
    },
    annotations: { title: "Validar número CNJ", ...READ_ONLY },
  },
];
