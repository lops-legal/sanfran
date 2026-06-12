# Visão de Produto

## Hipótese central

Skills jurídicas bem estruturadas — criadas com metodologia consistente, orçamento de tokens controlado e precisão normativa brasileira — melhoram mensuravelmente a saída de agentes de IA jurídicos. Quanto mais skills de qualidade existem na base, melhor a Lex fica em criar novas skills (efeito flywheel via contexto recursivo sobre o corpus existente).

## Posicionamento

O Sanfran.md **não** compete como marketplace genérica de skills. Marketplaces genéricas (SkillsMP, skills.sh, agentskill.sh, SkillHub) já operam em escala de dezenas a centenas de milhares de skills, com curadoria e segurança variando de mínima a robusta. Competir em volume nesse mercado é perder.

O valor defensável do Sanfran.md está em três eixos que agregam às genéricas não replicam:

1. **Precisão normativa brasileira** — skills que referenciam corretamente CDC, CLT, CPC/2015, LGPD, súmulas e jurisprudência aplicável, como campos estruturados, não texto livre genérico.
2. **Metodologia de criação (a meta-skill)** — a Lex aplica um processo de engenharia de skill testado: entrevista estruturada, orçamento de tokens por nível, geração de casos de teste verificáveis.
3. **Contexto institucional acumulado** — corpus de skills jurídicas brasileiras que serve de base de referência recursiva para a própria Lex, criando vantagem que cresce com o uso.

A marketplace é camada de **distribuição e prova social** desse trabalho — não o produto em si.

## Componente único: Skills

Toda a plataforma opera sobre um único tipo de artefato: a **skill**, em conformidade com o padrão `agentskills.io` — diretório contendo `SKILL.md` (YAML frontmatter + corpo Markdown em progressive disclosure de 3 níveis) e recursos opcionais (`FORMS.md`, `REFERENCE.md`, `scripts/`).

Não há "roles", "workflows", "protocolos de comunicação" ou outros componentes — esses conceitos foram descartados do design.

## Verticais

A organização por área de prática (ex: trabalhista, LGPD, regulatório) é um eixo de categorizacão das skills, não componentes separados da plataforma. A estruturação final das verticais está em aberto e será definida posteriormente.

## Não-objetivos (fase atual)

- Governança formal, selos de qualidade institucional, programas de parceiros
- Modelo de negócio e estrutura de piloto
- Múltiplas verticais totalmente estruturadas desde o início
- Integrações com ferramentas externas (Word, SharePoint, e-mail)
- MCP server como componente central (vira compatibilidade de fase tardia)
- Monetização sofisticada além de assinatura básica por organização

## Métricas de sucesso (hipótese a validar)

- Skills criadas com a meta-skill apresentam maior taxa de aprovação em casos de teste do que skills criadas sem metodologia
- Edições em locus consomem tokens proporcionais ao tamanho da edição, não ao documento inteiro
- Skills referenciadas por outras skills (via `skill_links`) correlacionam com skills de maior qualidade percebida (avaliação/uso)
