-- ==============================================================================
-- SANFRAN.MD — SCHEMA COMPLETO DO SUPABASE
-- ==============================================================================
-- Instruções:
--   1. Crie um projeto novo em https://supabase.com
--   2. Vá em SQL Editor
--   3. Cole este script inteiro e rode
--   4. Anote a Project URL (Settings > API) e a anon key
--   5. Me mande as credenciais para continuar
-- ==============================================================================

-- 0. Extensões necessárias
create extension if not exists "uuid-ossp";
create extension if not exists "unaccent";
create extension if not exists "vector";         -- pgvector para embeddings
-- pg_cron (opcional): ativar em Database > Extensions no dashboard

-- ==============================================================================
-- 1. Tabelas de Lookup
-- ==============================================================================

create table verticals (
  id           text primary key,
  name         text not null,
  description  text,
  accent_color text default 'slate',
  sort_order   int2 default 0
);

create table task_categories (
  id         text primary key,
  name       text not null,
  sort_order int2 default 0
);

-- ==============================================================================
-- 2. Perfis de Usuários
-- ==============================================================================

create table profiles (
  id           uuid primary key references auth.users on delete cascade,
  username     text unique not null,
  display_name text,
  avatar_url   text,
  oab_verified boolean default false,
  created_at   timestamptz default now()
);

-- ==============================================================================
-- 3. Tabela Principal: SKILLS
-- ==============================================================================

create table skills (
  id                      uuid primary key default uuid_generate_v4(),
  slug                    text unique not null,
  name                    text not null,
  description             text not null default '',
  markdown_body           text not null,
  version                 text not null default '1.0.0',
  language                text not null default 'en',

  -- Status
  is_published            boolean default false,
  is_draft                boolean default true,
  deleted_at              timestamptz default null,

  -- Autoria (extraído do frontmatter metadata.author)
  author_id               text,                     -- pode vir do frontmatter (ex: "casemark")
  author_org              text,
  owner_avatar            text default '⚖️',

  -- Classificação determinística (para clusterização antes dos embeddings)
  vertical                text references verticals(id),
  task_category_ids       text[] default '{}',      -- categorias de tarefa
  tags                    text[] default '{}',       -- tags diretas do frontmatter
  legal_area              text,                      -- área do direito (trabalhista, consumidor, etc.)
  professional_role       text,
  use_case                text,
  objective               text,
  workflow                text,

  -- Scores (preenchidos pelo QA da Lex)
  quality_score           int2 not null default 0 check (quality_score between 0 and 100),
  regulatory_score        int2 not null default 0 check (regulatory_score between 0 and 100),
  regulatory_issues       int2 default 0,
  compliance_checked      boolean default false,
  quality_breakdown       jsonb default '{}',
  security_criteria_hits  text[] default '{}',

  -- Engajamento (mantido por triggers)
  stars_count             int4 default 0,
  downloads_count         int4 default 0,
  review_count            int4 default 0,
  rating                  numeric(3,2) default 0.0,
  hot_score               numeric default 0,

  -- Playground (dados para simulação na UI)
  playground_system_prompt  text,
  playground_test_input     text,
  playground_expected_output text,

  -- Embedding semântico (pgvector) para busca por similaridade
  -- Dimensão 1536 = OpenAI text-embedding-3-small / NVIDIA NV-Embed-QA
  -- Pode ser 768 se usar BGE-small ou sentence-transformers
  embedding               vector(1536),

  -- Busca Full-Text (português + inglês via tsvector)
  search_vector           tsvector,

  -- Timestamps
  created_at              timestamptz default now(),
  updated_at              timestamptz default now(),
  published_at            timestamptz
);

-- ==============================================================================
-- 4. Índices de Performance
-- ==============================================================================

-- GIN para busca full-text
create index skills_search_idx on skills using gin(search_vector);

-- GIN para array de tags (overlap/contains queries)
create index skills_tags_gin on skills using gin(tags);

