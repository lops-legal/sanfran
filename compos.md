# Redesign da Home — sumário de mudanças para o Hermes

Contexto: a `Home` continua sendo **uma única page**, na rota `/`, arquivo `src/pages/Home.tsx`.
Nenhuma rota nova foi criada. Cada bloco da narrativa virou uma **seção** (`<section>`) dentro
dela, como componente próprio em `src/components/home/`. Isso respeita a arquitetura atual
(pages/ para rotas, componentes internos para blocos de UI) e deixa cada seção testável e
substituível isoladamente.

Direção de design: paleta creme/café/branco, narrativa em 6 atos (numerados como cláusulas
jurídicas — `§01`...`§06`, referência ao domínio do produto), scroll-reveal sutil via
`IntersectionObserver` nativo (sem framer-motion), e um elemento-assinatura: os badges de
confiança em formato de "selo/carimbo" (borda tracejada, leve rotação), remetendo a carimbo
de autenticidade de documento jurídico.

---

## 1. Arquivos novos (podem ser adicionados diretamente, sem conflito)

| Arquivo | O que faz |
|---|---|
| `src/hooks/useInView.ts` | Hook de scroll-reveal com `IntersectionObserver`. Respeita `prefers-reduced-motion`. |
| `src/styles/home-motion.css` | CSS isolado: classes `.reveal`, `.stamp-badge`, `.clause-eyebrow`, barra de progresso. Não sobrescreve nenhuma classe global existente. |
| `src/components/home/ScrollProgressBar.tsx` | Barra fina de progresso de leitura, `sticky`, `aria-hidden`. |
| `src/components/home/HeroSection.tsx` | § 01 — hero. Mesma lógica de busca do `Home.tsx` original (mesmo `useCatalogStats`, mesma navegação). |
| `src/components/home/TransitionQuote.tsx` | § 02 — nova seção de transição editorial (uma frase, sem CTA). |
| `src/components/home/HowItWorksSection.tsx` | § 03 — "Como funciona". Mesmo conteúdo dos 3 passos originais, numeração trocada de círculo `1/2/3` para `§01/§02/§03`. |
| `src/components/home/FeaturedSkillsSection.tsx` | § 04 — "Skills em Destaque". Conteúdo idêntico ao original, apenas reestilizado. |
| `src/components/home/TrustSection.tsx` | § 05 — nova seção de confiança (badges + depoimento). **Contém placeholder de depoimento, ver seção 4 abaixo.** |
| `src/components/home/FinalCTASection.tsx` | § 06 — nova seção de fechamento, não existia no código original. |

## 2. Arquivos modificados

### `src/pages/Home.tsx` — substituição completa

O arquivo inteiro deve ser trocado pelo novo `Home.tsx` (anexo), que agora só importa e
orquestra as 6 seções acima. Toda a lógica que antes estava inline (estado de busca,
`useCatalogStats`, os 3 passos) foi movida para dentro de `HeroSection.tsx` e
`HowItWorksSection.tsx` — o comportamento é o mesmo, só mudou de lugar.

**Verificação para o Hermes**: confirmar que nenhum outro arquivo importa algo de
`pages/Home.tsx` além do próprio roteador (`App.tsx` ou `routes.tsx`) — como a assinatura
do `export default function Home()` foi mantida, a troca deve ser transparente para o
roteamento.

### `src/index.css` (ou equivalente onde estão as CSS vars do tema) — **precisa de ajuste manual**

Não tive acesso ao conteúdo atual desse arquivo, então não consigo dar um `diff` exato — mas
a mudança de paleta (creme/café no lugar da paleta atual) se resolve **só editando os valores
das CSS variables no bloco `:root`**, sem tocar em nenhum componente, porque todos os
componentes já usam tokens semânticos (`bg-primary`, `text-accent`, `bg-card`,
`border-border`, `text-muted`, `text-xmuted`) em vez de cor hardcoded.

Passos para o Hermes:
1. Localizar o bloco `:root { --background: ...; --foreground: ...; --primary: ...; ... }`
   (provavelmente logo no topo de `index.css`, formato shadcn/HSL: `H S% L%`).
2. Substituir pelos valores de referência abaixo (todos em HSL, mesmo formato que o projeto
   já deve estar usando):

