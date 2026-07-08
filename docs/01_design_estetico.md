# 01 — Design Estético
## agentskills.legal — Análise Visual Completa & Spec de Implementação

> **Objetivo:** Reproduzir e evoluir o design visual do site com stacks state-of-the-art.

---

## 1. Identidade Visual

### 1.1 Paleta de Cores

| Token                  | Valor (inferido/observado) | Uso                                      |
|------------------------|---------------------------|------------------------------------------|
| `--color-bg`           | `#0A0A0A` / `#09090B`     | Fundo global (dark mode puro)            |
| `--color-surface`      | `#111113`                 | Cards, painéis, nav                      |
| `--color-surface-2`    | `#1A1A1E`                 | Hover state em cards                     |
| `--color-border`       | `#27272A`                 | Bordas sutis, divisores                  |
| `--color-border-hover` | `#3F3F46`                 | Bordas em foco/hover                     |
| `--color-primary`      | `#6366F1` (Indigo-500)    | CTA principal, links ativos              |
| `--color-primary-dim`  | `#4F46E5` (Indigo-600)    | Hover no CTA                             |
| `--color-accent`       | `#A5B4FC` (Indigo-300)    | Destaques inline, badges                 |
| `--color-text-primary` | `#FAFAFA`                 | Headings, texto principal                |
| `--color-text-muted`   | `#A1A1AA`                 | Subtítulos, metadados, descrições        |
| `--color-text-xmuted`  | `#71717A`                 | Placeholders, timestamps                 |
| `--color-tag-bg`       | `#18181B`                 | Background de badges/tags                |
| `--color-tag-text`     | `#A1A1AA`                 | Texto de tags                            |
| `--color-success`      | `#22C55E`                 | Indicadores positivos (downloads, uses)  |
| `--color-warning`      | `#EAB308`                 | Alertas secundários                      |
| `--color-slack`        | `#4A154B`                 | Banner do Slack (cor da marca)           |

**Estratégia cromática:** Esquema monocromático escuro com acento único em índigo/violeta. Minimalismo profissional — sem gradientes chamativos; a hierarquia emerge da escala de cinzas.

---

### 1.2 Tipografia

| Papel              | Família          | Peso       | Tamanho (Desktop) | Tamanho (Mobile) |
|--------------------|------------------|------------|--------------------|------------------|
| Display/H1         | `Inter` (ou `Geist`) | 700–800 | `clamp(2.5rem, 5vw, 4rem)` | `2rem`        |
| H2 (section)       | `Inter`          | 600        | `1.75rem`          | `1.375rem`       |
| H3 (card title)    | `Inter`          | 600        | `1rem`             | `0.9375rem`      |
| Body / Descrição   | `Inter`          | 400        | `0.9375rem`        | `0.875rem`       |
| Código / Snippets  | `JetBrains Mono` ou `Fira Code` | 400 | `0.875rem`   | `0.8125rem`      |
| Label / Tag        | `Inter`          | 500        | `0.75rem`          | `0.75rem`        |
| Nav links          | `Inter`          | 500        | `0.875rem`         | `0.875rem`       |

**Escala tipográfica:** Majorante × 1.250 (Major Third). Line-height padrão: `1.6` para body, `1.2` para headings. Letter-spacing: `−0.02em` em headings display.

**Fonte recomendada state-of-the-art:**
- **Primária:** `Geist` (Vercel) — moderna, otimizada para dark UI
- **Alternativa:** `Inter` (Rasmus Andersson) — amplamente suportada, excelente legibilidade
- **Código:** `Geist Mono` ou `JetBrains Mono`

---

### 1.3 Espaçamento & Grid

```
Base unit: 4px (0.25rem)
Spacing scale: 4 | 8 | 12 | 16 | 24 | 32 | 48 | 64 | 96 | 128px
               xs  sm  md   base lg   xl  2xl  3xl  4xl  5xl
```