-- GIN para task_category_ids
create index skills_categories_gin on skills using gin(task_category_ids);

-- B-tree para filtros comuns
create index skills_vertical_idx on skills(vertical) where is_published = true;
create index skills_quality_idx on skills(quality_score desc) where is_published = true;
create index skills_hot_idx on skills(hot_score desc nulls last) where is_published = true;
create index skills_published_idx on skills(is_published, published_at desc);
create index skills_published_stars on skills(is_published, stars_count desc);
create index skills_published_at on skills(published_at desc nulls last) where is_published = true;
create index skills_author_idx on skills(author_id) where author_id is not null;
create index skills_language_idx on skills(language);

-- Índice IVFFlat para busca por embedding (criar DEPOIS de popular)
-- 100 listas é um bom padrão para ~10k registros; ajuste conforme volume real
-- create index skills_embedding_idx on skills using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ==============================================================================
-- 5. Triggers: busca full-text + updated_at
-- ==============================================================================

create or replace function update_search_vector()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('portuguese', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(array_to_string(new.tags, ' '), '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.tags, ' '), '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(new.markdown_body, '')), 'D');
  new.updated_at := now();
  return new;
end;
$$;

create trigger skills_search_vector_update
  before insert or update on skills
  for each row execute function update_search_vector();

-- Trigger para updated_at em updates parciais
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on skills
  for each row
  execute function update_updated_at_column();

-- ==============================================================================
-- 6. Tabelas Satélite
-- ==============================================================================

