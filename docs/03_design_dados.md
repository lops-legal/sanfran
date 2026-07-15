# 03 — Design de Dados
## agentskills.legal — Modelagem, Armazenamento, Exposição e Organização de Dados

> **Objetivo:** Documentar como os dados da plataforma são estruturados, armazenados, expostos e organizados, inferindo a arquitetura a partir das superfícies públicas observadas.

---

## 1. Entidades Principais

### 1.1 Skill

A entidade central da plataforma. Cada skill é um documento estruturado com instrução legal para AI.

```typescript
interface Skill {
  // Identificação
  slug: string;              // "litigation", "demand-letter" — URL-safe, único
  version: number;           // Inteiro incremental (ex: 4)

  // Conteúdo
  name: string;              // "Litigation Practice"
  description: string;       // Texto longo descritivo
  content: string;           // Conteúdo raw do SKILL.md (markdown)

  // Taxonomia
  tags: string[];            // ["drafting", "litigation", "letter"]
  skill_modes?: string[];    // ["analysis", "drafting"] — do YAML frontmatter

  // Autoria
  author: string;            // "Max Sonderby" | "casemark" | "Scott Kveton"
  author_github?: string;    // Handle do GitHub

  // Datas
  created_at: Date;          // "March 5, 2026"
  updated_at: Date;          // Data do último commit

  // Licença
  license: string;           // "Apache-2.0"
  language: string;          // "English"

  // Métricas (contadores)
  views: number;             // 1013
  downloads: number;         // 396
  uses: number;              // 159

  // Arquivos
  files: SkillFile[];        // Lista de arquivos incluídos no ZIP

  // Status
  is_featured: boolean;      // Aparece na seção "Featured Skills"
  is_active: boolean;        // Publicado/despublicado
}

interface SkillFile {
  filename: string;          // "SKILL.md", "LICENSE.txt", "NOTICE.txt"
  path: string;              // Caminho relativo na skill
  size_bytes?: number;
}
```

---

### 1.2 Tag / Área

```typescript
interface Tag {
  slug: string;              // "drafting", "litigation"
  label: string;             // "Drafting", "Litigation" — capitalizado
  skill_count: number;       // 396, 191, 189...
  is_featured: boolean;      // Aparece na seção "Browse by Tag"
}
```

**Tags observadas e contagens:**

| Tag           | Count | Tag           | Count |
|---------------|-------|---------------|-------|
| Drafting      | 396   | Summary       | 84    |
| Litigation    | 191   | Corporate     | 81    |
| Agreement     | 189   | Summarization | 79    |
| Transactional | 161   | Pleading      | 57    |
| Regulatory    | 132   | Research      | 42    |
| Analysis      | 88    | Letter        | 41    |

---

### 1.3 Author (Contribuidor)

```typescript
interface Author {
  id: string;                // "max-sonderby", "casemark", "scott-kveton"
  display_name: string;      // "Max Sonderby", "casemark"
  github_handle?: string;
  avatar_url?: string;       // Via GitHub avatar API
  skill_count: number;       // Número de skills publicadas
  is_org: boolean;           // true para "casemark" (organização)
}
```

---

### 1.4 APIKey (para acesso programático)

```typescript
interface APIKey {
  id: string;                // UUID
  key_hash: string;          // Hash SHA-256 da key (nunca armazenar plain)
  key_prefix: string;        // "sk_live_xxxx..." — exibido ao usuário
  user_id: string;           // FK para User
  
  tier: "free" | "paid" | "enterprise";
  rate_limit_daily: number;  // 50 | -1 (unlimited)
  
  created_at: Date;
  last_used_at?: Date;
  expires_at?: Date;
  is_revoked: boolean;
  
  label?: string;            // Nome amigável dado pelo usuário
}
```

---

### 1.5 SkillMetric (contadores de engajamento)

```typescript
interface SkillMetric {
  skill_slug: string;        // FK
  date: Date;                // Granularidade diária (para séries temporais)
  
  views_delta: number;       // Incremento do dia
  downloads_delta: number;
  uses_delta: number;
}

// View desnormalizada (totais):
interface SkillMetricTotal {
  skill_slug: string;
  views: number;
  downloads: number;
  uses: number;
  updated_at: Date;
}
```

---

