# banco/ — Repositório de Dados Local

> Espelho local das skills de https://github.com/CaseMark/skills/tree/main/skills/legal

## Estrutura

```
banco/
├── fetch_skills.py         # 1. Baixa skills do GitHub
├── ingest_skills.py        # 2. Popula o banco SQLite
├── create_tables.py        # Cria/atualiza esquema de tabelas
├── index.json              # Gerado por fetch_skills.py — índice completo
└── skills/
    └── legal/
        ├── demand-letter/
        │   ├── SKILL.md    # Conteúdo original
        │   └── meta.json   # Metadados extraídos
        ├── litigation/
        │   ├── SKILL.md
        │   └── meta.json
        └── ...
```

## Setup rápido

```bash
# 1. Baixar skills do GitHub (~800+ skills)
python banco/fetch_skills.py

# 2. Criar tabelas e popular banco
python banco/create_tables.py
python banco/ingest_skills.py

# 3. Verificar
python banco/check_db.py
```

## Esquema de dados

Alinhado com spec `docs/03_design_dados.md`:

| Tabela | Descrição |
|---|---|
| `skills` | Entidade central — slugs, conteúdo, metadados |
| `authors` | Contribuidores das skills |
| `tags` | Tags/áreas de classificação |
| `skill_tags` | Junção Skill ↔ Tag |
| `skill_metrics_total` | Contadores de views/downloads/uses |
| `skill_metrics_daily` | Série temporal de métricas |
| `api_keys` | Chaves de acesso programático |
| `mcp_requests` | Log de requisições ao MCP endpoint |
| `lex_sessions` | Sessões do agente Lex (existente) |
| `lex_interactions` | Histórico de interações Lex (existente) |

## Camadas pendentes (roadmap)

| Camada | Spec | Status |
|---|---|---|
| Redis cache (Upstash) | §2.3 | 🔜 A implementar |
| Typesense search | §2.4 | 🔜 A implementar |
| GitHub webhook sync | §4.1 | 🔜 A implementar |
| MCP rate limiting | §1.4 | 🔜 Requer Redis |
| Métricas buffer (1min flush) | §4.2 | 🔜 Requer Redis |
| Worker periódico (Trigger.dev) | §4.2 | 🔜 A implementar |

## Fonte da verdade

O repositório `github.com/CaseMark/skills` é a **fonte da verdade** para o conteúdo das skills.
Este diretório é um espelho local para desenvolvimento.

Em produção, o fluxo será:
```
GitHub PR merged → GitHub Actions → POST /api/sync → UPSERT banco → Invalidar cache Redis
```
