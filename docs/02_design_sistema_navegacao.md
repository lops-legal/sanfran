# 02 — Design de Sistema & Navegação
## agentskills.legal — Lógica, Fluxos, UX e Arquitetura de Features

> **Objetivo:** Documentar toda a lógica de navegação, perfis de usuário, fluxos de uso, features e experiência oferecida pela plataforma.

---

## 1. Mapa do Site (Sitemap)

```
agentskills.legal/
├── /                          → Homepage (landing + how it works)
├── /skills                    → Catálogo completo (browsing + search + filter)
│   ├── /skills?area=Drafting  → Filtro por tag
│   ├── /skills?area=Litigation
│   └── /skills/[slug]         → Detail page de skill individual
│       └── /skills/[slug].md  → Raw markdown da skill (consumível por IA)
├── /integrate                 → Página para devs/empresas (SDK, API, private

```

**Externo (ecossistema):**
```
app.casemark.com/              → Workspace AI legal (produto principal)
  └── /try?skill=[slug]        → Deep link para executar skill no CaseMark
skills.case.dev/api/mcp        → Endpoint MCP (Model Context Protocol)
console.case.dev               → Dashboard de API keys
docs.case.dev/agent-skills     → Documentação técnica profunda
github.com/CaseMark/skills     → Repositório open-source das skills
```

---

## 2. Perfis de Usuário & Jornadas

### 2.1 Perfis Identificados

| Perfil                      | Objetivo principal                                | Nível técnico |
|-----------------------------|---------------------------------------------------|---------------|
| **Advogado / Legal Pro**    | Encontrar skill e usar no AI assistant favorito   | Baixo–médio   |
| **Paralegal / Clerk**       | Agilizar tarefas repetitivas (summarization, drafting) | Baixo     |
| **Legal Tech Builder**      | Integrar skills via API/MCP na própria plataforma | Alto          |
| **LLM Power User**          | Configurar MCP no Claude Desktop / Cursor         | Médio–alto    |
| **AI Agent / Bot**          | Consumir `/skills/[slug].md` programaticamente    | N/A (máquina) |
| **Org / Enterprise**        | Criar private skills para fluxos internos         | Médio–alto    |

---

### 2.2 Jornada: Advogado (usuário casual)

```
Entrada → Homepage
    ↓
Lê H1 + subtítulo (entende a proposta em <10s)
    ↓
Digita na search bar ("demand letter", "contract review")
    ↓
Resultado → /skills com lista filtrada
    ↓
Clica em card de skill → /skills/[slug]
    ↓
Lê título + descrição + SKILL.md preview
    ↓
Escolhe ação:
  A) "Try this skill now" → redireciona para app.casemark.com/try?skill=[slug]
     → CaseMark abre workspace pré-carregado com a skill
     → Usuário digita seu caso e executa
  B) "Copy skill link" → copia URL da skill
     → Cola no Claude / ChatGPT / Gemini
     → Adiciona o contexto do caso
     → AI executa a skill
    ↓
Fim (tarefa realizada sem criar conta)
```

**Fricção zero:** nenhum login obrigatório para descoberta e uso básico.

---

### 2.3 Jornada: Developer / Legal Tech Builder

```
Entrada → /integrate (ou /docs)
    ↓
Lê overview do case.dev SDK + 15 serviços
    ↓
Clica "Get Your API Key" → console.case.dev
    ↓
Cria conta → obtém chave
    ↓
Escolhe modo de integração:

  [MCP Protocol]               [Direct URLs]            [REST API]
  Configura endpoint           Fetch /skills/slug.md    JSON-RPC 2.0
  no Claude Desktop            em RAG pipeline          POST /api/mcp
  ou Cursor                    ou no prompt             resolve_skill / read_skill
         ↓                           ↓                        ↓
  AI auto-descobre skills      Cacheia localmente        Busca programática
  sem intervenção              no sistema                filtrada por query
    ↓
Consome Vaults / LLMs / OCR / Voice via SDK unificado
    ↓
(Opcional) Contrata private skills com CaseMark
    ↓
Deploy em produção
```

---