| Elemento                | Espaçamento               |
|-------------------------|---------------------------|
| Container max-width     | `1280px` (xl) / `1024px` (lg) |
| Padding lateral página  | `24px` mobile / `48px` desktop |
| Gap entre cards         | `16px` (grid) / `12px` (list) |
| Padding interno card    | `20px–24px`               |
| Section vertical gap    | `80px–96px`               |
| Nav altura              | `60px` desktop / `56px` mobile |

**Grid do catálogo de skills:**
- Desktop ≥1280px: 3 colunas
- Tablet 768–1279px: 2 colunas
- Mobile <768px: 1 coluna
- Gap: `16px`

---

### 1.4 Componentes Visuais Detalhados

#### 1.4.1 Navigation Bar
```
Position: sticky top-0
Height: 60px
Background: rgba(9, 9, 11, 0.85) — glassmorphism com backdrop-blur: 12px
Border-bottom: 1px solid var(--color-border)
z-index: 50

Esquerda: Logo "agentskills.legal" — texto, fonte monospace bold, cor primária
Centro/Direita: Links [Skills] [Integrate] [Docs]
  - Estado normal: color-text-muted
  - Estado hover: color-text-primary
  - Transição: 150ms ease
```

#### 1.4.2 Banner de Slack (topo)
```
Background: linear-gradient(90deg, #4A154B, #611f69)
Altura: 36px
Texto: 12px, centered, branco
Link: sublinhado em hover, cursor pointer
Dismissível com X (icon 14px)
```

#### 1.4.3 Hero Section
```
Layout: centrado, max-width 720px, padding-top: 80px, padding-bottom: 64px
Stat badge: "883+ legal skills available"
  - Background: rgba(99, 102, 241, 0.1)
  - Border: 1px solid rgba(99, 102, 241, 0.3)
  - Border-radius: 9999px (pill)
  - Padding: 4px 14px
  - Font: 12px, medium, color-accent

H1: "Legal skills for your Agents."
  - Tamanho: clamp(2.25rem, 5vw, 3.75rem)
  - Peso: 700
  - Line-height: 1.1
  - Cor: var(--color-text-primary)

Subtítulo: max-width 560px, centered, 1.125rem, color-text-muted

Search bar:
  - Width: 100%, max-width 560px
  - Height: 52px
  - Background: var(--color-surface)
  - Border: 1px solid var(--color-border)
  - Border-radius: 12px
  - Padding: 0 16px
  - Icon lupa: 20px, color-text-xmuted, posição esquerda
  - Placeholder: "What legal task do you need help with?"
  - Focus: border-color: var(--color-primary), box-shadow: 0 0 0 3px rgba(99,102,241,0.15)
  - Transição: 200ms ease

CTA links secundários: "How it works →" | "Browse all skills →"
  - Font: 14px, medium
  - Cor: color-text-muted → color-accent em hover
  - Separados por pipe "|"

Badges de compatibilidade: "Works with Claude, ChatGPT, Gemini, and any AI assistant"
  - Ícones inline 16px + texto 12px, color-text-xmuted
```

#### 1.4.4 Skill Card
```
Layout: vertical flex column
Background: var(--color-surface)
Border: 1px solid var(--color-border)
Border-radius: 12px
Padding: 20px
Transition: border-color 200ms ease, background 200ms ease

Estado hover:
  background: var(--color-surface-2)
  border-color: var(--color-border-hover)
  cursor: pointer

Título: 15px, semibold, color-text-primary, max 2 linhas, overflow: ellipsis
Descrição: 13px, regular, color-text-muted, max 3 linhas, line-clamp: 3
Autor: 12px, color-text-xmuted, flex row com avatar 20px circular
Tags: badges pill, 11px, padding 2px 8px, bg: color-tag-bg, text: color-accent, border-radius: 4px
  gap: 6px, flex wrap

Métricas (views | downloads | uses):
  - Flex row, gap: 16px
  - Ícone 14px + número 12px + label 11px
  - Cor: color-text-xmuted
  - Separados por "|" visual ou gap
  - Alinhado ao bottom do card

Margem top automática entre descrição e métricas (flex-grow: 1 no spacer)
```

#### 1.4.5 Botões (Button System)

