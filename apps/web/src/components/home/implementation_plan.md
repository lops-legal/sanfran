# Migração: Vite SPA → Next.js (App Router) com SSR

## Por que o problema existe

O site atual é uma **SPA (Single Page Application)** construída com Vite + React. Quando um bot de IA, Google, ou qualquer crawler acessa a URL, ele recebe o `index.html` bruto, que tem apenas:

```html
<div id="root"></div>
<script type="module" src="...bundle.js"></script>
```

Todo o HTML real só existe **depois** que o JavaScript executa no browser. Crawlers e IAs não rodam JS, então veem uma página em branco.

**A solução real**: migrar para **Next.js (App Router)**, que gera o HTML completo no servidor antes de mandar para o cliente — isso é chamado de **SSR (Server-Side Rendering)** ou **SSG (Static Site Generation)**.

---

## Análise do projeto atual

| Item | Status atual |
|---|---|
| Framework | Vite + React + TypeScript |
| Roteamento | `react-router-dom` (BrowserRouter) |
| Estilo | Tailwind CSS v4 |
| Dados | Supabase (via `fetch /api/skills`) + mock fallback |
| Backend | Express server (`server.ts`) rodando na porta 8000 |
| Deploy | Vercel (static build do Vite) |
| Animações | Framer Motion + `useInView` hook custom |
| Auth | Supabase Auth (`AuthContext`) |

### Rotas existentes

| Rota | Componente |
|---|---|
| `/` | `Home.tsx` (8 seções: Hero, WhySkills, HowItWorks, Featured, WhyMCP, FinalCTA) |
| `/skills` | `Marketplace.tsx` (catálogo com filtros, search, infinite scroll) |
| `/skills/:slug` | `SkillDetailRoute.tsx` (detalhe da skill) |
| `/admin` | `AdminDashboard.tsx` |

---

## Estratégia de migração

A abordagem mais segura é criar um **novo app Next.js em `apps/next-web/`** em paralelo, preservando o Vite original intocado até validarmos o Next.js funcionando. Quando estiver pronto, o deploy na Vercel aponta para o novo app.

> [!IMPORTANT]
> O Express `server.ts` (que serve a `/api`) não vai ser migrado agora. O Next.js vai consumir a mesma API via `fetch`. No futuro, a `/api` pode ser movida para **Next.js Route Handlers**, mas isso está fora do escopo deste plano.

---

## Proposed Changes

### 1. Estrutura do novo projeto

#### [NEW] `apps/next-web/` — novo projeto Next.js

```
apps/next-web/
├── app/
│   ├── layout.tsx              # Root layout (Navbar, Footer, providers)
│   ├── page.tsx                # Rota / (Home) — SSG
│   ├── skills/
│   │   ├── page.tsx            # Rota /skills — SSR (filtros dinâmicos)
│   │   └── [slug]/
│   │       └── page.tsx        # Rota /skills/:slug — SSR + generateMetadata
│   └── admin/
│       └── page.tsx            # Rota /admin — Client Component
├── components/                 # Cópia/adaptação dos componentes atuais
│   ├── home/                   # HeroSection, HowItWorks, etc.
│   ├── Navbar.tsx
│   ├── Marketplace.tsx
│   ├── SkillCard.tsx
│   └── ...
├── lib/
│   ├── supabase.ts             # Cliente Supabase para server-side
│   ├── api.ts                  # fetch das skills (server-side)
│   └── ...
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

### 2. Mudanças por rota

#### Rota `/` (Home) → Static Site Generation (SSG)

A home não tem dados dinâmicos críticos. Vai ser gerada **em build time**, resultando em HTML estático puro — índice perfeito para bots e IAs.

```tsx
// app/page.tsx
export const dynamic = 'force-static'; // gera HTML estático

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhyUseSkillsSection />
      <HowItWorksSection />
      <FeaturedSkillsSection />  // dados buscados em build time
      <WhyUseOurMCPSection />
      <FinalCTASection />
    </>
  );
}
```

#### Rota `/skills` (Marketplace) → SSR + Client Component

A página do catálogo tem filtros interativos e infinite scroll — precisa de JavaScript. Mas o **primeiro carregamento** terá HTML real com os primeiros 12 cards renderizados no servidor.

```tsx
// app/skills/page.tsx (Server Component)
export default async function SkillsPage({ searchParams }) {
  const skills = await fetchSkills({ ...searchParams }); // busca no servidor
  return <MarketplaceClient initialSkills={skills} />;   // hidrata no cliente
}
```

#### Rota `/skills/:slug` → SSR + `generateMetadata`

Cada skill terá título, descrição e OG image gerados dinamicamente para SEO perfeito.

```tsx
// app/skills/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const skill = await fetchSkillBySlug(params.slug);
  return {
    title: `${skill.name} | Sanfran.md`,
    description: skill.description,
    openGraph: { ... }
  };
}

export default async function SkillPage({ params }) {
  const skill = await fetchSkillBySlug(params.slug);
  return <SkillDetailPage skill={skill} />;
}
```

---

### 3. Adaptações necessárias nos componentes

| Componente | Mudança necessária |
|---|---|
| `BrowserRouter` | Removido — Next.js tem seu próprio roteamento |
| `useNavigate()` | Substituído por `useRouter()` do Next.js |
| `import.meta.env.VITE_*` | Substituído por `process.env.NEXT_PUBLIC_*` |
| `window.location.search` | Substituído por `useSearchParams()` do Next.js |
| Componentes com `useEffect` + `window` | Marcados com `"use client"` |
| Componentes puramente visuais (seções home) | Server Components (sem `"use client"`) |
| `Framer Motion` | Compatível, mas requer `"use client"` nos componentes animados |

---

### 4. Configuração do Vercel

O Vercel detecta Next.js automaticamente. A única mudança é apontar o **Root Directory** do projeto no painel da Vercel de `apps/web` para `apps/next-web`.

---

## Decisões confirmadas

✅ **Backend**: Express (`server.ts`) **não migra**. O Next.js vai consumir a `/api` do servidor Express existente via `fetch`.

✅ **Auth**: Supabase Auth mantido igual ao atual (`AuthContext` com client-side).

> [!NOTE]
> **TODO futuro — Supabase SSR Auth**: migrar para Supabase Auth com cookies (`@supabase/ssr`) para maior segurança e suporte a Server Components. Abordar em iteração separada.

> [!NOTE]
> **Tailwind v4**: O projeto usa `@tailwindcss/vite`. No Next.js vou usar `@tailwindcss/postcss` (mesma versão v4, adaptador diferente).

---

## Verificação

### Como vamos confirmar que funcionou

1. Rodar `curl https://sanfranmd.vercel.app/` e ver **HTML real** com conteúdo do site no terminal
2. Pedir para uma IA pesquisar o site e ela deve conseguir ler o conteúdo
3. Google Search Console: URL inspection deve mostrar "Page is eligible to appear in Search"
4. Lighthouse: SEO score 90+

### Comandos de teste local

```bash
cd apps/next-web
npm run build
npm start
# aí: curl http://localhost:3000/ e ver o HTML
```
