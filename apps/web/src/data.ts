import { LegalSkill, VerticalCategory, TaskCategory, FaqItem } from "./types";
import { SECURITY_CRITERIA } from "./constants/security";

// Vertical categories
export const VERTICALS: VerticalCategory[] = [
  {
    id: "Trabalhista",
    name: "Direito Trabalhista",
    icon: "Briefcase",
    count: 24,
    description: "Análise de acordos de jornada, horas extras habituais, verbas rescisórias e terceirizações sob as regras da CLT e súmulas do TST.",
    accentClass: "border-red-500/50 hover:border-red-500 text-red-400"
  },
  {
    id: "LGPD",
    name: "Proteção de Dados & LGPD",
    icon: "ShieldAlert",
    count: 18,
    description: "Conformidade de termos de uso, políticas de privacidade pactuadas, cláusulas de transferência internacional e canais de DPO.",
    accentClass: "border-emerald-500/50 hover:border-emerald-500 text-emerald-400"
  },
  {
    id: "Consumidor",
    name: "Direito do Consumidor",
    icon: "ShoppingBag",
    count: 31,
    description: "Vício do produto, cobranças indevidas, venda casada e direito de arrependimento regulados pelo CDC.",
    accentClass: "border-amber-500/50 hover:border-amber-500 text-amber-400"
  },
  {
    id: "Societario",
    name: "Contratos & Societário",
    icon: "FileSignature",
    count: 27,
    description: "Análise de multas penitenciárias, cláusula penal de fidelização, limitação de responsabilidade e acordos corporativos estritos.",
    accentClass: "border-blue-500/50 hover:border-blue-500 text-blue-400"
  },
  {
    id: "Processual",
    name: "Prática Processual Civ.",
    icon: "Scale",
    count: 15,
    description: "Triagem de prazos recursais, pressupostos de admissibilidade, requisitos das petições iniciais (Art. 319 do CPC) e recursos.",
    accentClass: "border-purple-500/50 hover:border-purple-500 text-purple-400"
  }
];

// Task categories
export const TASK_CATEGORIES: TaskCategory[] = [
  { id: "auditoria", name: "Auditoria de Contratos", count: 42 },
  { id: "peticao", name: "Redação de Peças", count: 28 },
  { id: "compliance", name: "Checklists de Compliance", count: 35 },
  { id: "notificacao", name: "Respostas a Notificações", count: 19 },
  { id: "pesquisa", name: "Pareceres & Pesquisa", count: 22 }
];

// Frequently asked questions
export const FAQS: FaqItem[] = [
  {
    question: "O que é uma 'Skill Jurídica' ou arquivo SKILL.md?",
    answer: "Trata-se de um conjunto de regras estruturadas, metas de processo e caminhos normativos explicados para agentes de Inteligência Artificial populares (Claude, ChatGPT, Cursor). Ele define quais artigos de lei devem ser rigidamente verificados, que exceções comerciais tratar e onde a IA deve travar por falta de escopo legal, evitando alucinações absurdas."
  },
  {
    question: "Qual a diferença entre o Quality Score e o Compliance checked?",
    answer: "O Quality Score mede a solidez técnica da especificação da skill jurídica (como presença clara de limites de escopo e casos de teste). O selo de Compliance checked certifica que a skill passou pela auditoria contra violações éticas e atritos com a regulação da OAB para ferramentas de apoio jurídico administrativo."
  },
  {
    question: "Como eu instalo uma skill jurídica no meu agente de IA?",
    answer: "Toda skill publicada no Sanfran.md pode ser copiada com um clique em markdown bruto ou importada diretamente como instrução de sistema (System prompt) no Claude projects, custom GPTs ou no arquivo .cursorrules de seu projeto de desenvolvimento local."
  }
];

