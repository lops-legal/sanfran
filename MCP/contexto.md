# Anotações sobre o repositório `skill-local-semantico`

## Visão geral
- Este é um fork do **Skilljack MCP**, um servidor MCP que expõe skills via o protocolo `skill://` (SEP‑2640).
- Estrutura típica:
  - `src/` – código‑fonte TypeScript (discover, tools, prompts, resources, watchers).
  - `skill-mcp-mvp/` – exemplos de skills públicas (contratos, LGPD, etc.).
  - `skill-local-semantico/` – contém o SDK MCP, documentação (`README.md`, `CLAUDE.md`) e fixtures de testes.
  - `contexto.md` – destinado a descrever a proposta de extensão que será desenvolvida.

## Documentação encontrada
- **README.md** e **CLAUDE.md** descrevem:
  - comandos npm (`npm run dev`, `npm run build`, `npm test`).
  - variáveis de ambiente (`SKILLS_DIR`, `SKILLJACK_STATIC`, `WELL_KNOWN_ALLOWED_ORIGINS`, etc.).
  - modos de catálogo (`instructions` – padrão, `tool‑description` – legado).
  - arquitetura de descoberta de skills (local, GitHub, well‑known). 
  - recursos `skill://` (index.json, SKILL.md, arquivos auxiliares).