```css
:root {
  --background: 42 38% 93%;       /* creme */
  --foreground: 24 28% 14%;       /* café escuro (texto principal) */
  --card: 0 0% 100%;              /* branco puro, para contraste dentro do creme */
  --card-foreground: 24 28% 14%;
  --primary: 9 45% 32%;           /* "selo" oxblood — usado em bg-primary (botões, CTA) */
  --primary-dim: 9 45% 26%;       /* variante mais escura para hover, se existir esse token */
  --accent: 30 55% 42%;           /* caramelo — usado em text-accent (links) */
  --muted: 38 28% 88%;            /* areia — usado em bg-muted/bg-card/50 */
  --muted-foreground: 26 18% 38%; /* café médio — usado em text-muted */
  --xmuted: 28 14% 55%;           /* café claro — usado em text-xmuted (metadados) */
  --border: 36 24% 83%;           /* areia — bordas e divisores */
}
```

3. **Se os nomes das variáveis no arquivo real forem diferentes** (ex: `--muted-2` em vez de
   `--xmuted`, ou se não existir `--primary-dim`), mapear pelo *uso*, não pelo nome: encontrar
   qual variável hoje alimenta `bg-primary` no Tailwind config e trocar o valor dela, mesma
   lógica para as demais.
4. Não é necessário editar `tailwind.config` — se `bg-primary`, `text-accent` etc. já existem
   como classes funcionando hoje, eles já apontam para essas CSS vars.
5. Testar em ambos os modos, se o projeto tiver dark mode (`.dark { ... }`) — os valores acima
   são só para o modo claro. Se dark mode existir e for usado na home, favor sinalizar antes de
   eu propor os valores escuros (não quis inventar sem confirmação).

### Fonte serifada — opcional, não bloqueante

Os componentes já usam `font-serif` (classe Tailwind existente). Se o `tailwind.config`
mapear `fontFamily.serif` para uma fonte genérica do sistema, sugiro trocar por algo com mais
personalidade editorial (ex: `"Source Serif 4"` ou `"Newsreader"`, via Google Fonts) — mas
isso é uma melhoria opcional, não é necessário para o design funcionar.

---

## 3. Checklist de verificação para o Hermes

- [ ] `Home.tsx` renderiza sem erros de import (checar caminhos relativos `../components/home/*` e `../hooks/useInView`).
- [ ] `useCatalogStats` continua sendo chamado uma única vez (agora dentro de `HeroSection`, não mais em `Home.tsx`).
- [ ] Scroll reveal funciona em todas as 6 seções e **não** dispara de novo ao rolar pra cima (comportamento `triggerOnce`).
- [ ] Com `prefers-reduced-motion: reduce` ativado no SO, nenhuma seção deveria ficar invisível — todas devem aparecer direto sem animação (testar no DevTools → Rendering → Emulate CSS media feature).
- [ ] Testar responsividade mobile — nenhuma seção nova (`TransitionQuote`, `TrustSection`, `FinalCTASection`) foi testada em telas < 375px, vale checar quebras de linha nos badges de selo.
- [ ] Contraste do novo `--foreground` (café) sobre `--background` (creme) — validar com axe DevTools ou Lighthouse (meta: AA, 4.5:1 mínimo em texto de corpo).
- [ ] Link `#como-funciona` do hero ainda aponta pro `id="como-funciona"`, que segue na `HowItWorksSection` — confirmar que o scroll suave (se houver `scroll-behavior: smooth` no CSS global) não quebrou.

## 4. Pendências que dependem de decisão do time (não resolvi sozinho)

- **Depoimento em `TrustSection.tsx`**: está com texto placeholder e comentário `TODO(Hermes)`.
  Precisa de aprovação jurídica antes de publicar qualquer citação de cliente real.
- **Grid de skills reais em `FeaturedSkillsSection.tsx`**: mantive só o botão "Ver Todas as
  Skills" como no original — não criei cards de skill fictícios porque não vi um hook de dados
  (`useFeaturedSkills` ou similar) confirmado no projeto. Se existir, é só trocar o botão por um
  grid de `SkillCard` ali dentro.
- **Dark mode**: não ajustei porque não sei se a home usa. Avisar se precisar dos valores HSL
  escuros da paleta creme/café. 