// ============================================================
// MOCK SKILLS — 8 skills jurídicas para fallback + testes
// ============================================================
const BASE_MARKDOWN = `## 1. Goal
Fornecer análise jurídica especializada para a área correspondente, seguindo a legislação brasileira vigente e jurisprudência dos tribunais superiores.

## 2. Context & Core Norms
* **Legislação aplicável**: Códigos e leis federais conforme a área de atuação.
* **Jurisprudência**: Súmulas do STF, STJ e TST quando aplicáveis.
* **Limites de atuação**: A IA deve alertar quando o caso exigir análise humana especializada.

## 3. Execution Levels
### Level 1: Standard Case
1. Identificar a área jurídica e a legislação aplicável.
2. Analisar os fatos à luz da legislação vigente.
3. Fornecer orientação fundamentada com artigos de lei.

### Level 2: Exceptional Handling
1. **Casos complexos**: Quando houver divergência jurisprudencial, apresentar ambos os entendimentos.
2. **Limites de escopo**: Alertar quando o caso exigir análise de advogado.

### Level 3: Hard Boundaries
1. **Proibido**: Oferecer garantia de resultado ou substituir advogado constituído.
2. **Proibido**: Ignorar prazos processuais ou requisitos formais.`;

const BASE_SECURITY_CRITERIA = [
  { id: "sec-1", description: "LGPD - Proteção de dados pessoais", category: "Privacidade", severity: "low" as const },
  { id: "sec-2", description: "Sigilo profissional advogado-cliente", category: "Ética", severity: "low" as const },
  { id: "sec-3", description: "Vieses algorítmicos em recomendações jurídicas", category: "Ética", severity: "low" as const },
];

