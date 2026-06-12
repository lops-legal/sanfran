# Plano de Implementação por Fases

## Fase 1 — Validador + Editor conforme agentskills.io

**Objetivo**: toda skill criada na plataforma nasce compatível com Claude Code, Cursor, Codex CLI, Gemini CLI e demais ferramentas que implementam o padrão.

- Setup de infraestrutura: monorepo (`apps/web`, `apps/api`, `apps/lex`), Postgres + pgvector, auth multi-org básico, CI/CD em staging
- Implementar parser/validador de `SKILL.md` conforme especificação `agentskills.io`: YAML frontmatter, estrutura de 3 níveis, limites de tokens por nível, naming conventions
- Editor manual no frontend (sem Lex) que força a estrutura de 3 níveis, com indicador visual de orçamento de tokens por nível
- CRUD de skills via API Go, versionamento automático (`skill_versions`)
- Decomposição em `skill_sections` ao salvar

**Critério de saída**: usuário cria/edita uma skill manualmente, o sistema valida conformidade com o padrão e gera o diretório `SKILL.md` exportável corretamente.

## Fase 2 — Lex + Meta-skill

**Objetivo**: a Lex conduz a entrevista estruturada definida em `meta-skill.md` e produz skills completas e válidas.

- Meta-skill implementada como fluxo estruturado (FastAPI + LangGraph), não prompt único — etapas de elicitação (papel, normas, padrão de entrega, limites de autonomia, casos de teste)
- Gate de qualidade: checklist de especificidade aplicado antes de salvar
- Persistência de `lex_sessions` (estado da entrevista entre turnos, fora da janela de contexto)
- Geração automática de 2-3 casos de teste por skill
- Log de `lex_interactions` (tokens in/out por chamada, por org/usuário) desde o início

**Critério de saída**: usuário descreve uma tarefa jurídica em linguagem natural; a Lex conduz a entrevista, gera uma skill completa nos 3 níveis com casos de teste, salva via Skills Service da Fase 1.

## Fase 3 — Corpus inicial curado

**Objetivo**: validar a hipótese de qualidade antes de abrir a marketplace pública.

- Construir corpus inicial (10-30 skills) em verticais a definir, usando a Lex
- Revisão de qualidade normativa (precisão de citações de CDC/CLT/CPC/LGPD/súmulas)
- Rodar casos de teste gerados contra as skills para validar comportamento esperado

**Critério de saída**: corpus inicial com skills aprovadas nos próprios casos de teste, servindo de base de referência para a Fase 4.

## Fase 4 — Edição em locus + contexto recursivo

**Objetivo**: edições pontuais consomem tokens proporcionais à edição; a Lex referencia skills existentes sem carregar documentos inteiros.

- Edição em locus: Lex recebe apenas a seção alvo (`skill_sections`) + resumo das demais; reconstrução do `SKILL.md`, novo hash, nova versão
- Diff visual entre versões + rollback
- Índice de descoberta sobre Level 1 (`skill_level1_index`) com busca vetorial
- Tool calling na Lex: `fetch_skill_section(skill_id, section_key)` para recuperação de Level 2/3 sob demanda
- Registro automático de `skill_links` (`relation_type='references'`) quando uma skill é consultada durante criação/edição de outra
- (Opcional) indexação de Level 1 de diretórios externos compatíveis com `agentskills.io` como fonte adicional de referência

**Critério de saída**: editar uma seção de uma skill consome tokens proporcionais ao tamanho da edição, não ao documento inteiro; criar uma skill nova que referencia N skills existentes gera vínculos registrados em `skill_links`.

## Fase 5 — Marketplace pública + scanning + curadoria

**Objetivo**: distribuição pública com garantias de qualidade normativa e segurança.

- Publicação de skills com visibilidade pública (escolha do criador)
- Validação de conformidade obrigatória antes de publicação
- Scanner de segurança (análise estática contra padrões de prompt injection, exfiltração) — escopo enxuto
- Avaliação em dimensões jurídicas específicas (precisão normativa, atualização, especificidade) — mecanismo de curadoria a definir
- Página de listagem/busca/detalhe de skills públicas

**Critério de saída**: usuário publica uma skill, ela passa por validação e scanning, e fica descobrível na marketplace com indicadores de qualidade.

## Fase 6 — Compatibilidade CLI/MCP

**Objetivo**: interoperabilidade com o ecossistema externo.

- Exportação compatível com `npx skills add <org>/<skill>`
- MCP server opcional expondo `search_skills`, `get_skill`, `get_skill_section`, com token de auth por usuário/org e rate limiting via Redis

**Critério de saída**: usuário instala uma skill da plataforma via CLI padrão do ecossistema, ou conecta o MCP opcional em Claude/ChatGPT para busca dinâmica.

## Fase 7 — Minha Organização (billing)

**Objetivo**: monetização básica e gestão multiusuário.

- Gestão de membros e papéis dentro da organização
- Integração Stripe (planos)
- Skills privadas de organização (compartilhadas entre membros, não públicas)

## Ordem de dependência

Fases 1→2↓ 3 formam o núcleo testável internamente (criar skills de qualidade com a Lex). Fase 4 é o diferencial competitivo central (flywheel de contexto recursivo) e deve ser validada antes de investir em distribuição (Fases 5-6) ou monetização (Fase 7) — essas últimas só compensam o esforço se o núcleo já demonstrar sinal de que skills referenciadas geram skills melhores.
