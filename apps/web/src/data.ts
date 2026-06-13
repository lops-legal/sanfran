import { LegalSkill, VerticalCategory, TaskCategory, FaqItem } from "./types";
import { SECURITY_CRITERIA } from "./constants/security";

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

export const TASK_CATEGORIES: TaskCategory[] = [
  { id: "auditoria", name: "Auditoria de Contratos", count: 42 },
  { id: "peticao", name: "Redação de Peças", count: 28 },
  { id: "compliance", name: "Checklists de Compliance", count: 35 },
  { id: "notificacao", name: "Respostas a Notificações", count: 19 },
  { id: "pesquisa", name: "Pareceres & Pesquisa", count: 22 }
];

export const FAQS: FaqItem[] = [
  {
    question: "O que é uma 'Skill Jurídica' ou arquivo SKILL.md?",
    answer: "Trata-se de um conjunto de regras estruturadas, metas de processo e caminhos normativos explicados para agentes de Inteligência Artificial populares (Claude, ChatGPT, Cursor). Ele define quais artigos de lei devem ser rigidamente verificados, que exceções comerciais tratar e onde a IA deve travar por falta de escopo legal, evitando alucinações absurdas."
  },
  {
    question: "Preciso saber programar para criar uma skill na Lex?",
    answer: "Absolutamente não! A Lex (nossa raposa assistente jurídica) foi desenhada para interagir de forma totalmente amigável por chat. Você pode instruí-la em linguagem natural corrente ('quero auditar cláusula de multa de academia no CDC') ou carregar algum rascunho em PDF e ela cuidará de estruturar tudo de forma visualmente imediata."
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
    markdownContent: `# Skill Jurídica: Validador de Petição Inicial Consumidora (CDC)
## 1. Goal
Validar petições iniciais de direito do consumidor antes do protocolo, garantindo preenchimento dos requisitos do Art. 319 do CPC e pedidos mandatórios de inversão do ônus da prova.

## 2. Context & Core Norms
* **Art. 319 do CPC**: Requisitos essenciais da petição (fatos, qualificação, valor da causa, pedidos).
* **Art. 6º, VIII do CDC**: Direito básico do consumidor à facilitação de sua defesa, inclusive com inversão do ônus da prova.
* **Art. 18 do CDC**: Prazo de 30 dias para saneamento de vício pelo fornecedor antes de exigir místico abatimento ou troca.

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
Exemplo de e-mail ou rascunho de contestação ou inicial que queira auditar.

### Output
Lista de pendências jurídicas com as referências exatas do CDC e CPC correspondentes.`,
    qualityBreakdown: {
      precisaoNormativa: 10,
      especificidade: 9,
      padraoEntrega: 10,
      limitesAutonomia: 9,
      atualizacao: 9
    },
    playgroundTestInput: "Entrei com ação contra fabricante do meu celular que quebrou após 2 meses. Pedi R$ 10.000,00 de danos morais de forma rápida e sumária. Não cheguei a procurar a fabricante porque estava muito irritado com o ocorrido.",
    playgroundExpectedOutput: "Aviso: Há alto risco de extinção sem resolução do mérito por falta de interesse processual se o vício de produto for alegado judicialmente antes de oportunizar o prazo legal de 30 dias para a fabricante resolver o problema (Art. 18, §1º do CDC). Recomenda-se realizar reclamação administrativa prévia via consumidor.gov.br."
  },
  {
    id: "auditor-terceirizacao-clt",
    name: "Auditor de Riscos de Terceirizações Trabalhistas (Regra CLT)",
    ownerName: "garra-aberta",
    ownerAvatar: "🎓",
    description: "Filtra indícios de vínculo de emprego oculto (pessoalidade, subordinação direta) em contratos comerciais de prestação de serviços com PJs.",
    tags: ["Trabalhista", "Societário", "Compliance"],
    vertical: "Trabalhista",
    rating: 4.8,
    reviewCount: 22,
    starsCount: 1420,
    version: "1.4.2",
    updatedAt: "2026-05-28",
    qualityScore: 88,
    regulatoryScore: 95,
    complianceChecked: true,
    regulatoryIssues: 0,
    markdownContent: `# Skill Jurídica: Auditor de Riscos em Terceirizações comerciais
## 1. Goal
Analisar criticamente minutas de prestação de serviços terceirizados, filtrando termos que possam caracterizar relação de emprego oculta (CLT Art. 3º) com o contratante.

## 2. Context & Core Norms
* **Art. 3º da CLT**: Requisitos do vínculo de emprego (Pessoalidade, Subordinação, Onerosidade, Habitualidade).
* **Lei 13.467/17 (Reforma Trabalhista)**: Regulamentação da terceirização de atividade-fim e salvaguardas (Art. 4º-A da Lei 6.019/74).
* **Súmula 331 do TST**: Responsabilidade subsidiária da tomadora de serviços.

## 3. Execution Levels
### Level 1: Standard Case
1. Escaneia o contrato em busca de cláusulas que designem o controle de jornada do prestador PJ pelo contratante (Gera alerta de risco severo de subordinação).
2. Valida se há menção de pessoalidade estrita (exemplo: 'o serviço deve ser prestado exclusivamente pelo Sr. X').
3. Garante que os pagamentos sejam referenciados à entrega e não a salários indexados de empregados internos.

### Level 2: Exceptional Handling
1. **Cláusulas de Exclusividade**: Cláusulas exigindo exclusividade total de pequenos prestadores de serviços são analisadas com cautela. Recomenda atenuação comercial de faturamento para evitar caracterizar dependência econômica monopolista.
2. **Substituição de Profissional**: Se o contrato veda em absoluto a substituição do executor técnico do serviço PJ, insere automaticamente recomendação de flexibilização de indicação de equipe técnica do parceiro.

### Level 3: Hard Boundaries & Grounding
1. **Cooperativas de Trabalho**: No caso de envolver cooperativas de trabalho, exige aplicação rígida dos requisitos organizacionais da Lei 12.690/12, desconsiderando a avaliação superficial da CLT se não houver tais documentos integrados.
2. **Limite de Atuação**: Vedado sugerir esquemas de sonegação tributária ou mascaramento intencional de empregados regulares.

## 4. Test Cases & Expected Formats
### Input Cláusula
"A Contratante exigirá o controle de ponto do funcionário da Prestadora que deverá cumprir o horário comercial rigoroso das 9h às 18h na nossa sede física."

### Diagnostic
"Risco Máximo Detectado. Exigir controle de jornada direta pelo tomador de serviço terceirizado constitui subordinação direta, elemento crucial para descaracterização do contrato e declaração de vínculo empregatício direto (Art. 3º CLT)."`,
    qualityBreakdown: {
      precisaoNormativa: 9,
      especificidade: 8,
      padraoEntrega: 9,
      limitesAutonomia: 9,
      atualizacao: 9
    },
    playgroundTestInput: "A empresa prestadora PJ não poderá sob hipótese alguma enviar outra pessoa para realizar o trabalho do programador principal Lucas Cardoso, o qual receberá R$ 8.000 fixos mensais corrigidos idênticos ao salário de nossos analistas CLT de igual senioridade.",
    playgroundExpectedOutput: "Critico: Cláusula com alta pessoalidade (' Lucas Cardoso exclusivamente') e onerosidade idêntica a empregados CLT acarreta altíssimo risco de caracterização de vínculo de trabalho. Recomenda-se permitir que a contratada envie técnicos qualificados substitutos para que não haja pessoalidade."
  },
  {
    id: "validador-politicas-lgpd",
    name: "Auditor de Políticas de Privacidade e Termos de Uso (LGPD)",
    ownerName: "lexfox",
    ownerAvatar: "🦊",
    description: "Audita se termos digitais possuem cláusulas de descarte, nomeação de encarregado de dados e bases legais claras para cada dado coletado na plataforma.",
    tags: ["LGPD", "Compliance", "Contratos"],
    vertical: "LGPD",
    rating: 5.0,
    reviewCount: 46,
    starsCount: 2190,
    version: "3.2.0",
    updatedAt: "2026-06-10",
    qualityScore: 96,
    regulatoryScore: 92,
    complianceChecked: true,
    regulatoryIssues: 1,
    markdownContent: `# Skill Jurídica: Validador de Políticas de Privacidade (LGPD)
## 1. Goal
Validar termos e políticas digitais contra os requisitos de transparência e bases legais exigidos pela LGPD (Lei 13.709/2018).

## 2. Context & Core Norms
* **Art. 7º da LGPD**: Rol taxativo de hipóteses autorizadoras para tratamento de dados.
* **Art. 8º da LGPD**: Requisitos do consentimento livre e informado.
* **Art. 41 da LGPD**: Obrigação do controlador em indicar o encarregado pelo tratamento de dados pessoais (DPO).

## 3. Execution Levels
### Level 1: Standard Case
1. Identifica se há tabela ou rol explícito relacionando o dado coletado com a sua respectiva finalidade.
2. Escaneia a presença de cláusula indicando canal de comunicação para o DPO (Exigência do Art. 41).
3. Avalia se constam informados os prazos e condições para exclusão/descarte de dados pessoais.

### Level 2: Exceptional Handling
1. **Legítimo Interesse Invocado sem Salvaguardas**: Caso o termo cite 'Legítimo Interesse' como base legal para marketing agressivo, orienta a necessidade de um relatório de impacto (LIA) complementar e insere alerta de conformidade.
2. **Consentimento em Adesão**: Se o consentimento estipular aceitação tácita por mero navegar, alerta de nulidade conforme jurisprudência da ANPD.

### Level 3: Hard Boundaries & Grounding
1. **Dados de Menores (Art. 14)**: Se envolver menor de idade, suspende a análise simplificada e exige um fluxo específico com controle parental de assinatura.
2. **Proibição**: O agente de inteligência artificial de forma nenhuma emitirá o certificado final de conformidade para auditoria externa jurídica sem verificação manual final.

## 4. Test Cases & Expected Formats
### Input Text
"Ao se cadastrar no Sanfran, você autoriza o tratamento dos seus dados de cartão de crédito e saúde de forma vitalícia e definitiva."

### Diagnostic
"Irregularidade Crítica: Tratamento de dados de saúde (sensíveis) exige base legal específica (Art. 11 LGPD) e consentimento expresso em destaque. Além do mais, tratamento vitalício viola o princípio da temporariedade do tratamento."`,
    qualityBreakdown: {
      precisaoNormativa: 10,
      especificidade: 10,
      padraoEntrega: 9,
      limitesAutonomia: 9,
      atualizacao: 10
    },
    playgroundTestInput: "Ao navegar em nosso app, nós coletamos sua localização em tempo real e compartilhamos livremente com rede de anúncios associados sem precisar consultar novamente.",
    playgroundExpectedOutput: "Violação de Transparência: Compartilhamento com rede de anúncios terceiros sem base legal explícita e consentimento específico em separado é flagrantemente nulo perante a ANPD."
  },
  {
    id: "auditor-clausulas-societario",
    name: "Auditor de Acordos de Sócios e Cláusulas Penais",
    ownerName: "tributario-sanfran",
    ownerAvatar: "🏫",
    description: "Inspeção de simetria jurídica em multas indenizatórias ou de não-concorrência em acordos de acionistas e contratos empresariais simétricos.",
    tags: ["Societário", "Contratos", "CCB"],
    vertical: "Societario",
    rating: 4.6,
    reviewCount: 9,
    starsCount: 680,
    version: "1.0.1",
    updatedAt: "2026-05-15",
    qualityScore: 72,
    regulatoryScore: 85,
    complianceChecked: true,
    regulatoryIssues: 0,
    markdownContent: `# Skill Jurídica: Auditor de Cláusulas de Não-Concorrência e Multas Societárias
## 1. Goal
Verificar limites e legalidade de multas de não-concorrência e cláusulas de veto em acordos de acionistas de empresas brasileiras sob as premissas do Código Civil.

## 2. Context & Core Norms
* **Código Civil Art. 412**: Teto da multa contratual limitado ao valor da obrigação principal.
* **Doutrina STJ sobre Não-Concorrência**: Requisitos cumulativos de Limitação Geográfica, Limitação Temporal coerente (geralmente até 5 anos) e Indenização Compensatória específica.

## 3. Execution Levels
### Level 1: Standard Case
1. Verifica se a cláusula de não-concorrência imposta a sócios retirantes prevê compensação financeira mensal (Sua ausência acarreta anulação judicial).
2. Valida a abrangência geográfica da limitação (território nacional, estadual ou municipal específico).

### Level 2: Exceptional Handling
1. **Limitação de Tempo Desproporcional**: Se a proibição de trabalhar em concorrentes é superior a 5 anos, aponta jurisprudência pacífica do STJ limitando o abuso e sugere adequação para 24 meses.

### Level 3: Hard Boundaries & Grounding
1. **Relações Consolidadas por Fusões (M&A)**: Afasta as regras flexíveis civis comuns se o caso versar sobre transações complexas de compra de ativos econômicos de grande porte.

## 4. Test Cases & Expected Formats
### Input Text
"A sócia retirante não poderá trabalhar em nenhuma empresa de tecnologia do mundo por tempo indeterminado e sem remuneração sob pena de multa de R$ 5 milhões."

### Assessment
"Cláusula inválida. Violas as diretrizes de não-concorrência devido à falta de delimitação espacial, falta de prazo de vigência (tempo indeterminado) e ausência de indenização correlata."`,
    qualityBreakdown: {
      precisaoNormativa: 7,
      especificidade: 8,
      padraoEntrega: 7,
      limitesAutonomia: 7,
      atualizacao: 7
    },
    playgroundTestInput: "Cláusula 12: O ex-sócio fica proibido de atuar na região de São Paulo no ramo de logística pelo prazo de 2 anos, recebendo mensalmente 50% de seu último pró-labore como indenização compensatória durante o período de restrição.",
    playgroundExpectedOutput: "Válido: A cláusula preenche os critérios cumulativos aceitos pelo STJ: prazo razoável (2 anos), limitação de espaço física proporcional (Região de São Paulo) e contrapartida financeira mensal de 50%."
  }
];
