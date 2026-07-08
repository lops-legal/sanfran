# Sanfran.md – Plataforma Jurídica de Conhecimento

## Visão geral rápida

- **Skills jurídicas organizadas** – mais de 800 skills estruturadas por áreas de direito, prontas para uso em consultas e automação.
- **Segurança de ponta** – protegem‑se as skills com o framework aberto de cibersegurança *Legal‑Shield*, que inclui auditoria automatizada, controle de acesso por papéis e assinatura de integridade.
- **Gestão aberta de conhecimento** – a plataforma funciona como um hub colaborativo onde usuários podem publicar, versionar e descobrir skills públicas ou privadas.
- **Integração via MCP** – plug‑in único (MCP) conecta qualquer agente de IA a mais de 900 skills usando busca semântica e pontuação de qualidade, garantindo que o agente acesse a skill mais relevante sem sobrecarga de chamadas.

---

### 1️⃣ Skills Jurídicas Organizadamente

- **Catálogo navegável** por tema, jurisdição e nível de detalhamento.
- **Meta‑dados ricos**: tags, nível de confiança, data de revisão e direitos de uso.
- **Exemplo de uso**: `consultar('contrato de locação')` retorna a skill completa com cláusulas padrão e checklist de validade.

---

### 2️⃣ Segurança Baseada em Framework Aberto

- **Legal‑Shield** verifica vulnerabilidades, controla permissões (`admin`, `editor`, `leitor`) e firma hash SHA‑256 de cada skill.
- **Auditoria contínua**: logs de acesso e alterações, com alertas em tempo real.
- **Compliance**: compatível com LGPD/GDPR para anonimização de dados sensíveis.

---

### 3️⃣ Plataforma Aberta de Gestão de Conhecimento

- **Contribuição comunitária**: publique skills via UI ou CLI, versionamento Git‑like.
- **Descoberta inteligente**: filtros por tag, popularidade e avaliação da comunidade.
- **Export/Import**: formatos JSON, Markdown e OpenAPI para integração com outros sistemas.

---

### 4️⃣ Integração via MCP (Multi‑Channel Plugin)

- **Plug‑in único** para conectar agentes como Claude, GPT‑4, LLaMA, etc.
- **Busca semântica** usando embeddings pgvector + pontuação de qualidade (relevância + confiança).
- **Fluxo simplificado**: `agent.runSkill('nome_da_skill')` — o agente não precisa percorrer o catálogo inteiro, o MCP entrega a melhor skill em milissegundos.
- **Privacidade**: skills privadas são resolvidas localmente; somente o hash da skill é enviado ao servidor para avaliação de qualidade.

---

### 5️⃣ Demonstrações Rápidas

| Demonstração | O que mostra | Como experimentar |
|--------------|--------------|-------------------|
| **Busca de skill pública** | Encontrar a skill “Direito do Consumidor – Reclamação” | Clique em **Explorar** → digite *consumidor* → veja o card da skill |
| **Acesso a skill privada** | Consultar sua cláusula de contrato de prestação de serviços | Faça login → painel **Minhas Skills** → selecione a skill → use o botão **Usar com IA** |
| **Integração MCP** | Agente responde a uma pergunta usando a skill mais relevante | Abra o console (botão ☁️) → pergunte *“Qual a multa por atraso de pagamento?”* → resposta vem da skill classificada como top‑rank |
| **Relatório de segurança** | Visualizar auditoria de integridade de uma skill | No card da skill, clique **Auditar** → veja hash, última verificação e alertas |

---

## Próximos passos

1. **Experimente** a barra de busca na página inicial.
2. **Crie** sua primeira skill privada via **Novo** → preencha metadados → publique.
3. **Integre** seu agente de IA favorito instalando o plugin MCP (`npm i @sanfran/mcp`).

> **Sanfran.md** – Onde o conhecimento jurídico encontra a inteligência artificial de forma segura, aberta e intuitiva.