| Variante      | Background          | Texto     | Border              | Hover                   |
|---------------|---------------------|-----------|---------------------|-------------------------|
| Primary       | `--color-primary`   | `white`   | none                | bg: `--color-primary-dim` |
| Secondary      | transparent         | `--color-text-primary` | `1px solid --color-border` | bg: `--color-surface` |
| Ghost          | transparent         | `--color-text-muted` | none             | text: `--color-text-primary` |
| Destructive    | `#7F1D1D`           | `#FCA5A5` | none                | bg: `#991B1B`           |

```
Dimensões padrão:
  Height: 40px (md) / 36px (sm) / 48px (lg)
  Padding: 0 16px (md) / 0 12px (sm) / 0 20px (lg)
  Border-radius: 8px
  Font: 14px, weight: 500
  Transition: all 150ms ease
  Letter-spacing: -0.01em
```

#### 1.4.6 Código / Code Blocks
```
Background: #0D0D0F
Border: 1px solid var(--color-border)
Border-radius: 8px
Padding: 16px 20px
Font: Geist Mono, 13px
Line-height: 1.7
Color: #E4E4E7
Syntax highlighting: tema Dracula / One Dark Pro adaptado

Header do code block:
  - Nome do arquivo: 12px, color-text-muted
  - Botão "Copy": 12px, ghost, icon 14px
  - Background: rgba(255,255,255,0.03)
  - Border-bottom: 1px solid var(--color-border)
  - Padding: 8px 16px
```

#### 1.4.7 Tabela de Comparação
```
Background: var(--color-surface)
Border: 1px solid var(--color-border)
Border-radius: 12px
Overflow: hidden

Header row:
  Background: rgba(99,102,241,0.05)
  Font: 13px, medium, color-text-muted
  Padding: 12px 16px

Body rows:
  Font: 14px, color-text-primary
  Padding: 12px 16px
  Border-top: 1px solid var(--color-border)
  Hover: background rgba(255,255,255,0.02)

Ícone ✓ (checkmark): color-success (#22C55E), 16px
Ícone ✗ (cross): color-text-xmuted, 16px
```

#### 1.4.8 Steps / How It Works
```
Layout: 3 colunas com número de passo
Número: 
  - Círculo 32px, border: 1px solid color-border
  - Background: rgba(99,102,241,0.08)
  - Font: 14px, mono, color-accent
  - "Step 1" label acima: 11px uppercase, letter-spacing: 0.1em, color-text-xmuted
  
Linha conectora entre steps:
  - Display: none em mobile
  - Border-top: 1px dashed color-border
  - Position: absolute, top: 16px
```

#### 1.4.9 Tags / Badges de Categoria
```
Pill badge:
  Background: rgba(99,102,241,0.1)
  Border: 1px solid rgba(99,102,241,0.2)
  Color: var(--color-accent)
  Border-radius: 9999px
  Padding: 2px 10px
  Font: 11px, medium

Tag neutra (skills secundárias):
  Background: var(--color-tag-bg)
  Color: var(--color-text-xmuted)
  Border-radius: 4px
  Padding: 2px 8px
  Font: 11px

Tag de categoria clicável (browse):
  Exibe contagem: "Drafting 396 skills"
  Hover: border-color: color-primary
  Transição: 150ms
```

#### 1.4.10 Detail Page de Skill (Anatomia)
```
Layout: 2 colunas (content 70% | sidebar 30%)
Mobile: single column

Left/Main:
  - Breadcrumb: "/" > "Skills" > "Título"
  - H1 do título
  - Autor + data (12px, color-text-muted)
  - Descrição longa (body text)
  - Code block SKILL.md expandido
  - Seção "What's Included" (file tree visual)

Right/Sidebar:
  - Métricas: views | downloads | uses em cards pequenos
  - Metadata: Author, License, Language, Version, Updated
  - Ações: "Try this skill now" (primary button), "Download Skill", "Copy skill link"
  - "Need Help?" link
  - Seção "Contribute": links para GitHub (editar / fork)
```

---

