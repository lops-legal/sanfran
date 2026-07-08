# Auditoria do Frontend – Sanfran.md

*Data: $(date)*

## Sumário
1. **Visão geral do stack**
2. **Problemas críticos detectados**
3. **Oportunidades de otimização de performance**
4. **Melhorias de usabilidade & acessibilidade**
5. **Padrões de código & boas práticas**
6. **Design de UI/UX – estado‑de‑arte**
7. **Roadmap de refatoração**

---

### 1️⃣ Visão geral do stack
- **Framework**: React 19 (ESM) com TypeScript ~5.8.
- **Bundler**: Vite 6 + esbuild para build server‑side.
- **Estilização**: TailwindCSS 4 (JIT) + classes customizadas.
- **Gerenciamento de estado**: Context API (`AuthContext`) + hooks locais; ainda não há solução global como Redux/ Zustand.
- **Autenticação**: Supabase Auth.
- **Componentes UI**: `lucide-react` para ícones, componentes próprios.
- **Testes / Lint**: `tsc --noEmit`, `eslint`, `prettier`.

---

### 2️⃣ Problemas críticos detectados (lint / TS)
| Arquivo | Problema | Impacto |
|----------|----------|---------|
| `scripts/seedUserSkillsFromTemplates.ts` (linha 42) | Tipo `string[]` atribuído a `string` | Falha de compilação → bloqueia build.
| `ErrorBoundary.tsx` | Uso incorreto de `this.state`/`this.setState` em componente de classe sem definir `state` | Quebra de runtime; impede captura de erros.
| `Marketplace.tsx` (linha 478) | Falta propriedade `onCreate` em `props` ao renderizar `<CreateSkillModal />` | Erro de renderização, UI pode não abrir modal.

**Ação recomendada**: corrigir os erros acima antes de qualquer otimização de performance.

---

### 3️⃣ Oportunidades de otimização de performance
1. **Code‑splitting & Lazy loading**
   - Aplicar `React.lazy` + `<Suspense>` nos componentes de rotas menos usadas (`SkillDetailRoute`, `AdminDashboard`, `CreateSkillModal`).
   - Vite já gera chunks; garantir que o `import()` seja usado.
2. **Prefetch & Preload**
   - Utilizar `link rel="preload"` para fontes críticas e ícones SVG.
3. **Imagem & Asset handling**
   - Migrar imagens estáticas para `next‑image`‑like via `vite-plugin-imagemin` ou servir em formatos WebP/AVIF.
4. **Memoização**
   - Muitos callbacks (`onSelectSkill`, `handleThemeChange`) são recriados a cada render. Envolver com `useCallback` e componentes pesados com `React.memo`.
5. **Tailwind JIT**
   - Verificar se `purge` está configurado corretamente para remover classes não usadas (reduz bundle CSS).
6. **Server‑Side Rendering (SSR) opcional**
   - Vite + `tsx` já gera `dist/server.cjs`. Avaliar trazer **Hydration** para melhorar First Contentful Paint (FCP).
7. **Reduzir re‑renders do Navbar**
   - O `ThemeSwitcher` altera o `className` do `documentElement`; considerar mover a lógica para um hook global que usa `useEffect` apenas uma vez.
8. **Uso de `useTransition`**
   - Em buscas infinitas (`useInfiniteSkills`) aplicar `startTransition` para melhorar a UX ao carregar novos itens.

---

### 4️⃣ Melhorias de usabilidade & acessibilidade (A11y)
- **ARIA landmarks**: envolver `<header>`, `<nav>`, `<main>` com atributos `role="banner"`, `role="navigation"`, `role="main"`.
- **Foco visível**: garantir que botões e links tenham `:focus-visible` estilos (Tailwind: `focus-visible:ring-2`).
- **Contraste**: verificar contraste de cores nas classes `bg-primary/10` etc.; usar ferramentas como `axe`.
- **Labels**: o botão de tema só tem ícone; adicionar `aria-label` dinâmico (`theme-switcher-light`, etc.).
- **Keyboard navigation**: o dropdown do usuário deve fechar ao pressionar `Esc` e ser navegável via `Tab`.
- **Skip links**: inserir link “Ir para conteúdo” no topo para melhorar navegação de leitores de tela.
- **Internationalização**: o projeto já tem textos em PT‑BR; considerar usar uma camada i18n (ex.: `react-i18next`) para fácil manutenção.

