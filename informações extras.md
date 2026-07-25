# O Movimento dos "Skill Repositories": Mapeamento Completo

## 1. O que é uma "Skill" (Agent Skill)

O formato **Agent Skills** foi originado pela Anthropic (lançado em outubro de 2025) como um padrão aberto e leve para dar a agentes de IA capacidades especializadas sob demanda. Na essência:

- Uma **skill é uma pasta** contendo um arquivo `SKILL.md` obrigatório com **frontmatter YAML** (no mínimo `name` e `description`) seguido de instruções em Markdown.
- A pasta pode incluir opcionalmente `scripts/` (código executável), `references/` (documentação estendida), `assets/` (templates, recursos) e outros arquivos.
- O carregamento segue o princípio de **"progressive disclosure" (divulgação progressiva)** em três estágios:
  1. **Discovery** — no início da sessão, o agente carrega só nome + descrição de cada skill (footprint mínimo de contexto).
  2. **Activation** — quando uma tarefa combina com a descrição, o agente lê o `SKILL.md` completo.
  3. **Execution** — o agente segue as instruções, opcionalmente executando scripts ou carregando arquivos referenciados.

Isso resolve um problema real: dar a um agente centenas de "playbooks" sem estourar a janela de contexto, e sem precisar treinar/fine-tunar um modelo customizado para cada fluxo de trabalho.

**Por que isso pegou tão rápido:**
- **Conhecimento de domínio**: processos jurídicos, pipelines de dados, formatação de apresentações — tudo isso vira instrução reutilizável.
- **Fluxos repetíveis e auditáveis**: uma skill de deploy pode forçar revisão de código, testes, checagem de secrets, build e deploy sempre na mesma ordem.
- **Contexto organizacional portátil**: convenções de código, padrões de documentação, processos de revisão de uma empresa viram algo compartilhável entre equipes e entre diferentes agentes.
- **Reuso entre produtos**: a mesma skill funciona no Claude Code, Cursor, Codex, Gemini CLI, Copilot, etc. — é o valor de um "padrão aberto".

O padrão de referência está documentado em **agentskills.io** (especificação, guia de criação, avaliação).

---

## 2. Panorama dos players — diretórios, marketplaces e registries

O ecossistema já tem uma segmentação clara entre **diretórios genéricos/abertos**, **marketplaces verticais (nicho)** e **registries de ecossistemas de agentes autônomos**. Segue o mapa:

### 2.1 Skills.sh (Vercel) — o "npm para skills de agentes"
- Lançado em **20 de janeiro de 2026** pela Vercel.
- Posicionamento: **"The Agent Skills Directory"** — descobrir e instalar skills com um único comando.
- Funciona como agregador: indexa skills de múltiplos repositórios públicos no GitHub, sem hospedar o conteúdo em si.
- **Leaderboard com telemetria anônima**: contagem agregada de instalações, com visão "all-time" e "trending" (últimas 24h). Exibe top 200.
- Instalação via CLI: `npx skills add <owner>/<repo>` (sem precisar instalar nada globalmente).
- Compatível com Cursor, Claude Code, GitHub Copilot, Codex, Goose, Windsurf, entre outros.
- **Modelo de negócio**: gratuito para navegar; não há tiers pagos documentados oficialmente (posição de janeiro/2026).
- **Limitação relevante**: não há sandbox de execução — só é possível pré-visualizar o `SKILL.md`; a validação real precisa ser feita no ambiente do próprio agente.
- Segurança: o registry roda **auditorias automatizadas com múltiplos scanners (Socket, Snyk, ATH)**.

### 2.2 officialskills.sh
- Diretório curado apenas com skills publicadas por **times oficiais de desenvolvedores** (Cloudflare, Anthropic, Stripe, Microsoft, Google/Hugging Face etc.).
- Resolve o problema de confiança: em vez de garimpar entre milhares de skills de terceiros, você navega só pelo que é "primeira parte" / verificado pelo vendor.

### 2.3 agentskills.io
- Não é um marketplace comercial — é o **hub da especificação em si**: documentação oficial do formato, guias de criação e de avaliação de skills, comunidade no Discord.
- Funciona como a "RFC" do movimento.