### 1.6 MCPRequest (log de uso da API)

```typescript
interface MCPRequest {
  id: string;                // UUID
  timestamp: Date;
  
  method: "resolve_skill" | "read_skill" | "tools/list" | "tools/call";
  skill_slug?: string;       // Se read_skill
  query?: string;            // Se resolve_skill
  
  // Auth
  api_key_id?: string;       // null = free tier por IP
  ip_hash: string;           // Hash do IP (privacidade)
  
  // Response
  status_code: number;       // 200 | 429 | 404 | 500
  latency_ms: number;
  
  // Rate limiting
  rate_limit_remaining: number;
  rate_limit_reset_at: Date;
}
```

---

## 2. Fontes de Dados & Armazenamento

### 2.1 Fonte Primária: GitHub Repository

O repositório `github.com/CaseMark/skills` é a **fonte da verdade** para o conteúdo das skills.

```
skills/legal/
├── litigation/
│   ├── SKILL.md          → Conteúdo + frontmatter YAML
│   ├── LICENSE.txt
│   └── NOTICE.txt
├── demand-letter/
│   ├── SKILL.md
│   ├── LICENSE.txt
│   ├── NOTICE.txt
│   └── references/
│       └── ARCHETYPE-INDEX.md
├── medical-record-chronology/
│   └── SKILL.md
└── ...
```

**SKILL.md — Estrutura do frontmatter:**
```yaml
---
name: motion-to-dismiss
tags: [legal, litigation, pleading]
skill_modes: [analysis]
author: Max Sonderby
version: 3
license: Apache-2.0
language: en
---

# Título da Skill

## When to use this skill
...

## Step-by-step process
...
```

**Fluxo de ingestão:**
```
GitHub PR merged → GitHub Actions webhook → Ingestão/sync → Base de dados → CDN cache invalidado
```

---

### 2.2 Base de Dados Principal

**Recomendação state-of-the-art:** PostgreSQL via **Neon** (serverless Postgres) ou **Supabase**

```sql
-- Tabelas principais

CREATE TABLE skills (
  slug          TEXT PRIMARY KEY,
  version       INTEGER NOT NULL DEFAULT 1,
  name          TEXT NOT NULL,
  description   TEXT NOT NULL,
  content       TEXT NOT NULL,           -- Raw markdown do SKILL.md
  tags          TEXT[] NOT NULL DEFAULT '{}',
  skill_modes   TEXT[] NOT NULL DEFAULT '{}',
  author_id     TEXT REFERENCES authors(id),
  license       TEXT NOT NULL DEFAULT 'Apache-2.0',
  language      TEXT NOT NULL DEFAULT 'en',
  is_featured   BOOLEAN NOT NULL DEFAULT false,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  github_path   TEXT,                    -- Path relativo no repo
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE authors (
  id            TEXT PRIMARY KEY,
  display_name  TEXT NOT NULL,
  github_handle TEXT,
  is_org        BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tags (
  slug          TEXT PRIMARY KEY,
  label         TEXT NOT NULL,
  is_featured   BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE skill_tags (
  skill_slug    TEXT REFERENCES skills(slug) ON DELETE CASCADE,
  tag_slug      TEXT REFERENCES tags(slug) ON DELETE CASCADE,
  PRIMARY KEY (skill_slug, tag_slug)
);

CREATE TABLE skill_metrics_total (
  skill_slug    TEXT PRIMARY KEY REFERENCES skills(slug),
  views         BIGINT NOT NULL DEFAULT 0,
  downloads     BIGINT NOT NULL DEFAULT 0,
  uses          BIGINT NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE skill_metrics_daily (
  skill_slug    TEXT REFERENCES skills(slug),
  date          DATE NOT NULL,
  views         INTEGER NOT NULL DEFAULT 0,
  downloads     INTEGER NOT NULL DEFAULT 0,
  uses          INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (skill_slug, date)
);

CREATE TABLE api_keys (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash      TEXT NOT NULL UNIQUE,
  key_prefix    TEXT NOT NULL,
  user_id       TEXT NOT NULL,
  tier          TEXT NOT NULL DEFAULT 'free',
  rate_limit_daily INTEGER DEFAULT 50,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at  TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,
  is_revoked    BOOLEAN NOT NULL DEFAULT false,
  label         TEXT
);

CREATE TABLE mcp_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT now(),
  method        TEXT NOT NULL,
  skill_slug    TEXT,
  query         TEXT,
  api_key_id    UUID REFERENCES api_keys(id),
  ip_hash       TEXT NOT NULL,
  status_code   SMALLINT NOT NULL,
  latency_ms    INTEGER,
  rate_limit_remaining INTEGER
);
```

