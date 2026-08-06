# Plano de Implementação — Módulo de Conta/Sessão + Remoção do `apps/web`

> Status: **planejado** — pronto para execução em fases.
> Projeto atual: **`apps/next-web`** (Next.js App Router). O `apps/web` (Vite/Express) é sobra da migração e será excluído.

---

## Contexto & Objetivo

- O `apps/next-web` é o projeto **atual** (migrou de framework, mas a pasta antiga `apps/web` ficou para trás e gera confusão).
- Objetivos deste módulo:
  1. Fazer o **login "parecer logado"** de verdade (sessão persistente e visível).
  2. Adicionar **interações por usuário**: se o usuário **curtir** uma skill, ela fica sempre curtida para ele; se **baixar**, fica registrado.
  3. Criar uma **área de conta** (`/account`) com perfil, curtidas, downloads, skills e **conexões**.
  4. **Excluir o `apps/web`** sem quebrar a compilação do `apps/next-web`.

---

## Diagnóstico (achados)

| Item | Situação | Impacto |
|------|----------|---------|
| Sessão | `AuthContext` usa `getSession()` + `onAuthStateChange` (Supabase localStorage) | Já persiste, mas sem `.env` o auth falha (chave placeholder) |
| Dados de skills | `lib/api.ts` e `supabaseAdapter` caem em **fallback mock**; não há `src/app/api/` | App mostra dados fake, não os reais do Supabase |
| Curtir/Baixar | UI não tem botão de estrela nem registro de download | Tabelas `skill_stars`/`skill_downloads` existem mas estão vazias/sem RLS |
| RLS | `skill_stars`, `skill_downloads` **sem políticas RLS** | Interações não funcionariam de forma segura/persistente |
| RBAC/Conta | `requireRole` é placeholder; `DELETE /api/account/delete` confia em `userId` do body | Vulnerável — não replicar no Next |
| Duas apps | Sem `package.json` na raiz (não é workspace) | Excluir `apps/web` **não afeta** o build do Next |

---

## Fase 1 — Remover `apps/web` sem quebrar o build

- [ ] **T1.1** — Commit das mudanças atuais (há edições não commitadas em `apps/web` e `apps/next-web`) antes de excluir, para não perder trabalho.
- [ ] **T1.2** — Excluir o diretório `apps/web` (projeto independente).
- [ ] **T1.3** — Atualizar `netlify.toml`:
  - `base = "apps/next-web"`
  - `command = "npm run build"`
  - Remover redirect SPA `/* → /index.html` (incompatível com Next) e deixar o Netlify detectar o Next.js via `@netlify/plugin-nextjs`.
- [ ] **T1.4** — Criar `apps/next-web/.env` com:
  ```
  NEXT_PUBLIC_SUPABASE_URL=<URL>
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>
  ```
  (hoje o `supabase.ts` usa chave `placeholder` → auth falha). Configurar também no painel do Netlify/Vercel.
- [ ] **T1.5** — Corrigir aviso cosmético `apps/web/.env` em `apps/next-web/src/lib/supabaseAdapter.ts`.
- [ ] **T1.6** — Limpar menções a `apps/web` em docs opcionais (`README.md`, etc.).
- [ ] **T1.7** — **Validar**: `npm run build` em `apps/next-web` + deploy de teste.

---

## Fase 2 — Fundação de dados reais (pré-requisito do módulo)

A área de conta e as interações dependem de **IDs reais** de skill.

- [ ] **T2.1** — Implementar Route Handlers no Next (`apps/next-web/src/app/api/`):
  - `api/skills/route.ts`
  - `api/skills/[slug]/route.ts`
  - `api/catalog/stats/route.ts`
  - Consultar o Supabase com **service role no servidor**; manter fallback mock apenas em erro real.
- [ ] **T2.2** — RLS no Supabase (SQL a rodar no SQL Editor):
  - `skill_stars`: `ENABLE ROW LEVEL SECURITY` + políticas de insert/delete/select apenas do próprio `user_id = auth.uid()`.
  - `skill_downloads`: `ENABLE ROW LEVEL SECURITY` + política de insert do próprio usuário.
  - `profiles`: leitura/update do próprio usuário (já parcial no `supabase_auth_setup.sql`).
  - `skills`: leitura de publicadas (já definida).
