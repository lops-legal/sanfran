# Meta-Skill

A meta-skill é o documento que governa como a Lex cria, edita e avalia skills jurídicas. É potencialmente o ativo mais valioso da plataforma — mais do que o corpus de skills em si — porque é o que torna a criação repetível, consistente e de alta densidade.

## Objetivo

Transformar conhecimento jurídico tácito (o que um advogado sabe mas não tem em formato estruturado) em uma skill conforme o padrão `agentskills.io`, com:

- Precisão normativa brasileira
- Densidade de tokens controlada por nível
- Casos de teste verificáveis
- Estrutura editável em locus (seções endereçáveis)

## Papel da Lex no processo

A Lex atua como entrevistadora estruturada, não como gerador de texto solto. O fluxo de criação segue etapas, não um prompt único:

1. **Elicitação do papel do agente** — que tarefa jurídica específica a skill resolve, para qual contexto (setor, tipo de empresa, área do Direito)
2. **Elicitação normativa** — quais leis, súmulas, resoluções e precedentes se aplicam (CDC, CLT, CPC/2015, LGPD, normas setoriais — ANS, ANATEL, BACEN, CADE, etc., conforme o caso)
3. **Elicitação do padrão de entrega** — formato esperado de saída (ex: tabela com cláusula/risco/recomendação/urgência)
4. **Elicitação de limites de autonomia** — o que a IA pode concluir sozinha vs. o que deve ser escalado para revisão humana
5. **Estruturação em 3 níveis** — distribuição do conteúdo coletado entre Level 1 (Quick Start), Level 2 (Implementation) e Level 3 (recursos externos), respeitando orçamento de tokens
6. **Geração de casos de teste** — 2-3 pares input/output esperado que permitem validar a skill e detectar regressões em edições futuras
7. **Gate de qualidade** — a Lex recusa ou solicita mais especificidade para pedidos genéricos demais (ex: "revisar contrato")

## Orçamento de tokens por nível

| Nível | Limite | Conteúdo |
|---|---|---|
| Level 1 — Quick Start | <2.000 tokens | Papel do agente, normas-chave (lista, não narrativa), referência rápida |
| Level 2 — Implementation | <5.000 tokens | Passo a passo, padrão de entrega detalhado, limites de autonomia |
| Level 3 — Recursos externos | custo zero de contexto (filesystem) | Referências normativas extensas, exemplos completos de petições/contratos, scripts auxiliares |

A meta-skill instrui a Lex a:
- Listar normas em formato compacto (ex: "CDC arts. 6º, 51; Súmula 331 TST"), não narrar o conteúdo das leis
- Mover qualquer conteúdo extenso (textos legais completos, exemplos longos) para Level 3
- Recusar adicionar conteúdo a Level 1/2 que exceda o orçamento sem justificar a exceção

## Checklist de especificidade (gate de qualidade)

Antes de considerar uma skill pronta para salvar, a Lex verifica:

- [ ] O papel do agente está vinculado a um contexto específico (setor, tipo de relação jurídica, ou tipo de documento)?
- [ ] É ao menos uma norma de referência identificada (lei, súmula, resolução)?
- [ ] O padrão de entrega está definido em formato verificável (estrutura de saída, não "faça uma análise")?
- [ ] Os limites de autonomia distinguem o que é decisão automática vs. o que exige revisão humana?
- [ ] Existem casos de teste (input → output esperado)?

Se algum item falhar, a Lex deve perguntar ao usuário pelo dado faltante antes de gerar a skill final — não preencher com conteúdo genérico.

## Casos de teste

Cada skill criada é acompanhada de 2-3 casos de teste no formato:

```yaml
- input: "<exemplo de entrada — ex: trecho de contrato>"
  expected_output_contains: "<elementos que a saída deve conter>"
  expected_output_format: "<estrutura esperada — ex: tabela com colunas X, Y, Z>"
```

Esses casos servem para:
- Validar a skill recém-criada
- Detectar regressão quando uma seção é editada em locus (rodar os casos antes/depois da edição e comparar)

## Versionamento

Cada skill carrega metadados de versão no frontmatter:
- Data da última revisão
- Norma que motivou a última atualização (quando aplicável)
- Changelog resumido por versão

## Skills externas como referência (contexto recursivo)

Durante a criação de uma nova skill, a Lex pode consultar o Level 1 de skills já existentes na base (públicas, da organização, ou – opcionalmente – de diretórios externos compatíveis com `agentskills.io`) para:
- Evitar duplicar trabalho já feito
- Reutilizar estruturas de normas/padrão de entrega já validadas
- Sugerir vínculos (`skill_links`) entre a nova skill e skills relacionadas

A consulta é feita via tool calling sobre Level 1 (resumos), com recuperação de Level 2/3 apenas das skills identificadas como relevantes — nunca carregar o corpus inteiro no contexto.

## A meta-skill como artefato publicável

A própria meta-skill pode ser publicada como uma skill aberta no ecossistema `agentskills.io` — funcionando como demonstração pública da metodologia Sanfran e canal de distribuição/reconhecimento, independente do uso da plataforma.