**Índices críticos:**
```sql
-- Busca full-text em skills
CREATE INDEX idx_skills_fts ON skills 
  USING GIN (to_tsvector('english', name || ' ' || description || ' ' || content));

-- Filtro por tag (array)
CREATE INDEX idx_skills_tags ON skills USING GIN (tags);

-- Ordenação por popularidade
CREATE INDEX idx_metrics_views ON skill_metrics_total (views DESC);
CREATE INDEX idx_metrics_uses ON skill_metrics_total (uses DESC);

-- Timestamps
CREATE INDEX idx_skills_updated ON skills (updated_at DESC);

-- Requests analytics
CREATE INDEX idx_requests_timestamp ON mcp_requests (timestamp DESC);
CREATE INDEX idx_requests_skill ON mcp_requests (skill_slug, timestamp DESC);
```

---

### 2.3 Cache Layer

**Estratégia multi-camada:**

```
[Cliente]
    ↓
[Vercel Edge Cache / CDN]        ← Skills estáticas, páginas ISR (TTL: 60s–5min)
    ↓
[Upstash Redis]                  ← Contadores de métricas, rate limiting, sessions
    ↓
[PostgreSQL / Neon]              ← Dados persistentes
    ↓
[GitHub API / Webhook]           ← Fonte da verdade para conteúdo
```

**Cache de skills no Redis:**
```
Key: skill:{slug}:content         → TTL: 300s (5min)
Key: skill:{slug}:metrics         → TTL: 60s
Key: skills:featured              → TTL: 300s
Key: skills:recent                → TTL: 60s
Key: skills:popular               → TTL: 120s
Key: tags:all                     → TTL: 3600s (1h)
Key: tag:{slug}:count             → TTL: 3600s
```

**Rate limiting no Redis:**
```
Key: ratelimit:ip:{ip_hash}       → Counter + TTL sliding window
Key: ratelimit:key:{api_key_id}   → Counter + TTL sliding window
```

---

### 2.4 Search Index

**Recomendação:** **Typesense** (self-hosted, open-source) ou **Algolia**

```json
// Schema do índice de skills no Typesense
{
  "name": "skills",
  "fields": [
    { "name": "slug", "type": "string" },
    { "name": "name", "type": "string" },
    { "name": "description", "type": "string" },
    { "name": "content", "type": "string" },
    { "name": "tags", "type": "string[]", "facet": true },
    { "name": "author", "type": "string", "facet": true },
    { "name": "views", "type": "int64", "sort": true },
    { "name": "downloads", "type": "int64", "sort": true },
    { "name": "uses", "type": "int64", "sort": true },
    { "name": "updated_at", "type": "int64", "sort": true }
  ],
  "default_sorting_field": "views"
}
```

---

## 3. Exposição de Dados (APIs Públicas)

### 3.1 MCP Endpoint (JSON-RPC 2.0)

**URL:** `https://skills.case.dev/api/mcp`

```
POST /api/mcp
Content-Type: application/json
Authorization: Bearer {api_key}  ← opcional; sem key = free tier por IP

// Método: tools/list
Request:
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}

Response:
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "resolve_skill",
        "description": "Search for skills by task description",
        "inputSchema": { "type": "object", "properties": { "query": { "type": "string" } } }
      },
      {
        "name": "read_skill",
        "description": "Get full content of a skill",
        "inputSchema": { "type": "object", "properties": { "slug": { "type": "string" } } }
      }
    ]
  }
}

// Método: resolve_skill
Request:
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "resolve_skill",
    "arguments": { "query": "demand letter" }
  }
}

Response:
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Found skill: demand-letter\nURL: https://agentskills.legal/skills/demand-letter.md\n..."
      }
    ]
  }
}
```

---

### 3.2 Direct Markdown URLs

