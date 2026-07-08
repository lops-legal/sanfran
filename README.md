# Sanfran.md

[![CI](https://github.com/yourorg/sanfran/actions/workflows/ci.yml/badge.svg)](https://github.com/yourorg/sanfran/actions)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()
[![Skills](https://img.shields.io/badge/skills-{{SKILL_COUNT}}-orange)]()
[![Last Deploy](https://img.shields.io/badge/last_deploy-{{LATEST_DEPLOY}}-brightgreen)]()

## Visão
Plataforma de criação, versionamento e distribuição de **skills jurídicas** para o Direito brasileiro, em conformidade com o padrão aberto [agentskills.io](https://agentskills.io/specification) (SKILL.md).

## Problema
A maior parte das ferramentas genéricas de IA não possui precisão normativa necessária para o contexto jurídico brasileiro (CDC, CLT, CPC, LGPD, súmulas). Isso gera risco de alucinações e decisão jurídica errada. Há necessidade de um repositório estruturado que garanta qualidade normativa e rastreabilidade.

## Solução
A Sanfran.md entrega três peças principais:
1. **Lex** — IA nativa (GPT‑OSS‑120B) que itera com advogados para criar skills jurídicas seguindo uma meta‑skill própria, extraindo conhecimento tácito e estruturando no formato padrão de 3 níveis (progressive disclosure).
2. **Skills** — Cada skill é um diretório `SKILL.md` + recursos opcionais, validado contra o padrão `agentskills.io`, com versionamento e seções endereçáveis para edição em locus.
3. **Marketplace** — Distribuição pública/privada/organizacional das skills, com foco em qualidade normativa verificável (não em volume).

## Roadmap
- **Q1 2026** – MVP de criação de skills (Lex) e validação normativa.
- **Q2 2026** – Marketplace público com filtros avançados (Diretor, Tendências, Quente).
- **Q3 2026** – Dashboard de observabilidade (Streamlit) com métricas de uso e logs estruturados.
- **Q4 2026** – Integrações com IDEs, CI/CD e geração automática de badges.

## Começar rapidamente (Quick‑Start)
```bash
git clone https://github.com/yourorg/sanfran.git
cd sanfran
npm install   # ou yarn
npm run dev   # inicia o marketplace local
```
Acesse o Lex: [Começar no Lex](./apps/lex/README.md)

## Métricas de saúde
- **Skills publicadas**: {{SKILL_COUNT}}
- **Último deploy**: {{LATEST_DEPLOY}}
- **Cobertura de testes**: {{TEST_COVERAGE}}%
- **Taxa de conversão (visita → Lex)**: {{CONVERSION_RATE}}%

## Observabilidade
Acesse o dashboard de monitoramento em tempo real: [Dashboard](/dashboard)

### UI/Overlay de Revisão Humana
Quando o grafo pausa para revisão humana, um overlay será exibido permitindo ao usuário editar o draft da skill e continuar a entrevista via `/interview/continue`. Veja a documentação detalhada em [docs/UI-Overlay.md](./docs/UI-Overlay.md).


## Documentação
- `docs/visao.md` — visão de produto, posicionamento, não‑objetivos
- `docs/arquitetura.md` — arquitetura técnica e stack
- `docs/meta-skill.md` — especificação da meta‑skill que governa a Lex
- `docs/modelo-dados.md` — schema de dados
- `docs/fases.md` — plano de implementação por fases
- `docs/testes.md` — estratégia de testes

## Contribuir
1. Fork o repositório.
2. Crie uma branch `feature/<nome>`.
3. Abra um Pull Request descrevendo a mudança.
## Status

Projeto em fase de design. Nenhuma fase de implementação iniciada.

## Privacidade

- [Política de Privacidade](PRIVACY_POLICY.md)
- [Inventário de Dados](docs/data-inventory.md)
- [Banner de Consentimento](apps/web/src/components/ConsentBanner.tsx)