---

### 5️⃣ Padrões de código & boas práticas
| Área | Recomendações |
|------|----------------|
| **Arquitetura** | Adopt **feature‑sliced** folder layout (`features/skills/...`) ao invés de misturar tudo em `components/`.
| **Tipagem** | Sempre tipar props (`interface Props { … }`). Evitar `any`.
| **Hooks** | Criar hooks reutilizáveis (`useTheme`, `useAuthModal`) para separar lógica da UI.
| **Estado global** | Substituir múltiplos `useState` espalhados por um pequeno store (Zustand ou Jotai) para evitar “prop drilling”.
| **Testing** | Introduzir **React Testing Library** + Jest; cobrir `Navbar`, `ThemeSwitcher`, `ErrorBoundary`.
| **Lint** | Habilitar `eslint-plugin-react-hooks` (detecta dependências ausentes) e `eslint-plugin-jsx-a11y`.
| **Commit style** | Usar `commitizen` e `husky` para garantir mensagens padronizadas.

---

### 6️⃣ Design de UI/UX – Estado‑de‑arte
| Tema | Ideia | Como implementar |
|------|-------|------------------|
| **Micro‑interações** | Animações suaves ao trocar tema (Tailwind `transition-colors` + `framer‑motion`). | Atualizar `ThemeSwitcher` para usar `motion.button`.
| **Dark/Light/Creme** | Persistir escolha via **CSS Custom Properties** e expor em `:root` para que terceiros (ex.: docs, newsletters) possam usar o mesmo tema.
| **Component Library** | Considerar **Radix UI** ou **Shadcn/ui** para botões, dropdowns, dialogos – trazem acessibilidade pronta.
| **Skeleton Loading** | Enquanto `Marketplace` carrega skills, exibir skeleton cards (ex.: `react-loading-skeleton`).
| **Responsive Design** | Verificar breakpoints: `md:flex` ok, mas faltam `lg:` e `xl:` para tablets grandes.
| **Dark Mode Branding** | Aplicar cores de brand (purple) no modo escuro com `theme-dark` palette, mantendo contraste.
| **Feedback visual** | Toasts já existem; garantir que todas as ações async (login, logout, publish) dispararem toast com status.
| **Progressive Web App** | Habilitar PWA (manifest, service worker) para uso offline em dispositivos móveis.

---

### 7️⃣ Roadmap de refatoração (curto‑prazo)
1. **Corrigir erros de compilação** (TS + lint) – prioridade alta.
2. **Adicionar `eslint-plugin-jsx-a11y`** e corrigir os warnings de acessibilidade.
3. **Implementar lazy loading** para rotas e componentes pesados.
4. **Refatorar `Navbar`**:
   - Extrair `ThemeSwitcher` e `UserMenu` para hooks/componentes separados.
   - Aplicar `useCallback` nos handlers.
5. **Migrar `ErrorBoundary`** para um componente funcional usando `React.ErrorBoundary` (ou criar classe correta).
6. **Criar `useTheme` hook** para centralizar lógica de tema e remover `localStorage` direto nos componentes.
7. **Adicionar skeletons** ao `Marketplace` e `SkillDetailRoute`.
8. **Revisar Tailwind config** para garantir purge e otimização de CSS.
9. **Estabelecer testes unitários** nas áreas críticas (auth flow, theme switch, marketplace fetch).
10. **Planejar upgrade UI library** (Shadcn/Radix) e design system interno (tokens de cores, tipografia).

---

### 📌 Conclusão
A base do frontend está bem estruturada, mas apresenta falhas de compilação que impedem a produção. A aplicação pode se beneficiar de práticas modernas de **code‑splitting**, **memoização**, **acessibilidade** e **design system**. Seguindo o roadmap acima, o Sanfran.md terá um UI inteligente, responsivo, rápido e alinhado ao estado‑de‑arte de aplicações React contemporâneas.

---

*Este documento foi gerado automaticamente por Hermes Agent.*