### 1.5 Motion & Microinterações

| Interação              | Duração  | Easing              | Propriedade         |
|------------------------|----------|---------------------|---------------------|
| Card hover             | 200ms    | `ease`              | background, border  |
| Button press           | 150ms    | `ease`              | transform scale(0.97) |
| Nav link hover         | 150ms    | `ease`              | color               |
| Search focus           | 200ms    | `ease`              | border, box-shadow  |
| Tag hover              | 150ms    | `ease`              | border-color        |
| Page transition        | 300ms    | `ease-out`          | opacity, translateY(8px→0) |
| Modal/sheet open       | 250ms    | `cubic-bezier(0.16, 1, 0.3, 1)` | transform, opacity |
| Tooltip appear         | 150ms    | `ease`              | opacity             |

**Regra geral:** Preferir transições de propriedades compostas (`transform`, `opacity`) para performance de GPU. Nunca animar `width`, `height`, `top` diretamente.

---

### 1.6 Responsividade

| Breakpoint | px     | Layout                                |
|------------|--------|---------------------------------------|
| `sm`       | 640px  | Stack mobile base                     |
| `md`       | 768px  | 2 colunas em grid de skills           |
| `lg`       | 1024px | Nav horizontal completa               |
| `xl`       | 1280px | 3 colunas em grid de skills, sidebar na detail page |
| `2xl`      | 1536px | Container centra, limita max-width    |

**Mobile-first:** Todos os componentes partem do mobile e expandem via `min-width` media queries.

---

### 1.7 Iconografia

- **Biblioteca:** `Lucide Icons` (open-source, consistente com estética do site)
- **Tamanhos:** 14px (inline/badge), 16px (nav/body), 20px (hero), 24px (ilustrações de step)
- **Peso visual (strokeWidth):** `1.5px` para look premium / leve
- **Cor:** herda `currentColor` do contexto

Ícones identificados no site:
- Busca (lupa) — search bar
- Link / Chain — "Copy skill link"
- Download — botão de download
- Eye — contagem de views
- Terminal / Code — MCP/API sections
- Shield Check — SOC 2 / compliance badge
- Users — comunidade / Slack

---

### 1.8 Stack de Implementação Estética (State-of-the-Art)

```
Framework UI:      Next.js 15 (App Router) + React 19
Styling:           Tailwind CSS v4 (CSS-first config, novo engine)
Design Tokens:     CSS Custom Properties nativas (sem lib extra)
Tipografia:        next/font com Geist + Geist Mono (Vercel)
Animações:         Framer Motion 11 (layout animations, gestures)
Ícones:            lucide-react
Dark Mode:         CSS class strategy (.dark) — sem flash via cookie/SSR
Acessibilidade:    Radix UI Primitives (Dialog, Tooltip, Select, etc.)
Componentes base:  shadcn/ui v2 (sobre Radix + Tailwind)
Imagens:           next/image com blur placeholder
OG Images:         @vercel/og (Edge Runtime)
Linting estético:  ESLint + Prettier + prettier-plugin-tailwindcss
```

---

## 2. Checklist de Fidelidade Visual

- [ ] Dark mode como único tema (sem light mode por padrão)
- [ ] Fonte Geist carregada via next/font (zero layout shift)
- [ ] Cores via CSS custom properties (não hardcoded em classes)
- [ ] Cards com hover state em border + background
- [ ] Search bar com focus ring indigo
- [ ] Code blocks com syntax highlighting e botão copy
- [ ] Stat badge "883+" acima do H1 com borda indigo translúcida
- [ ] Nav sticky com glassmorphism backdrop-blur
- [ ] Tags/badges em pill e retangulares conforme contexto
- [ ] Métricas de skill (views / downloads / uses) com ícones
- [ ] Skeleton loading states para cards (evitar CLS)
- [ ] Tabela de comparação (MCP vs File-Based) estilizada
- [ ] Breadcrumb na detail page
- [ ] Layout 2-col na detail page (content + sidebar)
- [ ] Responsive: 1 → 2 → 3 colunas no grid de skills
