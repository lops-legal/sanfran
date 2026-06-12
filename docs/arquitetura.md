# Arquitetura

## Visão geral

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Next.js / React)                                  │
│  Abas: Lex | Marketplace | Minha Organização | Conta        │
└───────────────┬─────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│  API Gateway (Go)                                            │
│  Auth, rate limit, roteamento                                │
└───┬─────────────┬──────────────┬──────────────┬─────────────┘
    │             │              │              │
┌───▼───┐   ┌─────▼─────┐  ┌─────▼──────┐  ┌────▼─────────┐
│ Lex    │   │ Skills    │  │ Validador  │  │ Scanner de   │
│ Engine │   │ Service   │  │ SKILL.md   │  │ Segurança    │
│(Python)│   │ (Go)      │  │ (conform.  │  │ (publicação) │
│        │   │           │  │ agentskills)│  │              │
└───┬───┘   └─────┬─────┘  └────────────┘  └──────────────┘
    │             │
┌───▼─────────────▼──────────────────────────────────────────┐
│  Postgres (skills, versões, orgs, users) + pgvector          │
│  Object storage (R2) — diretórios de skill (.md, recursos)  │
│  Redis — cache, fila de jobs, rate limit                     │
└───────────────────────────────────────────────────────────┘
```

## Componentes

### Frontend
Next.js 15 (App Router) + Tailwind + shadcn/ui. Server components para marketplace (indexável), client components para o editor/chat da Lex.

### API Gateway / Backend principal
Go (Fiber ou Chi). CRUD de skills, auth, orquestração, billing.

### Lex Engine
Serviço Python separado (FastAPI + LangGraph), comunicação via gRPC ou REST interno com o backend Go.

**Modelo**: GPT-OSS-120B via provider serverless (Groq ou Cerebras para baixa latência em edições iterativas), com camada de abstração compatível com OpenAI API para permitir fallback/troca de provider (ex: DigitalOcean, Together.ai) sem reescrever integração.

### Validador de SKILL.md
Serviço/biblioteca que valida conformidade com a especificação `agentskills.io`: estrutura de YAML frontmatter, presença e limites de tokens dos 3 níveis (Level 1 <2.000 tokens, Level 2 <5.000 tokens, Level 3 sob demanda via filesystem), naming conventions. Executado em toda criação/edição/importação de skill.

### Scanner de Segurança
Análise estática do conteúdo de skills antes de publicação pública — verificação de padrões de prompt injection, instruções de exfiltração de dados, conteúdo malicioso. Escopo enxuto na fase inicial.

### Banco de dados
Postgres + extensão `pgvector`. Um único banco para dados relacionais (orgs, users, skills, versões) e embeddings — evita operar vector DB separado na fase inicial.

### Storage
Cloudflare R2 (S3-compatible, sem egress fee) — diretórios de skill completos (`SKILL.md` + `FORMS.md`/`REFERENCE.md`/`scripts/` quando existirem).

### Cache / Fila
Redis + Asynq (Go) — cache de busca recursiva, fila de jobs assíncronos (indexação, validação, scanning).

### Auth e Billing
Clerk ou Auth.js para auth multiusuário/multi-org. Stripe para billing por organização.

## Formato de skill

Toda skill segue literalmente o padrão `agentskills.io`:

```
skill-name/
├── SKILL.md          (obrigatório — YAML frontmatter + corpo Markdown)
├── FORMS.md          (opcional)
├── REFERENCE.md      (opcional)
└── scripts/          (opcional)
```

`SKILL.md` é estruturado em progressive disclosure de 3 níveis:

- **Level 1 — Quick Start** (<2.000 tokens): Sempre carregado, resumo executivo da skill
- **Level 2 — Implementation** (<5.000 tokens): Carregado quando a skill é ativada
- **Level 3 — Recursos externos**: Custo zero de contexto, acessado via filesystem/tool sob demanda (referências normativas extensas, exemplos de petições, etc.)

Essa estrutura resolve nativamente o requisito de "skills que gastam pouco token e aumentam qualidade de saída" — não é necessária uma camada de cache customizada adicional para esse fim.

## Edição em locus

Cada skill é armazenada tanto como diretório completo (fonte da verdade para exportação) quanto decomposta em seções endereçáveis (`skill_sections`) alinhadas aos 3 níveis e subseções dentro de cada nível (papel do agente, normas de referência, padrão de entrega, limites de autonomia, exemplos).

Fluxo:
1. Usuário solicita edição de uma seção específica
2. Lex recebe apenas aquela seção + resumo das demais como contexto
3. Lex gera o novo trecho
4. Backend reconstrói o `SKILL.md`, recalcula hash, cria nova versão, atualiza embedding apenas da seção alterada

## Contexto recursivo

Busca em duas etapas, alinhada à própria estrutura de progressive disclosure do padrão:

1. **Descoberta**: índice vetorial sobre o Level 1 (resumos) de toda a base — pública, da organização e (opcionalmente) de skills externas indexadas de diretórios compatíveis com `agentskills.io`
2. **Recuperação**: ao identificar skills relevantes via busca sobre Level 1, a Lex recupera Level 2/3 dessas skills sob demanda via tool calling — não carrega documentos inteiros

O grafo de relações entre skills (`skill_links`) registra quando uma skill é referenciada na criação de outra, alimentando ranking de relevância e métricas de influência na marketplace.

## Compatibilidade externa

- Exportação compatível com `npx skills add` (CLI do ecossistema `agentskills.io`/skills.sh)
- MCP server opcional, de fase tardia, expondo `search_skills`, `get_skill`, `get_skill_section` para uso dinâmico em agentes externos (Claude, ChatGPT, etc.)