### 2.4 Jornada: LLM Power User (MCP Setup)

```
Entrada → Homepage (seção "Power Setup: MCP Integration")
    ↓
Seleciona client: Claude Desktop | Cursor | ChatGPT
    ↓
Copia snippet de config JSON exibido
    ↓
Cola no arquivo de config local (~/.config/...)
    ↓
Reinicia o AI assistant
    ↓
AI agora auto-descobre skills via MCP endpoint
    ↓
Free tier: 50 req/day por IP (sem API key)
Com API key: ilimitado
```

---

### 2.5 Jornada: AI Agent (machine-to-machine)

```
Agent recebe task legal
    ↓
Chama resolve_skill(query="contract drafting")
→ Retorna slug + metadados
    ↓
Chama read_skill(slug="contract-playbook-review")
→ Retorna markdown completo da skill
    ↓
Injeta conteúdo no prompt do LLM
    ↓
Executa tarefa com skill como instrução estruturada
    ↓
(Opcional) Usa case.dev Vaults para salvar output
```

---

## 3. Arquitetura de Features

### 3.1 Homepage

| Feature                      | Comportamento                                                      |
|------------------------------|--------------------------------------------------------------------|
| Banner Slack                 | Sticky no topo; dismissível via X (estado salvo em localStorage)   |
| Search bar hero              | Input com debounce 300ms; navega para `/skills?q=query` no enter   |
| Stat dinâmico "883+"         | Valor fetchado da API ou hardcoded + revalidação ISR               |
| "How it works" steps         | Componentes estáticos, scroll-reveal com Framer Motion             |
| "Get Started" tabs           | CaseMark | Claude | ChatGPT | Gemini — troca de conteúdo de instrução |
| Featured Skills grid         | 6 cards; dados da API; ordenados por popularidade                  |
| MCP config tabs              | Claude Desktop | Cursor | ChatGPT — troca snippet de config        |
| Tabela MCP vs File-Based     | Estática                                                           |

---

### 3.2 /skills — Catálogo

| Feature                      | Comportamento                                                      |
|------------------------------|--------------------------------------------------------------------|
| Search input                 | Query param `?q=`; filtra server-side ou client-side com debounce  |
| Filtro por Tag               | Dropdown multi-select; param `?area=`; múltiplos acumulam com `,`  |
| Seção "Popular Skills"       | Top 6 por combinação de views + downloads + uses                   |
| Seção "Recently Updated"     | Skills com updated_at mais recente                                 |
| "Browse by Tag"              | Grid de tags clicáveis com contagem; atalho para filtro            |
| Grid "All Skills"            | Paginação: 24 por página; params `?page=N`                         |
| Paginação                    | Previous | N | ... | 37 | Next — numeração real                    |
| Loading state                | Skeleton cards (3 colunas × 2 linhas)                              |
| Empty state                  | Mensagem + sugestão de ampliar busca                               |
| Card de skill                | Título, descrição truncada, autor, tags, métricas                  |

---

### 3.3 /skills/[slug] — Detail Page

| Feature                      | Comportamento                                                      |
|------------------------------|--------------------------------------------------------------------|
| Breadcrumb                   | `/ > Skills > [Título]` — links funcionais                        |
| Header da skill              | Título H1, autor com avatar, data de criação/atualização           |
| Descrição                    | Texto completo (pode ser longo)                                    |
| File tree "What's Included"  | Lista de arquivos da skill (SKILL.md, LICENSE, NOTICE, refs)       |
| SKILL.md viewer              | Markdown renderizado inline na página                              |
| Sidebar — Métricas           | Views | Downloads | Uses em tempo real (ou near-real-time)          |
| Sidebar — Metadata           | Author, License (Apache 2.0), Language, Version, Updated           |
| "Try this skill now"         | CTA primário; deep link para CaseMark                              |
| "Download Skill"             | Baixa .zip com SKILL.md + LICENSE + NOTICE                         |
| "Copy skill link"            | Copia URL atual para clipboard; toast de confirmação "Copied!"     |
| "Suggest Edits on GitHub"    | Link direto para GitHub edit do SKILL.md                           |
| "Fork as New Skill"          | Link para GitHub tree da pasta da skill                            |