export const MOCK_SKILLS: LegalSkill[] = [
  {
    id: "validador-peticao-cdc",
    slug: "validador-peticao-cdc",
    name: "Validador de Petição Inicial Consumidora (Art. 319 CPC & CDC)",
    ownerName: "xi-de-agosto",
    ownerAvatar: "⚖️",
    description: "Verifica se queixas de vício de produto ou serviços contêm os requisitos formais de admissibilidade do CPC e se invocam as inversões de ônus cabíveis do CDC.",
    tags: ["Consumidor", "Processual", "Inicial"],
    vertical: "Consumidor",
    rating: 4.9,
    reviewCount: 34,
    starsCount: 1850,
    version: "2.1.0",
    updatedAt: "2026-07-15",
    qualityScore: 94,
    regulatoryScore: 100,
    complianceChecked: true,
    regulatoryIssues: 0,
    qualityBreakdown: { precisaoNormativa: 10, especificidade: 9, padraoEntrega: 10, limitesAutonomia: 9, atualizacao: 9 },
    markdownContent: BASE_MARKDOWN,
    objective: "Validar petições iniciais de direito do consumidor antes do protocolo.",
    useCase: "Auditoria de petições iniciais consumidoras",
    workflow: "Copy-paste da petição → análise automática → relatório de pendências",
    professionalRole: "Advogado consumidorista",
    securityCriteria: BASE_SECURITY_CRITERIA,
  },
  {
    id: "analise-contrato-clt",
    slug: "analise-contrato-clt",
    name: "Análise de Contrato CLT",
    ownerName: "garra-aberta",
    ownerAvatar: "📋",
    description: "Identificação de riscos contratuais e conformidade com a Reforma Trabalhista de 2017 e jurisprudência do TST.",
    tags: ["Trabalhista", "Contratos", "CLT"],
    vertical: "Trabalhista",
    rating: 4.8,
    reviewCount: 27,
    starsCount: 1200,
    version: "1.3.0",
    updatedAt: "2026-07-10",
    qualityScore: 98,
    regulatoryScore: 95,
    complianceChecked: true,
    regulatoryIssues: 0,
    qualityBreakdown: { precisaoNormativa: 10, especificidade: 10, padraoEntrega: 9, limitesAutonomia: 10, atualizacao: 9 },
    markdownContent: BASE_MARKDOWN,
    objective: "Analisar contratos CLT identificando cláusulas de risco.",
    useCase: "Revisão de contratos trabalhistas",
    workflow: "Upload do contrato → análise de cláusulas → relatório de riscos",
    professionalRole: "Advogado trabalhista",
    securityCriteria: BASE_SECURITY_CRITERIA,
  },
  {
    id: "peticao-indenizacao",
    slug: "peticao-indenizacao",
    name: "Petição Inicial: Indenização",
    ownerName: "sao-francisco",
    ownerAvatar: "📝",
    description: "Geração de exordial para ações de cobrança e danos morais baseada em fatos jurídicos fornecidos pelo usuário.",
    tags: ["Cível", "Indenização", "Petição"],
    vertical: "Processual",
    rating: 4.7,
    reviewCount: 42,
    starsCount: 3400,
    version: "3.0.0",
    updatedAt: "2026-07-20",
    qualityScore: 94,
    regulatoryScore: 90,
    complianceChecked: true,
    regulatoryIssues: 1,
    qualityBreakdown: { precisaoNormativa: 9, especificidade: 9, padraoEntrega: 10, limitesAutonomia: 9, atualizacao: 9 },
    markdownContent: BASE_MARKDOWN,
    objective: "Gerar petições iniciais de indenização completas.",
    useCase: "Elaboração de ações indenizatórias",
    workflow: "Fatos do cliente → estruturação jurídica → petição pronta",
    professionalRole: "Advogado cível",
    securityCriteria: BASE_SECURITY_CRITERIA,
    playgroundTestInput: "Cliente sofreu acidente de trânsito com danos materiais de R$ 15.000 e morais.",
    playgroundExpectedOutput: "Petição inicial completa com fundamentação no CC e CDC.",
  },
  {
    id: "parecer-icms-st",
    slug: "parecer-icms-st",
    name: "Parecer ICMS-ST Interestadual",
    ownerName: "tributa-facil",
    ownerAvatar: "💰",
    description: "Análise complexa de substituição tributária de ICMS para operações interestaduais com base no CONFAZ e jurisprudência do STF.",
    tags: ["Tributário", "ICMS", "ST"],
    vertical: "Societario",
    rating: 4.9,
    reviewCount: 18,
    starsCount: 850,
    version: "1.1.0",
    updatedAt: "2026-07-05",
    qualityScore: 99,
    regulatoryScore: 98,
    complianceChecked: true,
    regulatoryIssues: 0,
    qualityBreakdown: { precisaoNormativa: 10, especificidade: 10, padraoEntrega: 10, limitesAutonomia: 9, atualizacao: 10 },
    markdownContent: BASE_MARKDOWN,
    objective: "Emitir pareceres sobre ICMS-ST em operações interestaduais.",
    useCase: "Consultoria tributária empresarial",
    workflow: "Dados da operação → enquadramento legal → parecer completo",
    professionalRole: "Advogado tributarista",
    securityCriteria: BASE_SECURITY_CRITERIA,
  },
  {
    id: "auditoria-due-diligence",
    slug: "auditoria-due-diligence",
    name: "Auditoria de Due Diligence",
    ownerName: "corp-legal",
    ownerAvatar: "🏢",
    description: "Varredura automatizada de passivos ocultos em documentos societários e certidões para processos de M&A.",
    tags: ["Empresarial", "Due Diligence", "M&A"],
    vertical: "Societario",
    rating: 4.8,
    reviewCount: 31,
    starsCount: 2100,
    version: "2.2.0",
    updatedAt: "2026-07-12",
    qualityScore: 96,
    regulatoryScore: 95,
    complianceChecked: true,
    regulatoryIssues: 0,
    qualityBreakdown: { precisaoNormativa: 9, especificidade: 10, padraoEntrega: 10, limitesAutonomia: 9, atualizacao: 9 },
    markdownContent: BASE_MARKDOWN,
    objective: "Automatizar auditoria de documentos societários para Due Diligence.",
    useCase: "Processos de fusão e aquisição",
    workflow: "Upload de documentos → varredura de passivos → relatório executivo",
    professionalRole: "Advogado empresarial",
    securityCriteria: BASE_SECURITY_CRITERIA,
  },
  {
    id: "calculo-rescisao",
    slug: "calculo-rescisao",
    name: "Cálculo de Rescisão Trabalhista",
    ownerName: "trab-facil",
    ownerAvatar: "🧮",
    description: "Cálculo automatizado de verbas rescisórias incluindo aviso-prévio, multa do FGTS e férias proporcionais.",
    tags: ["Trabalhista", "Rescisão", "Cálculo"],
    vertical: "Trabalhista",
    rating: 4.6,
    reviewCount: 53,
    starsCount: 4700,
    version: "1.5.0",
    updatedAt: "2026-06-28",
    qualityScore: 91,
    regulatoryScore: 88,
    complianceChecked: true,
    regulatoryIssues: 2,
    qualityBreakdown: { precisaoNormativa: 9, especificidade: 9, padraoEntrega: 9, limitesAutonomia: 8, atualizacao: 9 },
    markdownContent: BASE_MARKDOWN,
    objective: "Calcular verbas rescisórias trabalhistas com precisão.",
    useCase: "Cálculos de rescisão para RH e advogados",
    workflow: "Dados do funcionário → cálculo automático → demonstrativo detalhado",
    professionalRole: "Advogado trabalhista / RH",
    securityCriteria: BASE_SECURITY_CRITERIA,
    playgroundTestInput: "Salário R$ 3.500, data de admissão 01/01/2020, demissão sem justa causa em 30/06/2026.",
    playgroundExpectedOutput: "Valor total da rescisão: R$ XX.XXX,XX com detalhamento de cada verba.",
  },
  {
    id: "redator-contratos-sociais",
    slug: "redator-contratos-sociais",
    name: "Redator de Contratos Sociais",
    ownerName: "societario-pro",
    ownerAvatar: "📄",
    description: "Estruturação de S/A e LTDA conforme DREI, com cláusulas padronizadas e compliance societário.",
    tags: ["Empresarial", "Contratos", "Societário"],
    vertical: "Societario",
    rating: 4.7,
    reviewCount: 22,
    starsCount: 1800,
    version: "1.0.0",
    updatedAt: "2026-07-18",
    qualityScore: 97,
    regulatoryScore: 92,
    complianceChecked: false,
    regulatoryIssues: 3,
    qualityBreakdown: { precisaoNormativa: 10, especificidade: 9, padraoEntrega: 10, limitesAutonomia: 9, atualizacao: 9 },
    markdownContent: BASE_MARKDOWN,
    objective: "Redigir contratos sociais e alterações conforme DREI.",
    useCase: "Abertura e alteração de empresas",
    workflow: "Dados da empresa → estruturação jurídica → contrato social pronto",
    professionalRole: "Advogado societário",
    securityCriteria: BASE_SECURITY_CRITERIA,
  },
  {
    id: "politica-privacidade-lgpd",
    slug: "politica-privacidade-lgpd",
    name: "Política de Privacidade LGPD",
    ownerName: "data-guard",
    ownerAvatar: "🔒",
    description: "Geração de políticas de privacidade e termos de uso em conformidade com a LGPD, adequadas ao porte e atividade da empresa.",
    tags: ["LGPD", "Privacidade", "Compliance"],
    vertical: "LGPD",
    rating: 4.9,
    reviewCount: 39,
    starsCount: 3200,
    version: "2.0.0",
    updatedAt: "2026-07-22",
    qualityScore: 95,
    regulatoryScore: 98,
    complianceChecked: true,
    regulatoryIssues: 0,
    qualityBreakdown: { precisaoNormativa: 10, especificidade: 9, padraoEntrega: 10, limitesAutonomia: 9, atualizacao: 10 },
    markdownContent: BASE_MARKDOWN,
    objective: "Gerar políticas de privacidade conforme LGPD.",
    useCase: "Adequação de empresas à LGPD",
    workflow: "Dados da empresa → geração da política → documentos prontos",
    professionalRole: "DPO / Advogado LGPD",
    securityCriteria: BASE_SECURITY_CRITERIA,
    playgroundTestInput: "Empresa de e-commerce com 50 funcionários, coleta dados de clientes para vendas online.",
    playgroundExpectedOutput: "Política de privacidade completa nos termos da LGPD.",
  },
];