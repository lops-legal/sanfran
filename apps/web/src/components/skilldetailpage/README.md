# SkillDetailPage — redesign

## O que mudou

**Removido**
- Simulador de Agente Jurídico (Playground) — todo o bloco, estado (`testInput`, `testResult`, `simulating`, `handleSimulate`) e a chamada a `/api/lex-chat` foram retirados.
- Aba "Metadados (JSON)" — não é mais exposta no front-end.
- Sistema de abas do lado direito (SKILL.md / Como Usar / Metadados) — reduzido a um único card, sem cliques necessários.

**Reestruturado**
- O lado esquerdo deixou de usar abas (Visão Geral / Qualidade / Segurança) que escondiam conteúdo. Agora são **seções sempre visíveis**, empilhadas, com uma barra de navegação rápida (pills) que dá scroll suave até a seção — nada fica escondido atrás de clique.
- "Como Usar" (antes uma aba isolada à direita) virou uma seção própria (`IntegrationSection`), organizada junto com Visão Geral / Qualidade / Segurança no fluxo da esquerda, como você pediu.
- O card do **SKILL.md** agora é o elemento de destaque da página: coluna direita mais larga (`lg:col-span-7` vs `lg:col-span-5` da esquerda), com moldura de "janela de terminal" (dots, nome do arquivo, contagem de linhas), tira de metadados extraída do frontmatter (`name`, `language`, `description`) e fica `sticky` ao rolar — sempre visível enquanto se navega pelas seções da esquerda.

**Visualização do SKILL.md**
- Antes: texto cru em `<pre>`.
- Agora: `markdownRenderer.tsx` faz um parse leve (sem dependências novas) do frontmatter e do corpo — títulos, subtítulos com marcador lateral, listas, checklists (com estado marcado/desmarcado), blocos de código e negrito/itálico/links renderizam com hierarquia visual real.

**Cards de Qualidade e Segurança**
- Qualidade: os dois scores principais (Técnico / OAB) agora usam um medidor radial (conic-gradient), e cada critério do breakdown ganhou ícone semântico (Scale, Target, FileCheck, ShieldCheck, RefreshCw) e barra de progresso colorida.
- Segurança: os critérios são agrupados por severidade (Alto/Médio/Baixo) com chips de contagem no topo, em vez de uma lista plana.

## Arquivos

```
skilldetailpage/
├── index.tsx              # página principal — layout, hero, seções, quick-nav
├── OverviewSection.tsx     # substitui OverviewTab.tsx
├── QualitySection.tsx      # substitui QualityTab.tsx
├── SecuritySection.tsx     # substitui SecurityTab.tsx
├── IntegrationSection.tsx  # novo — conteúdo que antes era a aba "Como Usar"
├── SkillMarkdownCard.tsx   # novo — card destacado com o SKILL.md renderizado
└── markdownRenderer.tsx    # novo — parser/renderer de markdown sem dependências externas
```

## Como aplicar

1. Substitua o conteúdo da pasta `skilldetailpage/` do seu projeto pelos arquivos aqui.
2. Pode apagar `OverviewTab.tsx`, `QualityTab.tsx` e `SecurityTab.tsx` antigos — foram renomeados/substituídos.
3. Nenhuma dependência nova é necessária (nada de `react-markdown`); os ícones usados já vêm do `lucide-react`, que o projeto já usa.
4. Os tipos (`LegalSkill`, `SecurityCriterion`) e os imports (`supabaseAdapter`, `skillMapper`, `AuthContext`) permanecem os mesmos caminhos do projeto original — nenhuma mudança de contrato de dados foi necessária.

## Observação

O botão "Editar" continua com o `alert` de placeholder — não foi alterado porque não fazia parte do escopo pedido (simulador, metadados JSON, navegação por abas e visualização do SKILL.md).