- [ ] **T2.3** — **Validar**: listar skills reais no `/skills` e abrir `/skills/[slug]` com conteúdo do Supabase.

---

## Fase 3 — Módulo de Conta/Sessão

### 3.1 AuthContext (login visível e persistente)
- [ ] **T3.1** — Carregar o **perfil completo** (`profiles`: username, display_name, avatar_url, oab_verified, role) junto com `user`.
- [ ] **T3.2** — Expor `profile` e `refreshProfile()` no contexto; tratar eventos `SIGNED_OUT`/`TOKEN_REFRESHED`.
- [ ] **T3.3** — `isLoading` **SSR-safe** na Navbar (evitar flash de "Entrar" para usuário já logado).

### 3.2 Interações por usuário (curtir/baixar persistidos)
- [ ] **T3.4** — Criar `lib/interactions.ts`:
  - `fetchMyStars()`, `starSkill(skillId)`, `unstarSkill(skillId)`
  - `fetchMyDownloads()`, `recordDownload(skillId)`
  - (via anon client + RLS já configuradas na Fase 2)
- [ ] **T3.5** — Criar contexto/hook de biblioteca do usuário (`UserLibraryContext` ou `useSkillUserState`) que carrega os IDs de skills **curtidas/baixadas** e faz **update otimista**.
- [ ] **T3.6** — `SkillDetailPage`: botão de **estrela** (alterna `skill_stars`, mantém estado "curtida" persistente, atualiza `stars_count`) e botão **Baixar** (registra em `skill_downloads` e dispara o download do SKILL.md).
- [ ] **T3.7** — Mostrar estado de curtida também na `SkillCard`/Marketplace quando acionado.

### 3.3 Área de Conta (`/account`)
- [ ] **T3.8** — Criar rota `/account` (page + componentes client) com seções:
  - **Perfil** — nome, username, email, avatar, selo OAB.
  - **Curtidas** — lista das skills curtidas pelo usuário.
  - **Downloads** — lista das skills baixadas.
  - **Minhas Skills** — skills publicadas pelo usuário (aproveitando o `CreateSkillModal`).
  - **Conexões** — Google (já usado), **GitHub OAuth**, e **API/MCP** (placeholder de chave).
  - **Segurança** — alterar senha (`supabase.auth.updateUser`), sair, excluir conta.
- [ ] **T3.9** — Rota **protegida** (redireciona para login/`/` se deslogado).
- [ ] **T3.10** — Adicionar link **"Minha Conta"** no dropdown do usuário na `Navbar`.

### 3.4 Segurança
- [ ] **T3.11** — `api/account/delete`: validar a sessão via `supabase.auth.getUser()` (Bearer/cookie) — **nunca** confiar em `userId` do body (corrige vulnerabilidade da app antiga).
- [ ] **T3.12** — Garantir **service role apenas no servidor**; anon key apenas no client.
- [ ] **T3.13** — (Follow-up, fora deste escopo) Sanitizar `dangerouslySetInnerHTML` do markdown e revisar RBAC.

---

## Ordem de Execução & Validação Final

```
Fase 1 → Fase 2 → Fase 3
```

1. **Fase 1**: commit → excluir `apps/web` → `netlify.toml` → `.env` → `npm run build`.
2. **Fase 2**: Route Handlers + RLS → `npm run build` e ver skills reais.
3. **Fase 3**: AuthContext → interações (curtir/baixar) → `/account` + Navbar → testes.

**Checklist de aceite (teste manual):**
- [ ] Login persiste após atualizar a página (sem flash de "Entrar").
- [ ] Curtir uma skill → recarregar → continua curtida (estado do botão + contagem).
- [ ] Baixar uma skill → aparece em "Downloads" da conta.
- [ ] `/account` lista perfil, curtidas, downloads e conexões.
- [ ] Sair e logar de novo mantém os dados do usuário.
- [ ] `npm run build` em `apps/next-web` passa sem depender do `apps/web`.