### 2.4 ClawHub (ecossistema OpenClaw)
- Registry de skills para o **OpenClaw**, um agente autônomo open-source, self-hosted e model-agnostic (roda com Claude, GPT, Gemini, DeepSeek, Ollama).
- Curiosidade de origem: OpenClaw começou como **"Clawdbot"** (criado por Peter Steinberger, fim de 2025), depois virou **"Moltbot"** após disputa de marca com a Anthropic, e se estabilizou como **OpenClaw** em janeiro/2026.
- Funciona como "npm para agentes": versionamento semver, changelogs, busca por **embeddings/vetor** (semântica, não só por palavra-chave), CLI própria (`clawhub install`, `clawhub search`, `clawhub publish`, `clawhub inspect`, `clawhub pin`, etc.).
- Qualquer pessoa com conta GitHub com mais de uma semana pode publicar skills — **barreira de entrada muito baixa**, o que gerou o principal ponto fraco do modelo (ver seção de riscos).
- Crescimento vertiginoso e depois correção drástica:
  - Nov/2025: 127 skills
  - Jan/2026: 5.700 skills
  - Fev/2026: 13.000 skills
  - Mar/2026: 15.000+ / outra fonte cita picos de 52.700+ skills e 12 milhões de downloads, 180 mil usuários
  - Depois do incidente de segurança **"ClawHavoc"** (fevereiro/2026), o registry oficial removeu **2.419 skills suspeitas**, caindo de 5.705 para 3.286 skills "limpas", e passou a fazer parceria com **VirusTotal** para scanning automático de malware, além de auto-ocultar skills após 3 denúncias.
- **Monetização**: o registro em si é 100% gratuito — não existe listagem paga. O dinheiro é feito *ao redor* do ClawHub: versões premium vendidas via Gumroad, builds customizados para empresas, consultoria. Ou seja, o marketplace é a **camada de distribuição**, não o produto monetizável em si.
- Existe até um projeto derivado, **ClawMarket**, que propõe um marketplace 100% agente-para-agente, com pagamento on-chain/cripto e "zero intervenção humana" — sinal de que o conceito já está sendo esticado até experimentos bem mais especulativos.
- Curadoria comunitária como camada de confiança de fato: o projeto **VoltAgent/awesome-openclaw-skills** existe justamente porque o marketplace oficial não tem controle de qualidade suficiente sozinho.

### 2.5 LobeHub
- Citado como o maior marketplace "agent-first" do momento, com a cifra de **237.796 skills** — número que evidencia como esse tipo de diretório pode inflar rapidamente (curadoria de qualidade vs. quantidade bruta é um tema recorrente no setor).
- Modelo tiered/pago para funcionalidades avançadas.

### 2.6 AgentNode
- Se posiciona como alternativa **enterprise**, com formato agnóstico de framework (ANP) compatível com LangChain, CrewAI, AutoGen.
- Diferencial: pipeline de verificação de 4 passos (Install → Import → Smoke Test → Unit Tests) para reduzir risco de execução de código malicioso — resposta direta ao problema de segurança que afeta registries abertos tipo ClawHub.

### 2.7 SkillUse
- CLI + registry mais enxuto, focado em **Claude Code, Codex CLI** e afins.
- Fluxo simples: `skilluse skill install <owner>/<repo>/<skill-name>`, `skilluse publish`, autenticação via GitHub OAuth.
- Em Claude Code, skills instaladas viram slash-commands automaticamente (`/nome-da-skill`).

### 2.8 inference.sh
- Não é um "diretório neutro" — é a skill/coleção de uma plataforma específica (mais de 150–250 apps de IA em nuvem: geração de imagem, vídeo, LLMs, busca, fala) exposta via um CLI único (`infsh`).
- Ilustra um segundo padrão de uso: **skill como camada de acesso a uma plataforma proprietária**, não só "conhecimento processual".

### 2.9 Diretórios verticais — o caso CaseMark / agentskills.legal (seu benchmark direto)
Esse é provavelmente o comparável mais próximo do que você está construindo, então vale detalhar:

- **CaseMark** é uma legal-tech (transcrição, sumarização de depoimentos, revisão de contratos) que construiu uma infraestrutura chamada **case.dev** — "o sistema operacional legal para a era dos agentes".
- **agentskills.legal** é a vitrine pública/diretório de skills jurídicas dessa infraestrutura:
  - **874 skills jurídicas** organizadas por área (transacional, litígio, imobiliário, M&A, trabalhista, IP, etc.).
  - Skills também cobrindo **saúde (400 skills / 20 subgrupos)**, **finanças (400 skills / 20 subgrupos)** e **capital/M&A/VC/PE (400 skills / 20 subgrupos)** — ou seja, o mesmo "motor" de repositório de skills replicado em verticais adjacentes.
  - Repositório público no GitHub (`CaseMark/skills`), com um pipeline claro: PR aberto → `skill-qa.yml` valida formato e qualidade → merge → embedding automático em banco vetorial (pgvector) → alimenta o site, uma **API de Legal Agent Skills** e um **servidor MCP** dedicado.
  - Especificação própria documentada (`spec/SKILL-SPEC.md`) e template de skill (`template/SKILL.md`) — ou seja, eles não usam só o `SKILL.md` cru da Anthropic, adicionam uma camada de padronização/QA em cima.
  - **Modelo de distribuição em múltiplas camadas**:
    1. Uso gratuito direto no navegador ("Try this skill now" → roda dentro do workspace CaseMark).
    2. Acesso via **MCP** — o diferencial mais forte: qualquer assistente de IA compatível com MCP pode "descobrir e executar skills jurídicas automaticamente" sem copiar e colar links.
    3. Acesso via markdown puro em `/skills/[slug].md` — cada skill vira um endpoint público consumível programaticamente.
    4. Skills **privadas** — a oferta B2B: empresas encapsulam seus próprios critérios de revisão, red flags, formatação e estilo como skills privadas dentro do case.dev, usáveis em qualquer LLM.
  - Modelo comercial: case.dev vende isso como **infraestrutura compliance-ready** (SOC 2 Type II, HIPAA, acordos de zero-retenção), com 15+ serviços (armazenamento de documentos com busca semântica e GraphRAG, gateway unificado para 40+/195+ modelos com redação de PII e auditoria, OCR jurídico, transcrição com diarização), tudo sob um SDK único.
  - Prova social citada: 1.000+ advogados usando a infraestrutura em escala AmLaw, clientes citados como seguradora de responsabilidade médica, Ogletree Deakins, Nelson Mullins.
  - Também lançaram o **"CaseMark Operator"** — um agente sempre ativo que trabalha via e-mail/Teams/SMS, coach-like, "como um novo contratado brilhante mas às vezes ingênuo".

**Por que esse case importa para você:** ele mostra o **playbook completo de monetização de um repositório de skills verticalizado**:
1. repositório aberto no GitHub (gera confiança, comunidade, SEO, contribuições) →
2. diretório público navegável com "experimente agora" (top of funnel, geração de leads) →
3. acesso via MCP/API para devs e agentes (product-led growth) →
4. camada privada/customizada vendida como parte de uma plataforma de infraestrutura com compliance (o produto que realmente fatura).

### 2.10 Outros diretórios agregadores citados no ecossistema
- **MCP Market — Skills Leaderboard**: leaderboard cruzando popularidade de skills para Claude, Claude Code, ChatGPT e Codex, com foco forte em skills de produtividade de engenharia (Vite, revisão de PR, GitHub CLI, Netmiko para redes, EMR/EHR, etc.).
- **AIMCP / MCP Hub**: cataloga skills de nicho técnico (ex.: "skill-evaluator" para benchmarking, integrações com Polymarket, Content Collections, etc.).
- **Coleções "awesome-*" no GitHub**: ex. citado no ecossistema um projeto com **1.234+ skills, 22.000+ estrelas, 3.800+ forks**, instalável via `npx <pacote> -- <agente>` (Cursor, Gemini CLI, Codex CLI, Antigravity IDE), com **bundles curados por papel/persona** (ex.: "Web Wizard" = frontend-design + api-design-principles + lint-and-validate + create-pr) — um padrão de curadoria que reduz a paralisia de escolha em meio a milhares de skills.

---

## 3. Riscos e camada de segurança (tema que virou central)

Isso é relevante para seu posicionamento porque **segurança/curadoria virou um diferencial competitivo explícito**, não um detalhe técnico:

