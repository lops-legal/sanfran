# Estratégia de Testes

## Testes de backend (Go) — unitários e integração

- CRUD de skills: criação, edição, versionamento incremental correto (cada save gera nova `skill_version`, nunca sobrescreve)
- Validador de conformidade `agentskills.io`: rejeitar frontmatter inválido, estrutura de níveis ausente, limites de tokens excedidos sem justificativa
- Decomposição em `skill_sections`: round-trip — reconstrução do `SKILL.md` a partir das seções deve ser idêntica ao original
- Controle de visibilidade: usuário sem permissão não acessa skill privada de outra org (teste de autorização)
- Geração de hash de conteúdo: detectar corretamente quando uma versão é idêntica vs. diferente

## Testes da Lex (Python/LangGraph)

- **Aderência à meta-skill**: dado um prompt de criação, a skill gerada contém todos os campos obrigatórios do checklist de especificidade (papel, normas, padrão de entrega, limites de autonomia, casos de teste)
- **Gate de qualidade**: prompts genéricos demais (ex: "revisar contrato") devem gerar pedido de especificação adicional, não uma skill genérica
- **Orçamento de tokens**: skill gerada respeita limites por nível (Level 1 <2.000, Level 2 <5.000); normas listadas de forma compacta, não narradas
- **Edição em locus**: medir tokens consumidos numa edição pontual vs. tokens que seriam consumidos enviando o documento inteiro — validar redução proporcional
- **Regressão via casos de teste**: rodar os casos de teste gerados junto com a skill, antes e depois de uma edição em locus, para detectar degradação de comportamento

## Testes de busca/contexto recursivo

- **Relevância do índice Level 1**: dado um conjunto curado de skills conhecidas, busca vetorial sobre resumos retorna as skills corretas para queries de teste (precisão/recall)
- **Custo de contexto sub-linear**: ao criar uma skill nova que referencia N skills existentes, tokens totais consumidos devem crescer sub-linearmente com o tamanho da base
- **Registro de `skill_links`**: referências são registradas corretamente durante criação/edição; ranking de influência reflete uso real

## Testes end-to-end (E2E)

- Fluxo completo: criar skill via Lex → editar em locus → publicar na marketplace → validar conformidade e scanning → exportar via CLI padrão (`npx skills add`) ou consumir via MCP opcional
- Fluxo de rollback: editar skill, identificar regressão (via casos de teste), fazer rollback, confirmar que a versão anterior está ativa e exportável

## Testes de carga/performance

- Busca na marketplace com volume simulado (ex: 10k skills) — tempo de resposta da busca vetorial sobre Level 1
- MCP server sob rate limit: limites por org respeitados sem afetar outras orgs
- Lex sob concorrência: múltiplas sessões de criação simultâneas (`lex_sessions`) não vazam contexto entre usuários/orgs

## Testes de custo/observabilidade

- Todo request à Lex gera registro em `lex_interactions` (tokens in/out, vinculado a org/usuário)
- Alertas configurados para consumo anômalo (ex: organização gerando custo muito acima da média)

## Testes de segurança (marketplace pública)

- Scanner de segurança detecta padrões conhecidos de prompt injection/exfiltração em conteúdo de skill antes da publicação
- Skills reprovadas no scanner não ficam públicas, mas permanecem acessíveis ao criador como privadas/org