---

## Posicionamento e Narrativas de Marca

| Contexto | Slogan / frase curta | Por que funciona |
|---|---|---|
| **Gestão de conhecimento jurídico para sua IA** | “Alimente sua IA com a expertise jurídica que nunca dorme.” | Aponta para a *persistência* do conhecimento e o benefício direto da IA. |
| **Gestão de conhecimento jurídico para sua empresa** | “Transforme o acúmulo de normas em inteligência operacional.” | Mostra que a plataforma converte regras em ação prática para a empresa. |
| **Mais habilidades, mais cultura** | “Expanda o repertório da sua equipe com milhares de skills jurídicas.” | Enfatiza a riqueza do catálogo e o efeito multiplicador nas competências. |
| **Cultura e conhecimento persistente** | “Um plug‑in, mil habilidades: conhecimento jurídico sempre à mão.” | Reforça a simplicidade do plug‑in e a disponibilidade contínua. |
| **Segurança e confiança** | “Legal‑Shield protege cada skill, garantindo integridade e compliance.” | Destaca o diferencial de segurança do framework aberto. |
| **Integração inteligente** | “Conecte agentes de IA ao seu repositório jurídico em milissegundos.” | Foca na rapidez e na fluidez da integração via MCP. |
| **Plataforma aberta** | “Colabore, publique, evolua – o futuro do direito em código aberto.” | Incentiva a colaboração e a transparência da comunidade. |
| **Acesso simplificado** | “Um clique, uma skill: tudo o que seu agente precisa, sem sobrecarga.” | Ressalta a usabilidade e a economia de chamadas ao agente. |
| **Valor de negócio** | “Reduza risco, economize tempo e aumente a qualidade das decisões jurídicas.” | Conecta diretamente ao ROI da solução. |
| **Inovação jurídica** | “Do contrato ao litígio, a IA recebe o melhor do direito em um só plug‑in.” | Aborda a amplitude de casos de uso. |

## Proposta de Redesign da Página Inicial (Home)

### Objetivo
Criar uma página de entrada clara, visualmente atraente e focada em conversão: orientar rapidamente o visitante jurídico a encontrar, entender e usar as skills.

### Estrutura sugerida (componentes React)
1. **Hero + Busca** – título, subtítulo, barra de busca centralizada, banner de total de skills (dados dinâmicos).
2. **Benefícios em blocos (4‑colunas)** – ícones + texto curto: "Skills organizadas", "Segurança Legal‑Shield", "Plataforma aberta" e "Integração MCP".
3. **Como Funciona (3‑passos)** – cards numerados com animação sutil (`framer‑motion`) e micro‑interações ao hover.
4. **Skills em Destaque** – carrossel horizontal (ex.: `react‑slick`) mostrando 3‑5 skills recentes/populares.
5. **Chamada à Ação (CTA)** – botão destacado "Começar agora" que redireciona para `/skills` ou abre o modal de criação.
6. **Rodapé informativo** – links de documentação, termos, política de privacidade e contato.

