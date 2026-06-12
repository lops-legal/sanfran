# Sanfran.md

Plataforma de criação, versionamento e distribuição de skills jurídicas para o Direito brasileiro, em conformidade com o padrão aberto [agentskills.io](https://agentskills.io/specification) (SKILL.md).

## O que é

O Sanfran.md é centrado em três peças:

1. **Lex** — IA nativa (GPT-OSS-120B) que itera com advogados para criar skills jurídicas seguindo uma meta-skill própria, extraindo conhecimento tácito e estruturando no formato padrão de 3 níveis (progressive disclosure).
2. **Skills** — componente único da plataforma. Toda skill é um diretório `SKILL.md` + recursos opcionais, validado contra o padrão `agentskills.io`, com versionamento e seções endereçáveis para edição em locus.
3. **Marketplace** — distribuição pública/privada/org das skills, com foco em qualidade normativa verificável (não em volume).

## Por que existe

SKILL.md é hoje um padrão aberto cross-vendor (Claude Code, Cursor, Codex, Gemini CLI, VS Code, etc.). Marketplaces genéricas já existem em escala (centenas de milhares de skills). O espaço aberto não é "ter um repositório" — é garantir que skills jurídicas brasileiras tenham precisão normativa (CDC, CLT, CPC, LGPD, súmulas) que ferramentas genéricas não produzem sem metodologia e contexto de domínio.

## Documentos

- `docs/visao.md` — visão de produto, posicionamento, não-objetivos
- `docs/arquitetura.md` — arquitetura técnica e stack
- `docs/meta-skill.md` — especificação da meta-skill que governa a Lex
- `docs/modelo-dados.md` — schema de dados
- `docs/fases.md` — plano de implementação por fases
- `docs/testes.md` — estratégia de testes

## Status

Projeto em fase de design. Nenhuma fase de implementação iniciada.
