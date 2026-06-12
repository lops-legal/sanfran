# Design System — Sanfran.md Marketplace
## Baseado em agentskill.sh (visual) + SkillsMP (estrutura de página)

---

## Parte 1 — Sistema visual extraído do agentskill.sh

### Classificação do estilo

Não é brutalismo (que implicaria bordas grossas, sombras duras tipo "offset shadow", tipografia pesada/condensada e quebra deliberada de grid). O que o agentskill.sh usa é:

**Dark minimalismo com acentos cromáticos funcionais** — fundo quase-preto, cards de baixo contraste entre si, tipografia neutra/sem serifa, e cor reservada quase exclusivamente para *badges de status/score*. A cor não é decorativa, é informacional. O laranja/coral aparece como cor de destaque (links, hover, badge de alerta), não como base.

Isso é o que dá a sensação "moderna": **hierarquia por contraste de luminância + cor como dado**, não como ornamento.

### Paleta de cores

| Token | Valor aproximado | Uso |
|---|---|---|
| `--bg-base` | `#0a0a0a` / `#0d0d0f` | Fundo da página |
| `--bg-card` | `#161618` / `#18181b` | Fundo dos cards (levemente mais claro que o base) |
| `--border-card` | `#27272a` (cinza escuro sutil) | Borda 1px dos cards, quase imperceptível |
| `--border-card-highlight` | `#e85d3d` / coral-laranja | Borda do card em destaque/hover (visível no card "interface de controle...") |
| `--text-primary` | `#fafafa` / branco quase puro | Títulos das skills |
| `--text-secondary` | `#a1a1aa` (cinza médio) | Descrições, texto de corpo |
| `--text-muted` | `#71717a` (cinza escuro) | Labels secundárias, "garra aberta/" prefix |
| `--accent-orange` | `#f97316` / `#fb923c` | Logo, links de destaque, badge de warning |
| `--accent-red` | `#ef4444` | Badge de score crítico (ex: "48" em vermelho) |
| `--accent-green` | `#22c55e` / `#16a34a` | Badge de score alto/seguro (ex: "100", "95") |
| `--accent-yellow` | `#eab308` / `#ca8a04` | Badge de score médio (ex: "75", "67") |
| `--accent-star` | `#facc15` (amarelo-dourado) | Ícone de avaliação por estrelas |

### Tipografia

- **Família**: sans-serif neutra, geométrica — estilo Inter, Geist, ou system-ui. Sem serifa em nenhum elemento.
- **Título do card**: peso bold/semibold, tamanho ~16-18px, cor `--text-primary`. Truncamento com ellipsis quando o nome é longo (ex: "atualização do chang...", "interface de controle...")
- **Prefixo do owner** ("garra aberta/"): peso regular, cor `--text-muted`, mesmo tamanho ou levemente menor que o título, na mesma linha
- **Descrição**: peso regular, tamanho ~14px, cor `--text-secondary`, 2 linhas com truncamento (line-clamp: 2)
- **Badges/scores**: peso semibold/mono, tamanho pequeno (~12-13px) — números em destaque dentro de pills coloridas

### Estrutura do card (anatomia)

```
┌─────────────────────────────────────────────────────┐
│ [🔶icon] owner/  **Nome da Skill...**    ⭐5.0 (1)  ⑂374.2mil │  ← header
│                                                       │
│ Descrição em 2 linhas com truncamento por           │  ← corpo
│ ellipsis ao final da segunda linha...                │
│                                                       │
│ [tag1] [tag2]              [🔧 92] [✓ 100]          │  ← footer
└─────────────────────────────────────────────────────┘
```

