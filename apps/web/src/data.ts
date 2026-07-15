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

// Mock skills (example data)
export const MOCK_SKILLS: LegalSkill[] = [
  {
    id: "validador-peticao-cdc",
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
    updatedAt: "2026-06-02",
    qualityScore: 94,
    regulatoryScore: 100,
    complianceChecked: true,
    regulatoryIssues: 0,
    qualityBreakdown: {
      precisaoNormativa: 10,
      especificidade: 9,
      padraoEntrega: 10,
      limitesAutonomia: 9,
      atualizacao: 9
    },
    markdownContent: `# Skill Jurídica: Validador de Petição Inicial Consumidora (CDC)
## 1. Goal
Validar petições iniciais de direito do consumidor antes do protocolo, garantindo preenchimento dos requisitos do Art. 319 do CPC e pedidos mandatórios de inversão do ônus da prova.

## 2. Context & Core Norms
* **Art. 319 do CPC**: Requisitos essenciais da petição (fatos, qualificação, valor da causa, pedidos).
* **Art. 6º, VIII do CDC**: Direito básico do consumidor à facilitação de sua defesa, inclusive com inversão do ônus da prova.
* **Art. 18 do CDC**: Prazo de 30 dias para saneamento de vício pelo fornecedor antes de exigir abatimento ou troca.

## 3. Execution Levels
### Level 1: Standard Case
1. Verifica qualificação das partes, narrativa lógica dos fatos e o nexo causal de consumo.
2. Certifica se os detalhes estruturais da peça contêm o valor exato pretendido da causa.
3. Alerta caso falte o requerimento expresso do Art. 6º, VIII do CDC sobre inversão do ônus probatório.

### Level 2: Exceptional Handling
1. **Ausência de Reclamação Administrativa**: Se a petição reclama de vício de produto eletrônico mas não anexa prova de solicitação via administrativamente (consumidor.gov.br ou protocolo da assistência), o agente sinaliza risco de extinção por falta de interesse de agir e sugere redação preventiva de notificação.
2. **Dano Moral Genérico**: Caso alegue 'dano moral' puramente sem demonstrar violação a direitos da personalidade, emite desaconselhamento e sugere nexo causal fático claro.

### Level 3: Hard Boundaries & Grounding
1. **Discussão de Danos Corporais Complexos**: Se o vício do produto causou lesões de saúde graves (fato do produto complexo), instrui o usuário a desabilitar respostas automáticas de IA e solicitar uma perícia médico-legal imediatamente.
2. **Limite de Alocação**: Proibir recomendações de tutela de urgência sem verificação pragmática dos pressupostos do Art. 300 do CPC.

## 4. Test Cases & Expected Formats
### Input Text
Exemplo de e‑mail ou rascunho de contestação ou inicial que queira auditar.

### Output
Lista de pendências jurídicas com as referências exatas do CDC e CPC correspondentes.`,
    playgroundTestInput: "Entrei com ação contra fabricante do meu celular que quebrou após 2 meses. Pedi R$ 10.000,00 de danos morais de forma rápida e sumária. Não cheguei a procurar a fabricante porque estava muito irritado com o ocorrido.",
    playgroundExpectedOutput: "Aviso: Há alto risco de extinção sem resolução do mérito por falta de interesse processual se o vício de produto for alegado judicialmente antes de oportunizar o prazo legal de 30 dias para a fabricante resolver o problema (Art. 18, §1º do CDC). Recomenda-se realizar reclamação administrativa prévia via consumidor.gov.br."
  },
];