---

### 3.4 /integrate — Builder Page

| Seção                         | Feature                                                           |
|-------------------------------|-------------------------------------------------------------------|
| Hero                          | CTA triplo: API Key, Slack, Docs, Get in Touch                    |
| Trust badges                  | SOC 2, HIPAA, Zero-retention — visíveis imediatamente             |
| Services grid (15+ serviços)  | Cards iconizados: Vaults, LLMs, OCR, Voice, Skills, Research...   |
| Integrate options             | 3 tabs: MCP Protocol | Direct URLs | REST API                      |
| Code snippets                 | Por opção de integração; copiáveis                                |
| Private Skills section        | Steps 1-2-3 (Share → Build → Deploy) + use cases por segmento    |
| CaseMark / case.dev cards     | Links para produtos relacionados                                  |
| Contact form                  | "Talk to a Human" → mailto:sales@casemark.com                     |

---

### 3.5 /docs — Documentação

| Seção                         | Feature                                                           |
|-------------------------------|-------------------------------------------------------------------|
| On-page TOC                   | Links âncora fixos (sticky no scroll)                             |
| "What are Skills?"            | Anatomia de uma skill com code block exemplo                      |
| "Getting Started"             | 3 opções descritas em prosa + links                               |
| API Reference                 | `resolve_skill` + `read_skill` com exemplos JSON-RPC              |
| `curl` test snippet           | Copiável; testa o endpoint público                                |
| Rate limits table             | Free tier vs API key                                              |
| FAQ accordion                 | 8 perguntas; expand/collapse individual                           |
| Quick links no topo           | Quick Setup | Browse Skills | Contribute on GitHub | Join Slack   |

---

## 4. Sistema de Navegação

### 4.1 Nav Global

```
[Banner Slack]
[Logo agentskills.legal] ............ [Skills] [Integrate] [Docs]
```

- **Active state:** Link da página atual com `color-text-primary` e/ou underline sutil
- **Mobile:** Nav colapse em hambúrguer (menu sheet lateral)
- **Sticky:** Permanece visível em scroll com glassmorphism

### 4.2 Navegação Interna por Página

| Página     | Navegação interna                                                |
|------------|------------------------------------------------------------------|
| Homepage   | Smooth scroll para `#setup`, `#mcp-setup` via links âncora      |
| /skills    | Filtros alteram URL sem reload (router.push shallow)             |
| /skills/[slug] | Breadcrumb; sidebar fixa em desktop (sticky)               |
| /docs      | TOC sticky com highlight da seção ativa (IntersectionObserver)   |

### 4.3 Deep Links Cross-Platform

| Destino                          | URL Pattern                                  |
|----------------------------------|----------------------------------------------|
| Executar skill no CaseMark       | `app.casemark.com/try?skill=[slug]`          |
| Raw markdown da skill para IA    | `agentskills.legal/skills/[slug].md`         |
| MCP endpoint direto              | `skills.case.dev/api/mcp`                    |
| Console de API                   | `console.case.dev`                           |
| GitHub edit de skill             | `github.com/CaseMark/skills/edit/main/skills/legal/[slug]/SKILL.md` |
| GitHub fork de skill             | `github.com/CaseMark/skills/tree/main/skills/legal/[slug]` |
| Slack community                  | `agentskills.legal/slack` (redirect)         |

---

## 5. Features do Sistema por Camada

### 5.1 Camada de Descoberta (Discovery)

- **Full-text search** sobre título + descrição + tags das skills
- **Filtro por tag/área** (Drafting, Litigation, Agreement, etc.) — 12 categorias
- **Ordenação:** Popular | Recently Updated | Alphabetical (implícito)
- **Paginação:** 24 skills por página, 37 páginas (883 skills)
- **llms.txt:** manifesto machine-readable para que bots/AIs descubram o catálogo
- **MCP resolve_skill:** busca semântica programática por task description

### 5.2 Camada de Consumo (Usage)