Elementos do header (esquerda → direita):
1. **Ícone/avatar do criador** — pequeno, quadrado com cantos arredondados (~24x24px), cor de fundo vibrante (vermelho no exemplo) com emoji/ícone
2. **owner/** — texto muted, seguido imediatamente por
3. **Nome da skill** — bold, truncado com `...` se necessário
4. **Rating** (condicional) — estrela amarela + número + contagem entre parênteses, só aparece se a skill tem avaliações
5. **Contador de "stars"/popularidade** — ícone de fork/estrela + número formatado (374,2 mil) em pill cinza, alinhado à direita

Elementos do corpo:
- Descrição truncada em exatamente 2 linhas, `overflow: hidden`, `text-overflow: ellipsis`

Elementos do footer (distribuição: tags à esquerda, scores à direita):
- **Tags/categorias** — pills cinza-escuro com texto cinza-claro, cantos arredondados (~6px), padding horizontal generoso (ex: "código", "garra aberta", "Claude")
- **Score 1** (ícone de "ferramenta"/wrench ou similar + número) — pill com cor variável conforme valor:
  - Verde (`100`, `92`) — score alto
  - Amarelo (`75`, `67`) — score médio
- **Score 2** (ícone de check circular + número) — pill com cor variável:
  - Verde (`100`, `99`, `95`) — aprovado/alto
  - Vermelho (`48`) — reprovado/crítico

### Estados visuais

- **Card padrão**: borda quase invisível (`--border-card`), fundo `--bg-card`
- **Card em destaque/hover**: borda colorida visível em coral/laranja (`--border-card-highlight`), título também muda para coral — visível no card "interface de controle..." do exemplo, sugerindo que é o card sob hover ou um card "em destaque editorial"

### Grid

- 3 colunas em desktop, gap consistente (~16px) entre cards
- Cards de altura aproximadamente igual (mesmo que o conteúdo varie, a altura é normalizada — provavelmente `min-height` fixo com truncamento de texto)
- Responsivo: provavelmente 1 coluna em mobile, 2 em tablet (padrão comum, não visível na imagem mas inferível)

### Iconografia

- Ícones de linha fina (outline), não preenchidos — estilo Lucide/Feather/Heroicons outline
- Ícone de "fork" ou "estrela" para contagem de uso/popularidade
- Ícone de "wrench"/ferramenta para o primeiro score (provavelmente "Quality"/implementação)
- Ícone de check circular para o segundo score (provavelmente "Security"/aprovação)
- Ícone de relógio/alerta para scores críticos em vermelho (visível no "48")

---

## Parte 2 — Estrutura de página inspirada no SkillsMP, adaptada ao Sanfran.md

Sequência de seções da home da marketplace, na ordem solicitada:

### 1. Cabeçalho (Header)
- Logo Sanfran.md à esquerda
- Navegação principal: Marketplace, Lex, Minha Organização, Docs
- Seletor de idioma (PT-BR padrão, estrutura pronta para outros)
- Toggle dark/light
- Botão de conta/login à direita

### 2. Hero + Busca
- Título de proposta de valor (ex: "Skills jurídicas para o Direito brasileiro")
- Contador de catálogo (ex: "X skills publicadas")
- Barra de busca central, proeminente, com atalho de teclado (`/`)
- Bloco de compatibilidade — ícones de Claude, ChatGPT, Cursor, etc. (interoperabilidade via `agentskills.io`)

### 3. Navegação por área do Direito (equivalente a "Navegue por ocupação")
- Cards/blocos por vertical jurídica, cada um com:
  - Nome da vertical (ex: Trabalhista, LGPD, Regulatório, Tributário, Processos)
  - Contador de skills
  - Descrição editorial curta (1 frase, estilo Agensi) explicando o que a vertical cobre
- Grid de cards, não lista — visualmente similar aos cards de "Occupations" do SkillsMP mas com identidade jurídica brasileira

### 4. Navegação por categoria/tipo de uso (equivalente a "Navegue por categoria")
- Categorias transversais que cruzam verticais — ex: "Revisão de Contratos", "Triagem de Demandas", "Briefing Regulatório", "Resposta a Notificações", "Compliance"
- Cada categoria com contador
- Diferença da seção 3: seção 3 é "área do Direito", seção 4 é "tipo de tarefa" — um usuário pode entrar por qualquer um dos dois eixos

### 5. "Explore o ecossistema por área e criador" (narrativa em 3 passos)
Adaptação do bloco do SkillsMP ("Map a field → Follow creators → Search with sources"), reescrito para o contexto jurídico:

- **Passo 1 — Mapeie sua área**: navegue pelas verticais jurídicas para entender quais skills existem para Trabalhista, LGPD, Regulatório, etc.
- **Passo 2 — Acompanhe criadores**: veja perfis de advogados/departamentos jurídicos que publicam skills, suas skills mantidas e atividade recente
- **Passo 3 — Avalie com os scores**: use o Quality Score (dimensões jurídicas) e o Security Score (AST10) para decidir o que adotar

Cada passo como bloco numerado com ícone + texto curto, lado a lado ou em coluna.

### 6. Feed de skills com scroll infinito
- Grid de cards (3 colunas desktop, conforme Parte 1)
- Carregamento incremental ao rolar (infinite scroll), com skeleton loaders durante o carregamento
- Toggle Grid/List view (padrão agentskill.sh)
- Filtros persistentes (sticky) acima do grid: vertical, categoria, score mínimo, visibilidade (pública/org), ordenação (recentes/populares/melhor avaliadas)
- Abas de ordenação temporal: "Recentes", "Em alta", "Destaques"

### 7. FAQ pedagógico (rodapé da home)
- Adaptado do SkillsMP: "O que é uma skill jurídica?", "Como instalo/conecto no Claude/ChatGPT?", "É seguro?", "Como publico minha própria skill?", "Sou advogado, preciso saber programar?"
- Disclaimer de transparência sobre curadoria

### 8. Footer
- Links institucionais, redes, documentação, termos/privacidade

---

## Parte 3 — O módulo de pontuação (dual score) adaptado

### Estrutura atual do agentskill.sh (referência)
- **Score 1** (ícone wrench, cores verde/amarelo/vermelho): "Quality Score" — breakdown em Discovery/Implementation/Structure/Expertise (0-3 cada)
- **Score 2** (ícone check, cores verde/vermelho): "Security Score" — contagem de issues por severidade

### Proposta para o Sanfran.md

Mantém o **padrão visual de dual pill colorida** no card (reconhecível, testado), mas com semântica jurídica:

**Pill 1 — Score de Qualidade Normativa** (ícone: balança ou documento)
Breakdown nas 5 dimensões já propostas na meta-skill:
- Precisão Normativa (citações corretas de CDC/CLT/CPC/LGPD/súmulas)
- Especificidade (contexto/setor definido, não genérico)
- Padrão de Entrega (formato de saída verificável)
- Limites de Autonomia (definidos claramente)
- Atualização (data da última revisão vs. mudanças normativas conhecidas)

Cor: verde (alta), amarelo (média), vermelho (baixa) — mesma lógica de threshold do original.


## Parte 4 — Componentes a construir (checklist de implementação)

- [ ] `SkillCard` — componente de card conforme anatomia da Parte 1, com props para dual score, tags, rating, contador
- [ ] `ScoreBadge` — pill colorida reutilizável (ícone + número + cor por threshold), usada tanto no card quanto na página de detalhe
- [ ] `VerticalGrid` — grid de cards de verticais jurídicas com contador e descrição editorial
- [ ] `CategoryGrid` — grid de categorias transversais (tipo de tarefa)
- [ ] `EcosystemSteps` — bloco narrativo em 3 passos (mapear/acompanhar/avaliar)
- [ ] `InfiniteSkillFeed` — grid com scroll infinito, skeleton loading, toggle grid/list
- [ ] `FilterBar` — barra de filtros sticky (vertical, categoria, score, visibilidade, ordenação)
- [ ] `SkillDetailPage` — página com preview do SKILL.md, dual score expandido, playground de casos de teste, bloco de instalação/API
- [ ] `FAQAccordion` — componente de FAQ colapsável
- [ ] Tema dark/light com tokens de cor da Parte 1 como variáveis CSS

---

## Referências visuais diretas
- Cards analisados: imagem fornecida (agentskill.sh, busca "garra aberta"/"openclaw")
- Estrutura de página: https://skillsmp.com/
- Página de detalhe com dual score: https://agentskill.sh/@openclaw/spike