### Layout visual (Tailwind CSS)
```tsx
<div className="bg-gradient-to-b from-primary/5 via-background to-background min-h-screen">
  {/* Hero */}
  <section className="py-20 text-center">
    <h1 className="text-5xl font-bold mb-4">Skills jurídicas para agentes de IA</h1>
    <p className="text-xl text-muted mb-8">Organizadas, seguras e prontas para integrar ao seu fluxo.</p>
    <SearchBar />
    <p className="mt-2 text-sm text-muted">
      {stats.totalPublished}+ skills disponíveis
    </p>
  </section>
  {/* Benefits */}
  <section className="grid md:grid-cols-4 gap-6 py-12 px-4 max-w-7xl mx-auto">
    <Benefit icon={Library} title="Skills organizadas" desc=">800 skills por área do direito" />
    <Benefit icon={Shield} title="Segurança Legal‑Shield" desc="Auditoria, controle de acesso e hash" />
    <Benefit icon={Globe} title="Gestão aberta" desc="Contribua, versiona e descubra" />
    <Benefit icon={Plug} title="Integração MCP" desc="Busca semântica, qualidade e privacidade" />
  </section>
  {/* How It Works */}
  <section className="py-16 bg-card/20">
    <h2 className="text-3xl font-semibold text-center mb-8">Como funciona</h2>
    <Steps>
      <Step num={1} title="Encontre" desc="Busque ou navegue na biblioteca" />
      <Step num={2} title="Copie" desc="Obtenha o prompt da skill" />
      <Step num={3} title="Use" desc="Cole no seu agente de IA" />
    </Steps>
  </section>
  {/* Featured */}
  <section className="py-16">
    <h2 className="text-3xl font-semibold text-center mb-6">Skills em destaque</h2>
    <FeaturedCarousel />
    <div className="text-center mt-8">
      <button className="px-8 py-2 rounded-full bg-primary text-white hover:bg-primary/80 transition">
        Ver todas as skills
      </button>
    </div>
  </section>
  {/* CTA */}
  <section className="py-12 bg-primary text-white text-center">
    <h3 className="text-2xl font-bold mb-4">Pronto para começar?</h3>
    <button onClick={() => navigate('/skills')} className="px-6 py-2 rounded-full bg-white text-primary font-medium hover:bg-gray-100">
      Começar agora
    </button>
  </section>
  <Footer />
</div>
```

### Cue‑points de usabilidade
- **Responsividade**: mobile‑first, colunas colapsam para 1 coluna em <640 px.
- **Acessibilidade**: `aria‑label` nos botões, foco visível (`focus-visible:ring-2`).
- **Performance**: lazy‑load do carousel e das imagens; `React.memo` nos componentes `Benefit` e `Step`.
- **Micro‑interações**: `whileHover={{ scale: 1.05 }}` com `framer‑motion` nos cards de passos e nas thumbnails das skills.
- **SEO**: meta‑tags (`title`, `description`) e dados estruturados `JSON‑LD` para “WebPage” e “FAQPage”.

### Próximas tarefas de implementação
1. Criar componentes `SearchBar`, `Benefit`, `Steps`, `Step`, `FeaturedCarousel` e `Footer` em `src/components/home/`.
2. Integrar `useCatalogStats` para preencher contagem dinâmica de skills.
3. Configurar lazy‑loading (`React.lazy`, `Suspense`) para o carousel.
4. Adicionar testes com **React Testing Library** para garantir que a barra de busca redirecione corretamente.
5. Atualizar o arquivo de rotas (`src/App.tsx`) para apontar `/` ao novo `HomePage`.

Com essa proposta, a página inicial ganha clareza, foco nos benefícios principais e demonstrações rápidas, facilitando a adoção tanto por juristas quanto por desenvolvedores que integram agentes de IA.


### Objetivo
Criar uma página de entrada clara, visualmente atraente e focada em conversão: orientar rapidamente o visitante jurídico a encontrar, entender e usar as skills.

### Estrutura sugerida (componentes React)
1. **Hero + Busca** – título, subtítulo, barra de busca centralizada, banner de total de skills (dados dinâmicos).
2. **Benefícios em blocos (4‑colunas)** – ícones + texto curto: "Skills organizadas", "Segurança Legal‑Shield", "Plataforma aberta" e "Integração MCP".
3. **Como Funciona (3‑passos)** – cards numerados com animação sutil (`framer‑motion`) e micro‑interações ao hover.
4. **Skills em Destaque** – carrossel horizontal (ex.: `react‑slick`) mostrando 3‑5 skills recentes/populares.
5. **Chamada à Ação (CTA)** – botão destacado "Começar agora" que redireciona para `/skills` ou abre o modal de criação.
6. **Rodapé informativo** – links de documentação, termos, política de privacidade e contato.

