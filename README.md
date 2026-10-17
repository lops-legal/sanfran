# sanfran.md

[![CI](https://github.com/lops-legal/sanfran/actions/workflows/ci.yml/badge.svg)](https://github.com/lops-legal/sanfran/actions/workflows/ci.yml)

Skills jurídicas para o Direito brasileiro — prazos, cálculos, peças, contratos, LGPD, licitações — para usar **dentro do assistente que o profissional já usa**: Claude, ChatGPT, Grok ou Manus.

Cada skill segue o padrão aberto [SKILL.md](https://agentskills.io/specification), cita a fonte legal com data de conferência e mostra se já passou por revisão de um advogado.

## Como o usuário usa

1. **Conector** — no Claude, ChatGPT ou Manus, adicione o endereço `https://<site>/api/mcp` como conector. O assistente passa a buscar e seguir as skills sozinho. Guia em `/integrate`.
2. **Copiar e colar** — em qualquer assistente (inclusive Grok), copie a skill na página dela e cole no início da conversa.
3. **Equipe de TI** — o mesmo endpoint fala MCP (Streamable HTTP) e JSON-RPC 2.0; cada skill também existe em markdown puro em `/skills/<slug>.md`.

## Estrutura

```
apps/next-web/
├── content/skills/<slug>/      # FONTE DAS SKILLS: SKILL.md + sanfran.yaml (+ references/, scripts/, tests/, evals/)
├── scripts/build-skills-index.mjs  # valida as skills e gera src/lib/generated/skills-index.ts (roda no dev e no build)
├── src/app/api/mcp/            # servidor MCP
├── src/lib/mcp/                # ferramentas e protocolo
├── src/lib/motores/            # cálculos e validações determinísticos (ex.: número CNJ)
└── tests/                      # testes dos motores (node --test)
```

O Supabase guarda contas, favoritos e skills enviadas pelo site. Skills importadas em inglês (`language: en`) não aparecem no catálogo.

## Rodar localmente

```bash
cd apps/next-web
npm ci
cp .env.example .env.local
npm run dev      # http://localhost:3000
npm test         # testes dos motores
npm run lint
```

## Adicionar uma skill

1. Crie `apps/next-web/content/skills/<slug>/SKILL.md` com `name: <slug>` (minúsculas e hífen), `description`, `license` e `metadata` (só texto).
2. Crie `sanfran.yaml` ao lado (título, tipo, área, personas, base normativa, status de revisão) — veja `content/skills/cnj-numero/` como modelo completo.
3. Se a skill calcula ou valida algo, coloque o código em `scripts/` com testes em `tests/`.
4. `npm run skills:index` valida tudo; o CI roda o mesmo.

Status de revisão: `rascunho` → `em-revisao` → `revisada` (só com nome e OAB do revisor).

## Segurança

- `SUPABASE_SERVICE_ROLE_KEY` só no servidor (nunca com prefixo `NEXT_PUBLIC_`).
- Escritas passam por Route Handlers em `src/app/api`; leituras no navegador dependem de RLS.
- O servidor MCP não registra o conteúdo das conversas.

## Licença

Código: MIT. Cada skill declara a própria licença no `SKILL.md`.