- O incidente **"ClawHavoc"** (jan–fev/2026) — pesquisadores encontraram **341 skills maliciosas** no ClawHub, levando à remoção de milhares de pacotes suspeitos e à adoção de scanning via VirusTotal.
- Como resposta ao problema, surgiram **skills de segurança dedicadas** dentro dos próprios registries (ex.: "SkillScan" / "Skill Vetter", com centenas de milhares de downloads — sinal de demanda real por confiança).
- Formalização acadêmica do problema: já existe pesquisa (**SkillTester**, arXiv 2026) propondo uma metodologia de benchmarking de segurança e utilidade de skills, tratando "badges", popularidade e alegações de segurança de auto-declaração como **claims a serem verificados, não fatos confiáveis** — comparando skills contra código real, dependências e comportamento observado, com probes organizados em três eixos: controle de comportamento anômalo, limite de permissões e proteção de dados sensíveis.
- Esse é um ponto de diferenciação que diretórios "sérios" (agentskills.legal, officialskills.sh, AgentNode) usam ativamente: **curadoria + verificação + proveniência (quem publicou, quando, histórico) como proposta de valor**, versus a abordagem "quantidade bruta" de registries totalmente abertos.

---

## 4. Benchmarks e métricas de qualidade de skills

Aqui está o que existe hoje, especificamente sobre **medir se uma skill realmente funciona / melhora performance de agente** (não é sobre benchmark de modelo de linguagem, é benchmark do *artefato skill*):

### 4.1 SkillsBench (skillsbench.ai)
- Descrito como **"o primeiro benchmark para avaliar agent skills"**.
- Estrutura: **87 tarefas**, avaliadas em **24 configurações modelo × harness** (Claude Code, Codex CLI, Gemini CLI, OpenHands e agentes open-source), com **3 tentativas por tarefa**.
- Mede **resolution rate** (taxa de resolução) com e sem skills, permitindo calcular o "ganho normalizado" atribuível à skill.
- Visualizações do leaderboard incluem: resolution rate vs. tempo de execução (wall-clock, escala log), resolution rate por data de lançamento do modelo, e um radar comparando performance por 8 domínios profissionais.
- A versão em paper (arXiv 2602.12670, publicada por volta de 13/fev/2026) detalha a metodologia com mais rigor:
  - Pipeline de 3 fases: (1) coleta — **322 contribuidores submeteram 105 tarefas candidatas**; (2) filtragem de qualidade — checagens automáticas (validade estrutural, detecção de conteúdo gerado por IA, auditoria de vazamento) + revisão humana em 5 critérios (validade dos dados, realismo da tarefa, qualidade do "oráculo"/gabarito, qualidade da skill, anti-cola) → resultado: **84 tarefas em 11 domínios**; (3) avaliação — três condições comparadas: **sem skills**, **com skills curadas**, **skills auto-geradas pelo próprio agente**.
  - Resultado central: skills curadas geram em média **+12,66 pontos percentuais** de melhoria de performance sobre a linha de base sem skills.
  - Um detalhe metodológico interessante: eles fazem **auditoria de vazamento** para garantir que a skill ensina um método reutilizável, e não "cola" a resposta específica da tarefa de teste — problema real em benchmarks desse tipo.
  - Observação relevante sobre viés de plataforma: modelos Claude são treinados com conhecimento da especificação Agent Skills, o que pode conferir vantagem ao processar instruções nesse formato — um ponto que qualquer benchmarking "neutro" precisa contextualizar.

