# Modelo de Dados

Postgres + `pgvector`. Schema inicial — sujeito a evolução nas fases de implementação.

## Organizações e usuários

```sql
organizations (
  id, name, plan, created_at
)

users (
  id, org_id, email, role, oab_number NULLABLE, created_at
)
```

## Skills

```sql
skills (
  id,
  owner_org_id,
  owner_user_id,
  slug,
  title,
  category_tags TEXT[],        -- categorização livre por área de prática
  visibility ENUM('private','org','public'),
  current_version_id,
  created_at,
  updated_at
)
```

## Versões de skill

```sql
skill_versions (
  id,
  skill_id,
  version_number,
  skill_md_content TEXT,         -- conteúdo completo do SKILL.md (frontmatter + corpo)
  resources JSONB,               -- metadados de FORMS.md/REFERENCE.md/scripts/ (ponteiros para storage)
  content_hash,
  changelog TEXT,
  norma_referencia JSONB,        -- leis/súmulas/resoluções estruturadas
  token_count_level1 INT,
  token_count_level2 INT,
  validation_status ENUM('valid','invalid','pending'),
  created_by,
  created_at
)
```

## Seções endereçáveis (edição em locus)

```sql
skill_sections (
  id,
  skill_version_id,
  level INT,                      -- 1, 2 ou 3
  section_key TEXT,                -- ex: 'papel_agente', 'normas_referencia',
                                    -- 'padrao_entrega', 'limites_autonomia',
                                    -- 'casos_teste', 'exemplos'
  content TEXT,
  order_index INT,
  embedding VECTOR(1536)
)
```

## Índice de descoberta (Level 1)

```sql
skill_level1_index (
  id,
  skill_version_id,
  summary_text TEXT,               -- conteúdo do Level 1 (Quick Start)
  embedding VECTOR(1536),
  source ENUM('internal','external'),  -- skills da plataforma vs. indexadas de
                                         -- diretórios externos compatíveis
  external_source_url TEXT NULLABLE
)
```

## Grafo de relações entre skills

```sql
skill_links (
  source_skill_id,
  target_skill_id,
  relation_type ENUM('references','extends','similar_to'),
  weight FLOAT,
  created_at
)
```

`relation_type='references'` é criado automaticamente quando a Lex consulta uma skill existente durante a criação/edição de outra (contexto recursivo). Alimenta métricas de influência exibidas na marketplace.

## Casos de teste

```sql
skill_test_cases (
  id,
  skill_version_id,
  input_text TEXT,
  expected_output_contains TEXT,
  expected_output_format TEXT,
  last_run_result ENUM('pass','fail','not_run'),
  last_run_at TIMESTAMP NULLABLE
)
```

## Log de uso da Lex (custo/observabilidade)

```sql
lex_interactions (
  id,
  org_id,
  user_id,
  skill_id NULLABLE,
  interaction_type ENUM('create','edit_section','query_context'),
  tokens_in INT,
  tokens_out INT,
  model_provider TEXT,
  created_at
)
```

## Sessão de criação (memória externa)

```sql
lex_sessions (
  id,
  org_id,
  user_id,
  skill_id NULLABLE,              -- preenchido quando a sessão resulta em skill salva
  session_state JSONB,            -- estado estruturado da entrevista (etapas da meta-skill)
  created_at,
  updated_at
)
```

Mantém o progresso da entrevista estruturada da meta-skill entre turnos, sem depender da janela de contexto do modelo.

## Sumário de relações

```
organizations 1──N users
organizations 1──N skills
skills 1──N skill_versions
skill_versions 1──N skill_sections
skill_versions 1──N skill_test_cases
skill_versions 1──1 skill_level1_index
skills N──N skills (via skill_links)
users 1──N lex_interactions
users 1──N lex_sessions
```
```