```
GET https://agentskills.legal/skills/{slug}.md

Response: text/markdown
Cache-Control: public, s-maxage=300, stale-while-revalidate=600

Corpo: Conteúdo raw do SKILL.md com frontmatter YAML preservado
```

Este endpoint é a interface primária para AIs consumirem skills diretamente — sem autenticação.

---

### 3.3 llms.txt

```
GET https://agentskills.legal/llms.txt

Response: text/plain
Conteúdo: Manifesto machine-readable descrevendo:
  - O que é a plataforma
  - Como acessar skills (URL pattern)
  - Como usar o MCP endpoint
  - Lista de skills disponíveis (ou referência ao catálogo)
```

---

### 3.4 OG Image Endpoint (Edge)

```
GET https://agentskills.legal/skills/{slug}/opengraph-image

Response: image/png (1200×630)
Gerado dinamicamente com @vercel/og
Conteúdo: Nome da skill + descrição truncada + branding
Cache: imutável por hash de conteúdo
```

---

## 4. Fluxo de Dados: Ciclo Completo

### 4.1 Ingestão de Nova Skill (GitHub → Plataforma)

```
1. Contribuidor abre PR no GitHub
   └─ Adiciona pasta: skills/legal/nova-skill/SKILL.md

2. CI/CD valida:
   - Frontmatter YAML obrigatório (name, tags)
   - SKILL.md não vazio
   - Slug não conflita com existente
   - Licença presente

3. Maintainer aprova e faz merge

4. GitHub Actions dispara webhook → POST /api/sync

5. Serviço de sync:
   a. Clona/pull do repositório
   b. Parse do SKILL.md (gray-matter ou similar)
   c. Extrai campos: slug, name, description, tags, author, version
   d. UPSERT na tabela `skills` do PostgreSQL
   e. Recalcula `tag_count` na tabela `tags`
   f. Indexa no Typesense
   g. Invalida cache Redis (skill:{slug}:*)
   h. Revalida ISR do Next.js (revalidatePath)

6. Skill aparece no site em < 60 segundos
```

### 4.2 Contabilização de Métricas

```
Usuário visita /skills/[slug]
    ↓
Server Component renderiza página (ISR)
    ↓
Client Component executa: POST /api/metrics/view { slug }
    ↓
API Route:
  a. INCR skill:{slug}:views_buffer no Redis
  b. Retorna 200 imediatamente (não bloqueia UI)
    ↓
Worker periódico (Cron, a cada 1min):
  a. Lê buffers do Redis
  b. Flush para skill_metrics_total (UPDATE views += delta)
  c. INSERT em skill_metrics_daily (data atual)
  d. Zera buffer Redis
```

**Por que buffer?** Evita write amplification no PostgreSQL com tráfego alto. Aceita perda de ≤1min de dados.

### 4.3 Consulta de Skills (Search Flow)

```
Usuário digita no search bar
    ↓
Debounce 300ms no cliente
    ↓
GET /api/skills/search?q=demand+letter&area=Drafting&page=1
    ↓
API Route:
  1. Verifica cache Redis: skills:search:{hash(params)}
     └─ Cache hit: retorna imediatamente (TTL 30s)
  2. Cache miss:
     a. Consulta Typesense com facets
     b. Enriquece com métricas do Redis
     c. Retorna JSON paginado
     d. Escreve no cache Redis
    ↓
Cliente renderiza cards
```

---

## 5. Estrutura JSON de Resposta da API (Skills)

### 5.1 Lista de Skills

```json
{
  "skills": [
    {
      "slug": "demand-letter",
      "name": "Pre-Suit Demand Letter",
      "description": "Drafts litigation-ready U.S. pre-suit demand letters...",
      "tags": ["drafting", "letter", "litigation"],
      "author": "Scott Kveton",
      "version": 3,
      "updated_at": "2026-03-05T00:00:00Z",
      "metrics": {
        "views": 495,
        "downloads": 223,
        "uses": 115
      },
      "url": "https://agentskills.legal/skills/demand-letter",
      "markdown_url": "https://agentskills.legal/skills/demand-letter.md"
    }
  ],
  "meta": {
    "total": 883,
    "page": 1,
    "per_page": 24,
    "total_pages": 37
  }
}
```

### 5.2 Skill Individual (Detail)