- **CaseMark Try:** execução imediata, zero fricção, sem conta
- **Copy & Paste:** URL como instrução universal para qualquer AI
- **Download ZIP:** skill + licença + notice, para uso offline/embedded
- **MCP read_skill:** leitura programática completa do conteúdo

### 5.3 Camada de Contribuição (Creation)

- **GitHub PRs:** skill novas via pull request no repositório público
- **Private Skills:** criação curada pelo time da CaseMark (serviço pago/enterprise)
- **Versionamento:** cada skill tem `Version` (inteiro incremental)
- **Autoria:** `metadata.author` + `metadata.github` nos arquivos SKILL.md
- **Licença:** Apache 2.0 por padrão (open-source)

### 5.4 Camada de Integração (Developer)

- **MCP Protocol:** JSON-RPC 2.0, compatível com Claude Desktop, Cursor, Windsurf
- **REST API:** endpoint único `skills.case.dev/api/mcp`
- **Direct URLs:** cada skill tem URL markdown pública e estável
- **SDK unificado (case.dev):** acesso a Vaults, LLMs, OCR, Voice, Research, SuperDoc, Translation
- **API Key:** obtida em `console.case.dev`; desbloqueia rate limit ilimitado

### 5.5 Rate Limits

| Tier       | Requests/day | Auth              |
|------------|--------------|-------------------|
| Free       | 50 req/dia   | Por IP (sem key)  |
| API Key    | Ilimitado    | Header Bearer     |

---

## 6. UX Patterns & Princípios

### 6.1 Zero-Friction Discovery
> Usuário não precisa criar conta, logar ou instalar nada para encontrar e usar uma skill. O produto entrega valor antes de pedir comprometimento.

### 6.2 Progressive Enhancement
1. **Nível 0:** Lê o site como catálogo estático
2. **Nível 1:** Usa CaseMark (click, sem conta)
3. **Nível 2:** Cola URL no AI assistente favorito
4. **Nível 3:** Configura MCP para auto-discovery
5. **Nível 4:** Integra API no próprio produto
6. **Nível 5:** Cria private skills organizacionais

### 6.3 AI-Native Design
- Cada skill é também um arquivo `.md` consumível por máquinas
- `llms.txt` documenta a plataforma para bots
- MCP é tratado como cidadão de primeira classe
- URLs são a "API" para usuários humanos **e** para AIs simultaneamente

### 6.4 Trust Signals
- SOC 2 Type II, HIPAA, Zero-retention — visíveis no fold acima da dobra em `/integrate`
- Apache 2.0 em cada skill (transparência de licença)
- Autoria nominal por especialista jurídico em cada skill
- Links diretos para GitHub (auditável)
- Métricas públicas (views/downloads/uses) como prova social

### 6.5 Comunidade como Feature
- Banner Slack sempre visível
- GitHub como canal de contribuição
- Atribuição de autor nas skills (incentiva contribuição)
- "Powered by case.dev" + "Built in SF" como identidade de marca/comunidade

---

## 7. Stack de Implementação de Sistema & Navegação (State-of-the-Art)

```
Framework:         Next.js 15 (App Router, Server Components)
Roteamento:        App Router com route groups e parallel routes
Busca/Filtro:      Algolia InstantSearch (ou Orama para self-hosted)
                   Nuqs para URL state management (search params tipados)
Paginação:         Server-side com cursor pagination ou offset
State global:      Zustand (leve, sem boilerplate)
Forms:             React Hook Form + Zod (validação)
Fetching:          TanStack Query v5 (cache, revalidação, infinite scroll)
MCP Server:        @modelcontextprotocol/sdk (TypeScript)
API:               Next.js Route Handlers (Edge Runtime onde possível)
Auth (futuro):     Clerk ou NextAuth v5 (para API keys / enterprise)
Toasts:            Sonner
Clipboard:         navigator.clipboard API nativa
Analytics:         Vercel Analytics + PostHog (self-hosted)
Error tracking:    Sentry
Rate limiting:     Upstash Redis + @upstash/ratelimit
Feature flags:     Vercel Edge Config
Deploy:            Vercel (Edge Network, ISR, Edge Middleware)
```