- **Fixtures** em `src/__fixtures__/skills/` mostram exemplos de SKILL.md válidos e inválidos usados nos testes.
- **skill‑mcp‑mvp/skills/public/** contém skills reais do domínio jurídico (ex.: `contratos-clausula-multa`).

## Proposta presente em `contexto.md`
(O conteúdo original estava corrompido, mas o sentido foi recuperado)
- Utilizar o protocolo `skill://` (SEP‑2640) e criar um **resource JSON** que faça mapeamento inteligente das skills.
- Gerar **embeddings** gratuitos via **NVIDIA NEMO API** a partir das palavras‑chave extraídas da query do agente.
- Armazenar esses embeddings em um vetor‑store (Supabase + pgvector) para busca semântica.
- Expor um **endpoint HTTP** que liste as skills com descrição curta, permitindo que o agente escolha a skill adequada.
- O agente então chama a skill através da tool `load‑skill`/`skill‑resource` e recebe o resultado em **JSON**.
- Funcionalidades desejadas:
  1. Reunião/pesquisa de skills.
  2. Leitura de skills.
  3. Postagem (registro) de novas skills vindas do cliente para o servidor.

## Ideia de arquitetura (resumida)
1. **MCP Server** (Node, `skilljack‑mcp`) roda em HTTP (ex.: porta 3000).
2. **Endpoint `/skills`** devolve um JSON com id, nome, descrição curta e URI de cada skill.
3. **Endpoint `/search`** recebe a query textual,
   - chama a NVIDIA NEMO para gerar embedding;
   - consulta Supabase (`pgvector`) e retorna a skill mais próxima.
4. Cliente (LLM) usa a URI retornada (`skill://<skill‑path>/SKILL.md`) para carregar a skill e obter seu output JSON.

## Análise das ferramentas e necessidade de cada uma
| Ferramenta / camada | Função no fluxo original | Por que pode ser dispensada no teste local |
|---------------------|--------------------------|--------------------------------------------|
| **NVIDIA NEMO / API de embedding** | Recebe o texto (nome + descrição + tags da skill) e devolve um vetor de 2048 floats. Esse vetor serve para **busca semântica** (similaridade de cosseno). | É a única forma de obter *ranking semântico*. Se quiser testar **somente keyword‑search**, basta desligá‑la (`EMBEDDINGS_ENABLED=false`). O código já suporta esse degrade‑graceful. |
| **pgvector + Supabase** | Armazena os vetores numa tabela PostgreSQL (`skill_vec`) e oferece o operador `<=>` (cosseno) para buscar a skill mais próxima. | Serviço externo (cloud). Quando rodamos tudo localmente podemos substituir por **SQLite + extensão `sqlite‑vec`**, que oferece exatamente o mesmo operador `<=>` dentro de um banco de arquivo. |
| **SQLite (better‑sqlite3)** | Banco de dados leve que já contém a tabela de *skills* (`skill`), metadados e, com a extensão, a tabela vetorial (`skill_vec`). | Mantido – é a base de dados que usaremos no teste. |
| **Scripts de ingestão (`embed‑all.ts`, `ingest‑all.ts` etc.)** | Percorrem o diretório de skills, geram embeddings (via NVIDIA) e populam a tabela `skill_vec`. | Mantidos, mas apontando para o **banco SQLite** e não para Supabase. |
| **Endpoints HTTP (`/skills`, `/search`)** | Exponem o catálogo e a busca semântica ao agente (Claude ou outro). | Mantidos – são a interface que o LLM usará. |
| **Variáveis de ambiente (`EMBEDDINGS_ENABLED`, `SEARCH_MODE`, `DB_PATH`…)** | Controlam se a camada de embeddings será usada e onde o DB está. | Mantidas – agora apontam para arquivos locais. |

### Resumo
- **Para rodar tudo localmente basta manter** **NVIDIA + SQLite‑vec** e desligar a integração com Supabase. Quando `EMBEDDINGS_ENABLED` estiver **false**, o servidor cai para busca apenas por palavra‑chave (FTS5) e funciona perfeitamente sem nenhum vetor. |

## Simplificação do MVP para execução local (SQLite + NVIDIA)
### Arquitetura mínima
```
┌─────────────────────┐          HTTP (POST /search)
│  Cliente (LLM)      │  <------  ────────►  MCP Server (Node)
│  - pede catálogo   │              │  - lê ./skills/*  (SQLITE)
│  - envia query    │              │  - (opcional) chama NVIDIA → vetor
└─────────────────────┘              │    → sqlite‑vec.search()
                                    │  - devolve JSON da skill
                                    └───────────────────────
```
* **Banco:** `data/skills.db` (criado em `config.dbPath`).
* **Extensão:** `sqlite-vec` (já importada em `src/db.ts`).
* **Tabela de skills** (`skill`): id, name, description, path, tags (FTS5).
* **Tabela vetorial** (`skill_vec`): vetor FLOAT[2048] + rowid (id da skill).

### Passos de implementação (local)
1. **Desativar Supabase** – remover/ignorar imports de `@supabase/supabase-js`. Não há nenhum no MVP‑MCP, basta garantir que `config` não tente ler `SUPABASE_*`.
2. **Garantir que o DB SQLite seja criado** – `src/db.ts` já faz `fs.mkdirSync` e carrega `sqlite-vec`. Não precisa mudar nada.
3. **Configurar a criação da tabela `skill_vec`** – já está na função `ensureVecTable` (linhas 44‑57). Ela usa `config.embeddingDimensions`.
4. **Ingestão de embeddings** – use o script já pronto `scripts/embed-all.ts` (ou `scripts/ingest-all.ts`). Ele lê todos os `SKILL.md` em `config.skillsRoot` (por padrão `./skills`).
5. **Buscar por keyword** – a busca FTS5 já está implementada em `src/search.ts`. Quando `searchMode` = `keyword` ou `auto` + sem embeddings, o servidor usa só FTS5.
6. **Buscar semântica (se habilitado)** – o fluxo em `src/search.ts` verifica `config.embeddingsEnabled`. Quando true, chama `src/embeddings.ts` (que usa a API da NVIDIA) e depois faz `SELECT * FROM skill_vec ORDER BY embedding <=> ? LIMIT 1`.
7. **Endpoints HTTP** – `src/server.ts` já registra `/skills` (catálogo) e `/search`. Verificar que `src/server.ts` usa `config.port` (padrão 8787) e que a porta está livre.
8. **Testar com 800 skills** – copie/gerencie as 800 SKILL.md dentro `skill-mcp-mvp/skills/` (já existe a pasta `public`). Defina `SKILLS_ROOT=./skill-mcp-mvp/skills` no `.env`.
9. **Verificar exposição** – a partir de um cliente (curl ou Claude) peça o catálogo e confira que a skill “revisão de contrato” aparece com sua URI (`skill://public/revisao-contrato/SKILL.md`).

### Exemplo de `.env` minimalista (local)
```dotenv
# Banco SQLite (arquivo local)
DB_PATH=./data/skills.db

# Diretório onde estão as 800 SKILL.md
SKILLS_ROOT=./skill-mcp-mvp/skills

# Desligar Supabase (não usado)
# SUPABASE_URL=
# SUPABASE_ANON_KEY=

# Embeddings opcionais (primeiro teste sem)
EMBEDDINGS_ENABLED=false          # depois mudar para true para validar vetor
NVIDIA_API_KEY=***    # só se embeddings=true
EMBEDDING_MODEL=nvidia/llama-nemotron-embed-vl-1b-v2
EMBEDDING_DIMENSIONS=2048
EMBEDDING_BATCH_SIZE=32
EMBEDDING_BATCH_DELAY_MS=500

# Modo de busca: auto (usa embeddings se houver) ou keyword (só FTS5)
SEARCH_MODE=auto

# Porta do MCP
PORT=8787
```
> **Dica:** mantenha `EMBEDDINGS_ENABLED=false` enquanto verifica que a skill de revisão de contrato aparece no catálogo e pode ser carregada via `skill://…/SKILL.md`. Quando tudo estiver ok, mude para `true` e rode `npm run embed:all` para popular a tabela vetorial.

## Fluxo de teste completo (passo‑a‑passo)
1. **Preparar ambiente**
   ```bash
   cd "C:\Users\Lucas Cardoso\Desktop\sanfran\MCP\skill-mcp-mvp"
   # criar .env (exemplo acima)
   copy NUL .env   # (ou edite no editor)
   ```
2. **Instalar dependências** (feito uma vez) 
   ```bash
   npm install          # inclui better-sqlite3, sqlite-vec, etc.
   ```
3. **Criar/limpar o banco SQLite** 
   ```bash
   rm -f data/skills.db   # opcional, para começar do zero
   npm run dev            # o server abrirá o DB e criará schema.sql
   ```
4. **Verificar catálogo (sem embeddings)** 
   ```bash
   curl http://localhost:8787/skills | head
   ```
   *Deve aparecer a skill “revisão‑contrato” (ou similar) com a URI `skill://.../SKILL.md`.*
5. **Carregar a skill via URI (ex.: usando a tool `load‑skill`)** – no Claude ou outro cliente, faça:
   ```
   /load-skill skill://public/revisao-contrato/SKILL.md
   ```
   O agente deve receber o conteúdo do SKILL.md (descrição da revisão de contrato). Esse é o **benchmark** – se o MCP devolve o SKILL.md corretamente, a integração está funcionando.
6. **(Opcional) Habilitar embeddings** 
   ```bash
   # editar .env → EMBEDDINGS_ENABLED=true
   npm run embed:all   # gera vetores e preenche skill_vec
   ```
7. **Testar busca semântica** 
   ```bash
   curl -X POST -H "Content-Type: application/json" \
        -d '{"query":"preciso analisar cláusula de multa"}' \
        http://localhost:8787/search
   ```
   O JSON retornado deve conter `skill_id`, `name`, `uri` etc. Se a skill de cláusula de multa for a mais próxima, o teste está aprovado.
8. **Repetir para a skill de revisão de contrato** – mesma chamada com query relacionada à revisão de contrato.
9. **Encerrar** 
   ```bash
   npm stop   # ou pressione Ctrl+C no terminal onde o server roda
   ```

## Checklist de o que pode ser removido para a versão local
| Item | Remover / comentar? | Motivo |
|------|---------------------|--------|
| `supabase/*` scripts e referências | **Sim** (não usados). | Não há DB externo. |
| `scripts/ingest‑all.ts` que chama Supabase | **Não** – use a versão que grava no SQLite (`src/ingest.ts`). |
| Variáveis `SUPABASE_URL`, `SUPABASE_ANON_KEY` no `.env` | **Sim** – deixam o arquivo limpo. |
| Documentação referente a “catalog mode tool‑description” | **Opcional** – pode ser mantida como comentário. |
| Qualquer código que força `SKILLJACK_CATALOG=tool-description` | **Sim**, deixe o padrão `instructions`. |
| `src/tools.ts` que exporta *tool‑search* (não usado para este teste) | **Não** – a tool ainda pode ser útil para auto‑ativação; mantenha. |

## Resumo da proposta final (para o benchmark)
1. **MCP roda localmente** (Node + Express) usando **SQLite + sqlite‑vec**.
2. **Catálogo** (`/skills`) devolve um JSON com todas as ~800 skills (incluindo a de revisão de contrato).
3. **Busca** (`/search`) pode operar em dois modos:
   - **keyword** – FTS5 puro (sempre funciona).
   - **semantic** – vetor + cosseno (ativado só se `EMBEDDINGS_ENABLED=true`).
4. **Carregamento da skill** – o cliente LLM usa `skill://<path>/SKILL.md` (ou a tool `load‑skill`) e recebe o conteúdo.
5. **Benchmark** – ao solicitar a skill de revisão de contrato, o MCP deve devolver exatamente o arquivo `SKILL.md` correspondente.

Com esses ajustes você tem um **protótipo totalmente local**, sem dependências de Supabase ou outras infraestruturas de produção, pronto para validar a capacidade do MCP de expor e servir as suas 800 skills. Quando quiser avançar para produção, basta re‑ativar as variáveis de Supabase e migrar os vetores para o banco PostgreSQL.