```json
{
  "slug": "litigation",
  "name": "Litigation Practice",
  "description": "Root reference for litigation practice...",
  "content": "# Litigation Practice\n\nRoot skill for...",
  "tags": [],
  "skill_modes": [],
  "author": {
    "id": "max-sonderby",
    "display_name": "Max Sonderby",
    "github_handle": "maxsonderby"
  },
  "license": "Apache-2.0",
  "language": "en",
  "version": 4,
  "created_at": "2026-01-15T00:00:00Z",
  "updated_at": "2026-03-05T00:00:00Z",
  "metrics": {
    "views": 1013,
    "downloads": 396,
    "uses": 159
  },
  "files": [
    { "filename": "SKILL.md", "path": "litigation/SKILL.md" },
    { "filename": "LICENSE.txt", "path": "litigation/LICENSE.txt" },
    { "filename": "NOTICE.txt", "path": "litigation/NOTICE.txt" }
  ],
  "github": {
    "edit_url": "https://github.com/CaseMark/skills/edit/main/skills/legal/litigation/SKILL.md",
    "tree_url": "https://github.com/CaseMark/skills/tree/main/skills/legal/litigation"
  },
  "urls": {
    "page": "https://agentskills.legal/skills/litigation",
    "markdown": "https://agentskills.legal/skills/litigation.md",
    "try": "https://app.casemark.com/try?skill=litigation",
    "download": "https://agentskills.legal/skills/litigation/download"
  }
}
```

---

## 6. Privacidade & Compliance

| Dado                  | Armazenado?       | Retenção           | Notas                                      |
|-----------------------|-------------------|--------------------|--------------------------------------------|
| Conteúdo de queries   | Não (declarado)   | Zero               | "We don't store any of your queries"       |
| IP de visitantes      | Hash SHA-256 only | 30 dias (logs)     | Nunca plain text                           |
| Conteúdo gerado       | Não               | Zero               | Processado localmente no AI do usuário     |
| Skills (conteúdo)     | Sim, público      | Indefinido         | Apache 2.0, open-source                    |
| Métricas agregadas    | Sim               | Indefinido         | Views/downloads/uses sem PII               |
| API Key               | Hash only         | Até revogação      | Key prefix exibida; hash armazenado        |
| Logs MCP requests     | Sim (anonimizado) | 90 dias            | Para rate limiting e analytics             |

**Certificações declaradas em `/integrate`:**
- SOC 2 Type II
- HIPAA Compliant
- Zero-retention AI agreements (para LLMs gateway)

---

## 7. Stack de Dados (State-of-the-Art)

```
Banco de dados:       Neon (serverless PostgreSQL) ou Supabase
ORM:                  Drizzle ORM (TypeScript-first, edge-compatible)
Cache / Rate limit:   Upstash Redis (serverless, edge-compatible)
Search:               Typesense (self-hosted) ou Algolia
Queue / Workers:      Trigger.dev ou Inngest (background jobs tipados)
File storage:         Vercel Blob (ZIPs de download) ou Cloudflare R2
Analytics de dados:   Tinybird (data platform para eventos em tempo real)
Monitoramento DB:     Neon branching para preview DBs por PR
Migrations:           Drizzle Kit (schema migrations versionadas)
Sync GitHub:          GitHub Webhooks → Vercel Edge Function
Parsing YAML/MD:      gray-matter + unified/remark
Validação de schema:  Zod (runtime) + TypeScript (compile time)
Segredos:             Vercel Environment Variables + Doppler
```

---

## 8. Diagrama de Dependências de Dados

```
GitHub Repo (fonte da verdade)
    │
    ├─→ Webhook → Sync Service → PostgreSQL (skills, authors, tags)
    │                                  │
    │                                  ├─→ Typesense (search index)
    │                                  └─→ Redis (cache de listas/cards)
    │
    ├─→ GitHub API → author.avatar_url (tempo real)
    │
    └─→ CDN (markdown raw .md files)
              │
              └─→ Vercel Edge Cache

PostgreSQL (métricas)
    ↑
    └─ Redis buffer ← API /metrics/view ← Client Components

Upstash Redis
    ├─ Rate limiting (MCP requests por IP / API key)
    ├─ Cache de skills (TTL 5min)
    └─ Métricas buffer (flush 1min)

console.case.dev (externo)
    └─ API Keys → PostgreSQL (api_keys table)
```