-- Estrelas (quem curtiu o quê)
create table skill_stars (
  skill_id   uuid references skills(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (skill_id, user_id)
);

create or replace function sync_stars_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update skills set stars_count = stars_count + 1 where id = new.skill_id;
  elsif tg_op = 'DELETE' then
    update skills set stars_count = stars_count - 1 where id = old.skill_id;
  end if;
  return null;
end;
$$;

create trigger on_star_change after insert or delete on skill_stars
  for each row execute function sync_stars_count();

-- Downloads
create table skill_downloads (
  id            uuid primary key default uuid_generate_v4(),
  skill_id      uuid references skills(id) on delete cascade,
  user_id       uuid references profiles(id),
  ip_hash       text,
  downloaded_at timestamptz default now()
);

-- Histórico de Versões
create table skill_versions (
  id            uuid primary key default uuid_generate_v4(),
  skill_id      uuid references skills(id) on delete cascade,
  version       text not null,
  markdown_body text not null,
  changelog     text,
  author_id     text,
  created_at    timestamptz default now()
);

-- ==============================================================================
-- 7. Seções Endereçáveis (edição em locus)
-- ==============================================================================

create table skill_sections (
  id              uuid primary key default uuid_generate_v4(),
  skill_id        uuid references skills(id) on delete cascade,
  level           int2 not null check (level between 1 and 3),
  section_key     text not null,
  content         text not null,
  order_index     int2 not null default 0,
  embedding       vector(1536),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique (skill_id, section_key)
);

-- ==============================================================================
-- 8. Grafo de Relações entre Skills (contexto recursivo)
-- ==============================================================================

create table skill_links (
  id              uuid primary key default uuid_generate_v4(),
  source_skill_id uuid references skills(id) on delete cascade,
  target_skill_id uuid references skills(id) on delete cascade,
  relation_type   text not null check (relation_type in ('references', 'extends', 'similar_to')),
  weight          float default 1.0,
  created_at      timestamptz default now(),
  unique (source_skill_id, target_skill_id, relation_type)
);

-- ==============================================================================
-- 9. Casos de Teste
-- ==============================================================================

create table skill_test_cases (
  id                       uuid primary key default uuid_generate_v4(),
  skill_version_id         uuid references skill_versions(id) on delete cascade,
  input_text               text not null,
  expected_output_contains text,
  expected_output_format   text,
  last_run_result          text check (last_run_result in ('pass', 'fail', 'not_run')),
  last_run_at              timestamptz,
  created_at               timestamptz default now()
);

-- ==============================================================================
-- 10. Log de Uso da Lex (custo/observabilidade)
-- ==============================================================================

create table lex_interactions_log (
  id                bigserial primary key,
  org_id            text,
  user_id           text,
  skill_id          uuid references skills(id) on delete set null,
  interaction_type  text not null check (interaction_type in ('create', 'edit_section', 'query_context')),
  tokens_in         int not null default 0,
  tokens_out        int not null default 0,
  model_provider    text,
  created_at        timestamptz default now()
);

-- ==============================================================================
-- 11. Audit Log
-- ==============================================================================

create table skill_audit (
  id        bigserial primary key,
  skill_id  uuid references skills(id) on delete set null,
  action    text not null check (action in ('create', 'update', 'delete', 'publish', 'unpublish')),
  actor_id  text,
  changes   jsonb default '{}',
  ip_address inet,
  created_at timestamptz default now()
);

create index idx_skill_audit_skill on skill_audit (skill_id);
create index idx_skill_audit_actor on skill_audit (actor_id);
create index idx_skill_audit_created on skill_audit (created_at desc);

-- ==============================================================================
-- 12. Views Materializadas (dashboard)
-- ==============================================================================

create materialized view catalog_stats as
select
  count(*) filter (where is_published)                                        as total_published,
  count(*) filter (where is_published and compliance_checked)                 as total_oab_verified,
  sum(downloads_count) filter (where is_published)                            as total_downloads,
  count(*) filter (where is_published and embedding is not null)              as total_embeddable
from skills;

create unique index on catalog_stats((true));

create materialized view vertical_stats as
select
  v.id,
  v.name,
  count(s.id) filter (where s.is_published) as skill_count
from verticals v
left join skills s on s.vertical = v.id
group by v.id, v.name;

create unique index on vertical_stats(id);

create materialized view task_category_stats as
select
  tc.id,
  tc.name,
  count(s.id) filter (where s.is_published and tc.id = any(s.task_category_ids)) as skill_count
from task_categories tc
left join skills s on s.is_published and tc.id = any(s.task_category_ids)
group by tc.id, tc.name;

create unique index on task_category_stats(id);

-- ==============================================================================
-- 13. Dados de Exemplo (Lookup Tables)
-- ==============================================================================

insert into verticals (id, name, description, accent_color, sort_order) values
('Trabalhista',  'Direito Trabalhista',       'Análise CLT, rescisões, acordos',        'red',    1),
('LGPD',         'Proteção de Dados & LGPD',  'Termos de uso, privacidade, LGPD',      'emerald',2),
('Consumidor',   'Direito do Consumidor',     'CDC, relações de consumo, SAC',         'amber',  3),
('Societario',   'Contratos & Societário',    'Contratos societários, M&A, due dill.', 'blue',   4),
('Processual',   'Prática Processual Civil',  'Prazos, petições, recursos',            'purple', 5),
('Tributario',   'Direito Tributário',        'Impostos, fiscal, planejamento',         'yellow', 6),
('Regulatorio',  'Direito Regulatório',       'ANS, ANATEL, BACEN, CADE',              'orange', 7)
on conflict (id) do nothing;

insert into task_categories (id, name, sort_order) values
('auditoria',    'Auditoria de Contratos',  1),
('peticao',      'Redação de Peças',        2),
('compliance',   'Checklists de Compliance',3),
('notificacao',  'Respostas a Notificações',4),
('pesquisa',     'Pareceres & Pesquisa',    5),
('dev',          'Desenvolvimento Técnico', 6)
on conflict (id) do nothing;

-- ==============================================================================
-- 15. Refresh das Views (roda depois de popular)
-- ==============================================================================

refresh materialized view catalog_stats;
refresh materialized view vertical_stats;
refresh materialized view task_category_stats;

-- ==============================================================================
-- FIM
-- ==============================================================================