Analisei o documento e organizei os 41 itens em tasks executáveis, priorizadas por impacto real (não pela ordem em que apareceram). Segue a avaliação e depois o backlog pronto para colar num IDE/agente (Cursor, Claude Code, Copilot).

## Avaliação geral

O relatório está bem levantado, mas duas coisas merecem destaque antes de tudo:

- **#5, #7, #8, #9, #11** são o núcleo real do problema: o simulador não funciona, mascarado por um fallback enganoso, e há exposição de segurança (chave anônima no bundle + RBAC inexistente). Isso é o que eu atacaria primeiro — o resto é polimento.
- Alguns itens do próprio relatório **se autocorrigem no meio do texto** (#19 e #30 concluem "na verdade está certo" / "esse item está incorreto"). Vou excluí-los do backlog para não desperdiçar tempo da IDE investigando um não-bug.

---

## Fase 0 — Segurança e correção crítica (fazer primeiro, nessa ordem)

**Task 1 — Corrigir o simulador SSE**
Arquivo: `src/components/skilldetailpage/index.tsx:89-103`
Prompt para IDE:
> "O endpoint `/api/lex-chat` retorna `text/event-stream`, mas `handleSimulate` chama `response.json()`. Reescreva a função para ler a resposta com `response.body.getReader()` + `TextDecoder`, parseando eventos SSE (`data: ...`) linha a linha, atualizando o estado incrementalmente conforme os chunks chegam (streaming real na UI, não só no final)."

**Task 2 — Remover o fallback hardcoded enganoso**
Arquivo: mesmo arquivo, linha 107
Prompt: "Remova o bloco que injeta '### ⚖️ DIAGNÓSTICO JURÍDICO SIMULADO (Sem Conexão API)' no catch. Substitua por um estado de erro explícito visível ao usuário (ex: banner 'Simulação falhou, tente novamente') — nunca por conteúdo que finge ser resultado real."

**Task 3 — Sair do modelo Supabase direto-do-browser**
Arquivos: `src/lib/supabaseAdapter.ts`, `src/components/skilldetailpage/index.tsx:6`
Prompt: "Antes de qualquer coisa, confirme se RLS está habilitado em todas as tabelas do Supabase acessadas pelo anon key. Se não estiver, isso é bloqueante. Depois, avalie mover leituras sensíveis para um endpoint backend (server.ts) que use a service role key, deixando o client apenas com leituras públicas permitidas por RLS."

**Task 4 — Implementar autenticação real no RBAC (ou desativar o endpoint)**
Arquivo: `src/middleware/rbac.ts`, `server.ts:27`
Prompt: "`requireRole` depende de `req.user.role`, mas não há middleware que popule `req.user`. Implemente verificação de JWT/sessão (Supabase Auth ou equivalente) antes do RBAC. Até isso existir, adicione um guard temporário que retorna 501/403 em `DELETE /api/account/delete` para não deixar o endpoint aberto a qualquer `userId` do body."

**Task 5 — Sanitizar o `dangerouslySetInnerHTML`**
Arquivo: `src/components/LexBot.tsx:435`
Prompt: "Substitua o parser caseiro `renderMarkdownPreview` por uma lib madura (ex: `marked` + `DOMPurify`, ou `react-markdown` com `rehype-sanitize`). Não confie em escaping manual para conteúdo que pode ter vindo de um modelo de IA."

---

## Fase 1 — Erros de tipo (`tsc`) — mecânico, pode ser feito em lote

**Task 6** — `src/vite-env.d.ts` ausente
Prompt: "Crie `src/vite-env.d.ts` com `/// <reference types=\"vite/client\" />`. Isso resolve os erros de `import.meta.env` em `supabaseAdapter.ts:6-7`."

**Task 7** — `ErrorBoundary` sem tipos genéricos
Arquivo: `src/components/ErrorBoundary.tsx`
Prompt: "Declare a classe como `class ErrorBoundary extends React.Component<Props, State>` com interfaces `Props`/`State` explícitas. Revise `tsconfig.json`: confirme se `useDefineForClassFields` e `experimentalDecorators` estão configurados de forma coerente (não usar `experimentalDecorators: true` sem necessidade real, pois conflita com class fields do TS moderno)."

**Task 8** — `CreateSkillModal` campo inexistente
Arquivo: `src/components/CreateSkillModal.tsx:52`
Prompt: "O tipo `LegalSkill` usa `markdownContent`, mas o código envia `markdown_body` (nome de coluna do banco). Crie um mapeamento explícito de DTO→domínio (`toDbPayload(skill)`) em vez de reusar `Partial<LegalSkill>` diretamente na chamada ao Supabase."

**Task 9** — `seedUserSkillsFromTemplates.ts:42`
Prompt: "Corrija a atribuição de `string[]` para `string` — provavelmente falta um `.join()` ou o campo deveria ser array. Ver o schema da tabela para decidir qual lado está errado."

---

## Fase 2 — Arquitetura e limpeza

**Task 10** — Remover pasta duplicada `src/components/skill-detail/` (mantendo `skilldetailpage/`, que é a ativa).

**Task 11** — Remover `motion` do `package.json`, manter só `framer-motion` (é redundante, dobra bundle).

**Task 12** — Adicionar `.env.example` documentando `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `LEX_BACKEND_URL`, `ENCRYPTION_KEY`.

**Task 13** — Trocar `node-fetch` dinâmico por `fetch` nativo em `server.ts:43-44` (Node 18+ já tem fetch global).

**Task 14** — Corrigir `execSync('bash ../scripts/retention_job.sh')` em `server.ts:75`: usar caminho absoluto via `path.resolve(__dirname, ...)` e verificar cross-platform (ou documentar que é Linux-only em produção).

**Task 15** — Code splitting do chunk de 729 KB: introduzir `React.lazy()` + `Suspense` nas rotas principais (`SkillDetailRoute`, `Marketplace`, `LexBot`) para quebrar o bundle único.

---

## Fase 3 — Layout / UI (agrupei por componente para eficiência de edição)

**HomePage (`src/pages/Home.tsx`)**
- Task 16: Traduzir todo o hero, badges, "How it Works" e "Featured Skills" para português (linhas 29-87).
- Task 17: Reduzir `py-20 md:py-32` para algo como `py-10 md:py-20` no mobile, ou usar `clamp()`.
- Task 18: Aumentar opacidade do gradient (`from-primary/5` → `from-primary/15` ou remover se não agregar).

**Navbar (`src/components/Navbar.tsx`)**
- Task 19: Padronizar tooltips — só português: "Claro", "Escuro", "Creme".
- Task 20: Persistir `showSlack` em `localStorage` (ou remover o banner, já que `/slack` não existe como rota).

**Marketplace (`src/components/Marketplace.tsx`)**
- Task 21: Trocar `gap-px bg-card-hover` por `gap-3`/`gap-4` real com bordas de card, evitando dependência de tema para contraste (linha 489).
- Task 22: Corrigir `currentUserId=""` hardcoded (linha 596) — puxar do contexto de auth real; sem isso toda skill nova nasce com `author_id` vazio.

**SkillDetailPage (`src/components/skilldetailpage/index.tsx`)**
- Task 23: Reordenar grid mobile para que o SKILL.md apareça antes do simulador (via `order-*` do Tailwind ou reestruturação do grid).
- Task 24: Remover placeholder "Extensões Futuras" (linhas 423-426) até haver conteúdo real.
- Task 25: Trocar `skill.starsCount * 1.5` por métrica real de downloads, ou remover o campo até existir.
- Task 26: Adicionar timeout no fetch de `SkillDetailRoute.tsx` (linhas 50-72) e não expor `err.message` bruto na UI.

**LexBot (`src/components/LexBot.tsx`)**
- Task 27: Sidebar com `w-0` — usar `hidden` + `aria-hidden`/`inert` no container quando fechada, não só colapsar largura, para tirar do fluxo de foco.
- Task 28: Revisar `pb-32` fixo vs área de input `absolute bottom-0` — considerar `flex flex-col` com input em `sticky bottom-0` dentro de um container com altura calculada, em vez de padding mágico.
- Task 29: Ajustar `p-6` do overlay fullscreen para `p-0` ou `p-4` em breakpoints mobile.

**Toast / CSS**
- Task 30: Adicionar `@keyframes slide-in-right` em `index.css` (a classe é usada mas não existe).
- Task 31: Adicionar `scrollbar-width: thin; scrollbar-color: ...` como fallback Firefox ao lado do `::-webkit-scrollbar`.
- Task 32: Verificar se `@tailwindcss/vite` está corretamente configurado — testar build com CSS desabilitado propositalmente para confirmar que não há fallback silencioso quebrando tudo.

**SkillCard (`src/components/SkillCard.tsx`)**
- Task 33: Trocar ícone `GitFork` por `Download` (lucide-react) — semântica errada.
- Task 34: Confirmar `line-clamp-2` funcionando nativamente no Tailwind v4 (é nativo desde v3.3+, mas testar visualmente).

---

## Fase 4 — SEO/Acessibilidade (baixo esforço, pode ir junto com Fase 2)

- Task 35: `index.html` — trocar `lang="en"` por `lang="pt-BR"`, e substituir URLs placeholder (`yourdomain.com`) por domínio real em OG tags, Twitter cards e JSON-LD.
- Task 36: `App.tsx` — ao navegar com `skill.slug || skill.id`, considerar gerar slug no backend sempre que ausente, para manter URLs consistentes (`/skills/nome-da-skill` em vez de `/skills/123`).

---

# Frontend Issues — Sanfran.md


> Levantamento baseado na análise completa do código em `apps/web/` (React + Vite + TypeScript + Tailwind CSS v4).
> Build passa (`vite build`), mas há bugs funcionais, erros de tipo no `tsc` e más práticas.

---

## 🚨 Erros de Tipo (TypeScript — `tsc --noEmit`)

### 1. `ErrorBoundary` — `this.state` / `this.setState` / `this.props` não existem
**Arquivo:** `src/components/ErrorBoundary.tsx:27,40,44,45,46,59,61,75`

**Causa:** Componente de classe que herda de `React.Component`, mas o TypeScript não reconhece `state` e `props` porque os tipos genéricos estão ausentes ou o `tsconfig` tem `useDefineForClassFields: false` + `experimentalDecorators: true`, o que conflita com class fields.

**Impacto:** Erro de compilação. O build do Vite ignora (`skipLibCheck` + `noEmit`), mas o `tsc` falha — qualquer ferramenta que dependa de tipo (IDE, lint) mostrará erros.

**Solução:** Usar `React.Component<Props, State>` declarado corretamente ou migrar para função.

---

### 2. `CreateSkillModal` — `markdown_body` não existe em `LegalSkill`
**Arquivo:** `src/components/CreateSkillModal.tsx:52`

**Causa:** O tipo `Partial<LegalSkill>` não inclui `markdown_body` — o tipo da interface `LegalSkill` usa `markdownContent`. O `upsertSkill` espera campos do banco, não da interface frontend.

**Impacto:** Erro de tipo no `tsc`.

---

### 3. `supabaseAdapter.ts` — `import.meta.env` não reconhecido
**Arquivo:** `src/lib/supabaseAdapter.ts:6-7`

**Causa:** Falta o arquivo `vite-env.d.ts` com a referência `/// <reference types="vite/client" />`.

**Impacto:** `tsc` acusa `Property 'env' does not exist on type 'ImportMeta'`. Quebra verificação de tipo.

**Solução:** Criar `src/vite-env.d.ts` com o triplo-slash reference.

---

### 4. `seedUserSkillsFromTemplates.ts` — `string[]` assignable to `string`
**Arquivo:** `scripts/seedUserSkillsFromTemplates.ts:42`

**Causa:** Atribuindo array onde o tipo espera string.

---

## 🐛 Bugs Funcionais

### 5. Simulador (SkillDetailPage) — chamada SSE incorreta
**Arquivo:** `src/components/skilldetailpage/index.tsx:89-103`

**Problema:** A função `handleSimulate` faz um `fetch('/api/lex-chat', ...)` com `response.json()`.

O endpoint `/api/lex-chat` no `server.ts:57-61` responde com **Server-Sent Events** (`text/event-stream`), não JSON. Chamar `response.json()` num SSE trava ou retorna erro de parse.

**Impacto:** O simulador de playground **nunca funciona** corretamente — cai no `catch` e exibe o fallback hardcoded (linha 107). O usuário nunca vê um resultado real.

---

### 6. LexBot — dependência de import ausente
**Arquivo:** `src/components/LexBot.tsx` (arquivo de 1469 linhas)

**Problema:** O componente importa `cn` de `../lib/utils` e usa `motion` / `AnimatePresence` de `framer-motion`. Mas não usei o `cn` nos trechos lidos — se alguma parte do componente que não li usar `cn`, está ok. O risco real: LexBot é extremamente grande (>1400 linhas) e não foi verificado integralmente.

**Suspeita:** Componente monolítico enorme, propenso a bugs de estado e re-renderização.

---

### 7. `SkillDetailPage` — import não usado e Supabase direto do browser
**Arquivo:** `src/components/skilldetailpage/index.tsx:6`

**Problema:** Importa `supabase` e faz `supabase.from("skills").select("*")` diretamente. A chave anônima do Supabase fica exposta no bundle do frontend.

**Impacto:** Segurança — qualquer um pode ler o `supabaseAnonKey` no bundle JS e fazer consultas no seu Supabase.

---

### 8. Fallback hardcoded de resultado simulado
**Arquivo:** `src/components/skilldetailpage/index.tsx:107`

**Problema:** Se a requisição falha (o que **sempre** acontece, vide #5), o fallback injeta um resultado falso:
```
"### ⚖️ DIAGNÓSTICO JURÍDICO SIMULADO (Sem Conexão API)"
```
Isso engana o usuário fazendo parecer que o simulador funcionou.

**Impacto:** Experiência enganosa — usuário acha que testou a skill, mas é texto hardcoded.

---

## ⚠️ Problemas de Segurança

### 9. Chave anônima do Supabase exposta
**Arquivo:** `src/lib/supabaseAdapter.ts:16`

**Problema:** `createClient(supabaseUrl, supabaseAnonKey)` é chamado no client-side. A `VITE_SUPABASE_ANON_KEY` é injetada no bundle.

**Mitigação:** Já usam Row Level Security (RLS) no Supabase? Se não, qualquer um pode ler/escrever na tabela `skills`.

---

### 10. `dangerouslySetInnerHTML` sem sanitização
**Arquivo:** `src/components/LexBot.tsx:435`

Renderiza markdown do modelo via `dangerouslySetInnerHTML`. O renderer `renderMarkdownPreview` escapa HTML antes de formatar, mas é caseiro e pode ter brechas.

**Risco:** XSS se o modelo gerar HTML malicioso no markdown.

---

### 11. RBAC é placeholder — sem autenticação real
**Arquivo:** `src/middleware/rbac.ts`, `server.ts:27`

**Problema:** `requireRole` espera `req.user.role`, mas não há middleware de autenticação em lugar nenhum. O endpoint `DELETE /api/account/delete` aceita requisição sem usuário autenticado — `req.body.userId` vem de qualquer um.

---

## 🔧 Problemas de Arquitetura e Manutenção

### 12. Duplicação de componentes de Skill Detail
**Pastas:**
- `src/components/skill-detail/` (OverviewTab, QualityTab, SecurityTab)
- `src/components/skilldetailpage/` (index.tsx, OverviewTab, QualityTab, SecurityTab)

**Problema:** Duas implementações concorrentes da mesma funcionalidade. A pasta `skilldetailpage/` é a ativa (importada por `SkillDetailRoute.tsx`). A pasta `skill-detail/` parece um resquício de refatoração incompleta.

---

### 13. Variáveis de ambiente sem `.env.example` documentado
**Arquivo:** `.env` (não pode ser lido, sem `.env.example` presente)

**Problema:** Quem clonar o repositório não sabe quais variáveis configurar: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `LEX_BACKEND_URL`, `ENCRYPTION_KEY`.

---

### 14. `index.html` — lang="en" e URLs placeholder
**Arquivo:** `index.html:2,11`

- `lang="en"` mas o app é em português
- Og:url aponta para `https://yourdomain.com/`
- Twitter cards apontam para domínios placeholder
- JSON-LD de SearchAction aponta para domínio genérico

**Impacto:** SEO e compartilhamento em redes sociais quebrados.

---

### 15. `motion` e `framer-motion` duplicados no package.json
**Arquivo:** `package.json:28,30`

**Problema:** `framer-motion@12.40.0` e `motion@12.23.24` instalados. `motion` é um re-export do framer-motion. Isso dobra o tamanho do bundle desnecessariamente.

---

### 16. Chunk único de 729 KB
**Build output:**
```
dist/assets/index-D1mZoQry.js   729.26 kB │ gzip: 214.65 kB
```
**Aviso do Vite:** `(!) Some chunks are larger than 500 kB`. Sem `React.lazy()` ou code splitting.

---

### 17. `node-fetch` no server.ts — desnecessário no Node 18+
**Arquivo:** `server.ts:43-44`

**Problema:** `node-fetch` com import dinâmico. Node.js 18+ tem `fetch` nativo global.

---

### 18. Cron job de retention com caminho `bash`
**Arquivo:** `server.ts:75`

**Problema:** `execSync('bash ../scripts/retention_job.sh', ...)` — executa `bash` que não existe no Windows (ambiente de desenvolvimento). E mesmo em produção Linux, o caminho relativo `../scripts/` depende do CWD.

---

### 19. Erro de digitação: `var(--color-foreground)` com typo
**Arquivo:** `src/components/LexBot.tsx:434`

```
className="... text-[var(--color-foreground)] ..."
```
Há um `--` extra — o correto é `var(--color-foreground)`. O CSS custom property reference está mal formatado? Na verdade está certo (`var(--color-foreground)`), mas o trecho lido mostra `text-[var(--color-foreground)]` — o Tailwind v4 talvez não consiga processar `var()` dentro de arbitrary value corretamente.

---

## 📊 Resumo

| Tipo | Qtd | Severidade |
|------|-----|------------|
| Erro de tipo (tsc) | 12 | Média — não quebra build, mas quebra tooling |
| Bug funcional | 3 | Alta — simulador não funciona, UX enganosa |
| Segurança | 3 | Alta — chave exposta, XSS potencial, auth ausente |
| Arquitetura | 6 | Média — duplicação, falta docs, bundle grande |
| SEO/Acessibilidade | 1 | Baixa |

## 🎨 Problemas de Layout e Estrutura Visual

---

### 20. Hero da HomePage em inglês — inconsistência com o resto do app
**Arquivo:** `src/pages/Home.tsx:29,34,39,42,48,56,62,63,65,74,75,82-84,87`

**Problema:** O texto da HomePage está majoritariamente em **inglês**:
- Badge: `"889+ legal skills available"`
- H1: `"Legal skills for your Agents."`
- Subtítulo: `"Find and run legal AI skills..."`
- Label: `"What legal task do you need help with?"`
- Placeholder: `"Draft a first-pass workflow..."`
- Botão: `"Search"`
- Links: `"How it works →"`, `"Browse all skills →"`
- Seção: `"Works with Claude, ChatGPT, Gemini, and any AI assistant"`
- Seção How it Works: títulos e descrições em inglês
- Seção Featured Skills: em inglês

Enquanto o Marketplace (`/skills`) e o restante do app estão em português.

**Impacto:** Experiência inconsistente — o usuário vê português no navbar e marketplace, mas inglês na landing page.

---

### 21. Hero da HomePage — padding vertical excessivo em mobile
**Arquivo:** `src/pages/Home.tsx:23`

```tsx
<section className="relative py-20 md:py-32 overflow-hidden">
```

`py-20` = 80px de padding em cada lado. Em viewports pequenos (< 768px), isso consome ~45% da tela antes de qualquer conteúdo útil.

**Impacto:** Usuário precisa scrollar para ver o formulário de busca em celular.

---

### 22. Gradient decoration no hero não funciona como esperado
**Arquivo:** `src/pages/Home.tsx:24`

```tsx
<div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background pointer-events-none" />
```

`from-primary/5` aplica 5% de opacidade no `#FF7518` — praticamente invisível. O `to-background` é `var(--bg)` = `#09090b` (dark). O gradiente é quase imperceptível.

**Impacto:** Elemento decorativo ocupa espaço mas não agrega valor visual.

---

### 23. Navbar — ThemeSwitcher com label "White (Dia)" inadequada
**Arquivo:** `src/components/Navbar.tsx:32,42,50`

Os tooltips dos botões de tema:
- `title="White (Dia)"` para light
- `title="Dark (Noite)"` para dark
- `title="Cream (Creme)"` para cream

`"White (Dia)"` é redundante e o parêntese com tradução é inconsistente — ou usa só português ou só inglês, não ambos.

---

### 24. Navbar — Slack Banner ocupa espaço precioso no topo
**Arquivo:** `src/components/Navbar.tsx:72-91`

Um banner roxo "Join the sanfran.md Slack community!" de 40+ pixels é exibido no topo de **todas as páginas** até o usuário clicar no X.

**Problemas:**
- Conteúdo promocional ocupa ~12% do viewport vertical
- O banner persiste entre navegações (estado local `showSlack`, não localStorage)
- Após recarregar a página, o banner reaparece
- O link aponta para `href="/slack"` — rota inexistente (cai no `Navigate to="/"`)

---

### 25. Marketplace — grid de skills usa `gap-px` com fundo `bg-card-hover` como separador
**Arquivo:** `src/components/Marketplace.tsx:489`

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-card-hover">
```

`gap-px` = 1px de gap, usando `bg-card-hover` como "linha" de separação. Isso funciona no dark mode, mas no **theme-light** e **theme-cream**:

- `bg-card-hover` no light = `#e4e4e7` (quase imperceptível contra `bg-card` = `#f4f4f5`)
- No cream: `bg-card-hover` = `#E9A24F` (laranja forte) contra `bg-card` = `#F6D2A1` — fica **muito** contrastante e feio

**Impacto:** O seletor de tema quebra a aparência do grid de skills.

---

### 26. Marketplace — "Nova Skill" com `currentUserId=""` hardcoded
**Arquivo:** `src/components/Marketplace.tsx:596`

```tsx
<CreateSkillModal
  currentUserId=""
/>
```

O modal de criação de skill recebe `currentUserId` vazio. Dentro do modal (`CreateSkillModal.tsx:48`), a chamada `upsertSkill({..., author_id: currentUserId, ...})` envia `author_id: ""` para o Supabase.

**Impacto:** Qualquer skill criada terá `author_id` vazio (ou erro de foreign key se houver constraint).

---

### 27. SkillDetailPage — layout usa grid 12 colunas com gap-6 mas overflow quebra em mobile
**Arquivo:** `src/components/skilldetailpage/index.tsx:163`

```tsx
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
```

Em mobile (< 1024px), vira 1 coluna. O conteúdo da direita (SKILL.md, integração, metadados) fica abaixo do conteúdo da esquerda (visão geral, qualidade, simulador). O problema: o **simulador** (que deveria estar em destaque) fica acima do código SKILL.md, que é o conteúdo principal que o usuário veio ver.

**Impacto:** Hierarquia visual invertida em mobile — o conteúdo principal (SKILL.md) fica abaixo do playground.

---

### 28. SkillDetailPage — metadados ("Extensões Futuras") é placeholder sem valor
**Arquivo:** `src/components/skilldetailpage/index.tsx:423-426`

```tsx
<div className="border border-[#1f1f24] bg-[#0c0c0e] p-5 mb-5 rounded-sm">
  <h3 className="text-sm font-semibold text-foreground mb-2 font-mono">Extensões Futuras</h3>
  <p className="text-xs text-muted font-sans">Aqui poderão ser adicionados componentes avançados...</p>
</div>
```

Placeholder visível para o usuário, dentro da aba "DADOS". Ocupa espaço e não entrega valor.

---

### 29. SkillDetailPage — "Downloads" calculado artificialmente
**Arquivo:** `src/components/skilldetailpage/index.tsx:151`

```tsx
<span className="text-slate-100 font-semibold">{(skill.starsCount * 1.5).toLocaleString()}</span>
```

O número de downloads é `starsCount * 1.5` — um cálculo fictício sem relação com dados reais. Infla artificialmente as estatísticas.

**Impacto:** Métricas enganosas para o usuário.

---

### 30. Simulador (SkillDetailPage) — input de teste não persiste na troca de abas
**Arquivo:** `src/components/skilldetailpage/index.tsx:48`

O `testInput` é iniciado com `skill.playgroundTestInput || ""`, mas se o usuário digitar algo e trocar de aba (Visão Geral → Qualidade → Segurança), o texto digitado é perdido porque o estado pertence ao componente pai e o `SkillDetailPage` não preserva o input.

Na verdade o estado vive no `SkillDetailPage`, então ele **persiste** — esse item está incorreto. (auto-correção)

---

### 31. Marketplace — sticky filter bar cobre o topo do hero quando visível
**Arquivo:** `src/components/Marketplace.tsx:169-208`

A sticky compact filter bar aparece quando `isScrolled > 200`. Ela tem `z-40` e `bg-background/95`. Mas quando transiciona para visível, ela se sobrepõe ao hero e ao cabeçalho de verticais porque está `fixed top-0 left-0 right-0`.

**Problema:** O Navbar principal tem `sticky top-0 z-50`. A sticky filter bar tem `z-40`. A ordem de empilhamento está correta (navbar acima), mas a filter bar fica abaixo do conteúdo da página que está em posição estática — sem problemas de sobreposição, mas a barra oculta o topo do hero quando o usuário scrolla.

---

### 32. LexBot — sidebar com `w-0` causa problemas de layout transition
**Arquivo:** `src/components/LexBot.tsx:1098`

```tsx
className={`${isSidebarOpen ? "w-[260px] md:w-[280px]" : "w-0"} flex-shrink-0 transition-all duration-300 ...`}
```

Quando a sidebar está fechada (`w-0`), o conteúdo interno (`p-4 flex-1 overflow-y-auto`) continua renderizado — apenas invisível por overflow. Os botões e listas ainda estão no DOM e podem receber foco via Tab.

**Impacto:** Acessibilidade — navegação por teclado pode focar elementos da sidebar mesmo quando ela está "fechada".

---

### 33. LexBot — input area fixa com `absolute bottom-0` sobrepõe últimas mensagens
**Arquivo:** `src/components/LexBot.tsx:1294`

```tsx
<div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background ... pt-8 pb-6 px-4">
```

A área de input está posicionada `absolute bottom-0` dentro do container principal. A área de mensagens tem `pb-32` para compensar. Mas se o usuário tem muitas mensagens, a última mensagem fica parcialmente coberta pelo gradiente de transparência e pelo input.

**Impacto:** Última mensagem parcialmente invisível; o botão "Ir para o fim ↓" ajuda, mas não soluciona.

---

### 34. LexBot — fullscreen artifact overlay com padding `p-6` não cobre totalmente em mobile
**Arquivo:** `src/components/LexBot.tsx:1440`

```tsx
className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6"
```

Em mobile (< 640px), o `p-6` deixa 24px de borda visível do fundo da página. O overlay não ocupa 100% da tela.

---

### 35. Toast — animação `animate-slide-in-right` sem keyframe definido
**Arquivo:** `src/components/Toast.tsx:105`

```tsx
className={`... animate-slide-in-right`}
```

A classe `animate-slide-in-right` é usada, mas **não está definida em `index.css`** nem em nenhum outro lugar. Não há `@keyframes slide-in-right`. A animação simplesmente não existe.

**Impacto:** Toasts aparecem sem animação.

---

### 36. CSS — scrollbar customizada no `index.css` não funciona no Firefox
**Arquivo:** `src/index.css:103-116`

`::-webkit-scrollbar` é exclusivo do WebKit (Chrome, Edge, Safari). Firefox não reconhece. Não há fallback com `scrollbar-width: thin` para Firefox.

**Impacto:** Firefox renderiza scrollbars padrão (mais largas, sem customização).

---

### 37. CSS — variáveis CSS com fallback ausente para `@import "tailwindcss"`
**Arquivo:** `src/index.css:1`

`@import "tailwindcss"` é a sintaxe do Tailwind v4. A linha `@layer base` define custom properties. Mas se o Tailwind v4 falhar em processar (por exemplo, se o `@tailwindcss/vite` não estiver configurado corretamente), **nenhuma variável CSS é definida** e o app fica sem estilos — fundo branco, texto preto, layout quebrado.

---

### 38. SkillCard — ícone `GitFork` usado como "downloads"
**Arquivo:** `src/components/SkillCard.tsx:164`

```tsx
<GitFork className="w-2.5 h-2.5" />
{downloadsLabel}
```

O ícone `GitFork` (bifurcação/github) é usado para representar número de downloads/estrelas. Semanticamente incorreto — `GitFork` sugere forks de repositório, não downloads ou popularidade.

---

### 39. SkillCard — `line-clamp-2` não funciona sem utilitário Tailwind
**Arquivo:** `src/components/SkillCard.tsx:67,140`

`line-clamp-2` é uma utility do Tailwind que depende do plugin `@tailwindcss/line-clamp`. No Tailwind v4, line-clamp é nativo (incluído no core). Verificar se está disponível.

**Risco:** Se não houver, o texto não será truncado.

---

### 40. SkillDetailRoute — estado de erro e carregamento sem fallback visual completo
**Arquivo:** `src/pages/SkillDetailRoute.tsx:50-72`

O estado de loading mostra spinner e texto. O estado de erro mostra mensagem + botão "Voltar". Mas:

- Se o slug for inválido, redireciona corretamente
- Se a API retornar erro 500, a mensagem `err.message` pode conter detalhes técnicos expostos ao usuário
- Não há timeout no fetch — se a API demorar, o spinner fica para sempre

---

### 41. SkillsPage (App.tsx) não trata erro de `useNavigate`
**Arquivo:** `src/App.tsx:13-22`

```tsx
function SkillsPage() {
  const navigate = useNavigate();
  return (
    <Marketplace
      onSelectSkill={(skill) => navigate(`/skills/${skill.slug || skill.id}`)}
      ...
    />
  );
}
```

`skill.slug` pode ser `undefined` (opcional em `LegalSkill`). Se `slug` for undefined, cai para `skill.id`. Funciona, mas a URL fica inconsistente — `/skills/123` ao invés de `/skills/nome-da-skill`.

---

## 📊 Resumo

| Tipo | Qtd | Severidade |
|------|-----|------------|
| Erro de tipo (tsc) | 12 | Média — não quebra build, mas quebra tooling |
| Bug funcional | 3 | Alta — simulador não funciona, UX enganosa |
| Segurança | 3 | Alta — chave exposta, XSS potencial, auth ausente |
| Arquitetura | 6 | Média — duplicação, falta docs, bundle grande |
| Layout / Visual | 18 | Variada — inconsistência idioma, temas quebrados, animação ausente |
| SEO/Acessibilidade | 3 | Baixa |

### Recomendação Imediata

1. Corrigir o SSE no simulador (substituir `response.json()` por leitura de stream com `ReadableStream`)
2. Remover o fallback hardcoded de resultado simulado
3. Criar `src/vite-env.d.ts` para resolver os erros de `import.meta.env`
4. Remover a pasta duplicada `src/components/skill-detail/`
5. Adicionar `.env.example`
6. Remover `motion` do package.json (manter só `framer-motion`)
7. Corrigir `lang` e URLs do `index.html`
8. **Traduzir HomePage para português** — hero, badges, seções How It Works e Featured Skills
9. **Adicionar `@keyframes slide-in-right`** no `index.css` ou remover a classe do Toast
10. **Adicionar `scrollbar-width: thin`** no `index.css` para Firefox
11. **Persistir `showSlack` no localStorage** ou remover o banner se `/slack` não é rota válida
12. **Substituir `GitFork`** por `Download` ou `Star` no SkillCard footer
13. **Garantir que `SkillCard` no theme-light/cream** tenha gaps visíveis no grid
14. **Implementar autenticação real ou remover** o endpoint `DELETE /api/account/delete`
15. **Trocar `node-fetch` por `fetch` nativo** no `server.ts`