### 4.2 Metodologia própria da Anthropic / agentskills.io ("Evaluating Skills")
- Propõe um fluxo prático e não-acadêmico, pensado para autores de skills que não são necessariamente engenheiros:
  - Autoria manual de `evals/evals.json` com "assertions" — afirmações verificáveis sobre o output esperado (ex.: "o arquivo de saída é um JSON válido", "o gráfico de barras tem eixos rotulados"), evitando asserts frágeis demais (ex.: exigir uma frase exata).
  - **Agentes "comparadores" para testes A/B** — comparam duas versões de uma skill, ou skill vs. ausência de skill, "às cegas" (sem saber qual é qual), para julgamento de output sem viés.
  - Cada rodada de avaliação deve rodar em contexto limpo (sem estado residual de execuções anteriores), usando subagentes (no Claude Code) ou sessões separadas.
  - Métrica de acurácia de disparo ("triggering"): já que descrições **muito amplas geram falsos positivos** e **muito estreitas geram falsos negativos** — conforme a base de skills cresce, a precisão da descrição vira um gargalo real de engenharia.
  - Ferramenta prática associada: **skill-creator**, que automatiza esse ciclo (escrever evals, rodar benchmarks, sugerir ajustes de descrição, comparar antes/depois) diretamente no Claude.ai, Cowork, Claude Code e no repositório oficial da Anthropic. Um exemplo real citado: rodar essa ferramenta nas skills oficiais de criação de documentos melhorou a taxa de disparo correto em 5 de 6 skills públicas.
  - Aprendizados citados por quem já testou em produção (blog da LangChain, que criou skills para LangChain/LangSmith): para skills grandes (300–500 linhas), mudanças pequenas de formatação/redação (instrução positiva vs. negativa, markdown vs. XML) tiveram **pouco impacto**; skills nem sempre são invocadas de forma confiável mesmo quando deveriam (ex.: um caso relatado em que o Claude Code nunca invocou a skill de "langchain agents" para uma tarefa claramente relacionada) — reforça que "disparo correto" é um problema de engenharia tão importante quanto o conteúdo da skill em si.

### 4.3 Ferramentas de benchmarking de terceiros (nível "skill individual")
- **skill-evaluator** (via MCP Hub / AIMCP): ferramenta agente-agnóstica (funciona com Claude Code, Codex, Antigravity, Cursor CLI, GitHub Copilot CLI, Amp, OpenCode, Grok CLI) que roda em **3 camadas crescentes de custo/fidelidade**: (1) verificação determinística de scripts via pytest-like assertions (grátis), (2) avaliação de qualidade com execução real com-skill vs. sem-skill em workspaces isolados, (3) agregação de benchmark consolidado.
- **Claude Skill Benchmarker / "skill-quality-benchmarker"** (mcpmarket.com): foca em análise estática (convenção de nomes, tamanho de descrição, regras "anti-fabricação") + testes A/B + metas de taxa de aprovação **por modelo** (Haiku, Sonnet, Opus) — reconhecendo que uma skill pode funcionar bem num modelo maior e falhar num modelo menor, o que é um ângulo interessante para pensar em "certificação" de skills por tier de modelo.
- **SkillTester** (arXiv 2603.28815): já citado acima na seção de segurança — mas também traz uma dimensão de **utilidade comparativa**: usa "baseline pareado" (mesma tarefa, mesmo agente, com e sem a skill habilitada) como evidência contrafactual do valor real da skill, tratando popularidade/downloads como sinal fraco e insuficiente isoladamente.

### 4.4 O padrão comum entre todos esses benchmarks (útil para você copiar na sua landing page)
Toda metodologia séria de avaliação de skill gira em torno de 4 eixos:
1. **Utilidade / uplift** — comparação pareada com-skill vs. sem-skill, na mesma tarefa e mesmo modelo (o "ganho normalizado").
2. **Acurácia de disparo (triggering accuracy)** — a skill é ativada quando deveria e não é ativada quando não deveria (taxa de falso positivo/negativo).
3. **Segurança / superfície de risco** — o que a skill pode executar, quais permissões/env vars declara, se o comportamento real bate com o declarado.
4. **Consistência entre modelos e ao longo do tempo** — a skill continua funcionando conforme os modelos evoluem (regressão de qualidade é um risco real e citado explicitamente pela Anthropic).

---

## 5. Estrutura técnica típica de um repositório de skills "maduro" (referência de arquitetura)

Baseado no repositório da Netresearch e no da CaseMark, um repositório de skills "profissional" tende a ter:

```
{nome}-skill/
├── AGENTS.md              # regras/índice para o agente
├── README.md               # documentação humana
├── LICENSE-*                # licenciamento (frequentemente split: código vs. conteúdo, ex. MIT + CC-BY-SA-4.0)
├── composer.json / package.json   # distribuição via gerenciador de pacotes
├── .claude-plugin/plugin.json     # metadado de marketplace (Claude Code)
├── .github/workflows/      # CI — validação de formato e qualidade a cada PR
├── docs/                    # arquitetura, decisões de design, dashboards
├── scripts/                 # automação do repositório
└── skills/
    └── {skill-name}/
        ├── SKILL.md         # instruções para o agente
        ├── checkpoints.yaml # checkpoints de avaliação (opcional)
        ├── evals/           # avaliações da skill
        ├── references/      # documentação estendida
        ├── scripts/         # automação específica da skill
        └── templates/       # templates de bootstrap
```

Pontos que aparecem repetidamente como **boas práticas de governança**:
- Pipeline de CI que valida formato + qualidade em todo PR antes do merge (ex.: `skill-qa.yml`).
- Licenciamento separado para código (MIT) vs. conteúdo/instrução (CC-BY-SA-4.0).
- Publicação em múltiplos canais simultaneamente: marketplace nativo do agente (ex.: `.claude-plugin`), pacote via npm/composer, download direto de release do GitHub, e instalação via CLI de terceiros (`npx skills add`).
- Especificação própria documentada dentro do repositório (`SKILL-SPEC.md`) quando a organização quer impor padrões acima do mínimo exigido pela spec aberta da Anthropic.

---

## 6. Síntese: os "arquétipos" de negócio no espaço de skill repositories

Para sua landing page, acho que vale nomear esses arquétipos claramente, porque cada um implica um pitch diferente:

| Arquétipo | Exemplo | Modelo de valor |
|---|---|---|
| **Diretório aberto genérico** | skills.sh | Agregação + descoberta + leaderboard de popularidade; monetiza indiretamente (ecossistema Vercel) |
| **Diretório curado "oficial"** | officialskills.sh | Confiança por proveniência (só vendors oficiais) |
| **Registry de um agente autônomo específico** | ClawHub (OpenClaw) | Distribuição nativa de um produto; risco de segurança alto por abertura irrestrita |
| **Marketplace agente-para-agente / especulativo** | ClawMarket | Fronteira experimental (pagamento on-chain, "zero humano") |
| **Coleção proprietária ligada a uma plataforma** | inference.sh skills | Skill como "manual de uso" de uma API/CLI proprietária |
| **Diretório vertical + infraestrutura B2B** | agentskills.legal / case.dev (CaseMark) | Isca gratuita (diretório público) → produto pago é a infraestrutura compliance-ready + skills privadas customizadas |
| **Framework enterprise agnóstico** | AgentNode | Segurança/verificação como diferencial central, multi-framework |
| **Benchmark/avaliação como produto** | SkillsBench, skill-evaluator | Não distribui skills — mede a qualidade de terceiros; vira referência de credibilidade citável |

O seu projeto, "próximo conceitualmente do agentskills.legal", provavelmente se encaixa no arquétipo **"diretório vertical + infraestrutura B2B"** — que é justamente o que tem o playbook de monetização mais claro e testado no mercado agora: repositório aberto no GitHub → diretório navegável gratuito com preview/execução → acesso via MCP/API → camada privada e customizada vendida com garantias de compliance como o verdadeiro produto pago.

---

## 7. Fontes principais consultadas
- agentskills.io (especificação oficial, guia de avaliação)
- skills.sh / toolworthy.ai (cobertura do skills.sh)
- officialskills.sh
- agentskills.legal + integrate + GitHub CaseMark/skills + case.dev + casemark.com (blog do Operator)
- clawhub.ai + GitHub openclaw/clawhub + datacamp.com + skywork.ai + toknow.ai + medium.com (economia de skills do ClawHub)
- skillsbench.ai + arXiv 2602.12670 (paper do SkillsBench)
- claude.com/blog (anúncio de melhorias no skill-creator)
- blog.langchain.com/evaluating-skills
- arXiv 2603.28815 (SkillTester)
- mcpmarket.com (leaderboard e skill-quality-benchmarker)
- aimcp.info (skill-evaluator)
- inference.sh/blog
- packagist.org (netresearch/agent-skill-repo)
- medium.com (10 must-have skills, cobertura de 2026)

*Observação: vários desses números (contagem de skills, downloads, estrelas) mudam rápido — o ecossistema está em expansão acelerada. Vale re-checar antes de publicar números específicos na sua landing page.*