### Layout visual (Tailwind CSS)
```tsx
<div className="bg-gradient-to-b from-primary/5 via-background to-background min-h-screen">
  {/* Hero */}
  <section className="py-20 text-center">
    <h1 className="text-5xl font-bold mb-4">Skills jurídicas para agentes de IA</h1>
    <p className="text-xl text-muted mb-8">Organizadas, seguras e prontas para integrar ao seu fluxo.</p>
    <SearchBar />
    <p className="mt-2 text-sm text-muted">
      {stats.totalPublished}+ skills disponíveis
    </p>
  </section>
  {/* Benefits */}
  <section className="grid md:grid-cols-4 gap-6 py-12 px-4 max-w-7xl mx-auto">
    <Benefit icon={Library} title="Skills organizadas" desc=">800 skills por área do direito" />
    <Benefit icon={Shield} title="Segurança Legal‑Shield" desc="Auditoria, controle de acesso e hash" />
    <Benefit icon={Globe} title="Gestão aberta" desc="Contribua, versiona e descubra" />
    <Benefit icon={Plug} title="Integração MCP" desc="Busca semântica, qualidade e privacidade" />
  </section>
  {/* How It Works */}
  <section className="py-16 bg-card/20">
    <h2 className="text-3xl font-semibold text-center mb-8">Como funciona</h2>
    <Steps>
      <Step num={1} title="Encontre" desc="Busque ou navegue na biblioteca" />
      <Step num={2} title="Copie" desc="Obtenha o prompt da skill" />
      <Step num={3} title="Use" desc="Cole no seu agente de IA" />
    </Steps>
  </section>
  {/* Featured */}
  <section className="py-16">
    <h2 className="text-3xl font-semibold text-center mb-6">Skills em destaque</h2>
    <FeaturedCarousel />
    <div className="text-center mt-8">
      <button className="px-8 py-2 rounded-full bg-primary text-white hover:bg-primary/80 transition">
        Ver todas as skills
      </button>
    </div>
  </section>
  {/* CTA */}
  <section className="py-12 bg-primary text-white text-center">
    <h3 className="text-2xl font-bold mb-4">Pronto para começar?</h3>
    <button onClick={() => navigate('/skills')} className="px-6 py-2 rounded-full bg-white text-primary font-medium hover:bg-gray-100">
      Começar agora
    </button>
  </section>
  <Footer />
</div>
```

### Cue‑points de usabilidade
- **Responsividade**: mobile‑first, colunas colapsam para 1 coluna em <640 px.
- **Acessibilidade**: `aria‑label` nos botões, foco visível (`focus-visible:ring-2`).
- **Performance**: lazy‑load do carousel e das imagens; `React.memo` nos componentes `Benefit` e `Step`.
- **Micro‑interações**: `whileHover={{ scale: 1.05 }}` com `framer‑motion` nos cards de passos e nas thumbnails das skills.
- **SEO**: meta‑tags (`title`, `description`) e dados estruturados `JSON‑LD` para “WebPage” e “FAQPage”.

### Próximas tarefas de implementação
1. Criar componentes `SearchBar`, `Benefit`, `Steps`, `Step`, `FeaturedCarousel` e `Footer` em `src/components/home/`.
2. Integrar `useCatalogStats` para preencher contagem dinâmica de skills.
3. Configurar lazy‑loading (`React.lazy`, `Suspense`) para o carousel.
4. Adicionar testes com **React Testing Library** para garantir que a barra de busca redirecione corretamente.
5. Atualizar o arquivo de rotas (`src/App.tsx`) para apontar `/` ao novo `HomePage`.

Com essa proposta, a página inicial ganha clareza, foco nos benefícios principais e demonstrações rápidas, facilitando a adoção tanto por juristas quanto por desenvolvedores que integram agentes de IA.
