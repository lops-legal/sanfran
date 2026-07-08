# Arquitetura e Referências do Sanfran.md

Este documento consolida as diretrizes essenciais de frontend, backend e domínio de negócio extraídas dos rascunhos anteriores, servindo como a principal fonte da verdade técnica.

## 1. Frontend e Design System
O visual da plataforma segue um **Dark minimalismo com acentos funcionais**, inspirado em referências como `agentskill.sh` e `SkillsMP`.

### Cores e Tipografia
- **Fundo**: Base quase-preta (`#0a0a0a`) com cards levemente mais claros (`#161618`).
- **Acentos**: Usados primariamente para informação (Laranja/Coral para destaque, Verde/Amarelo/Vermelho para scores e status).
- **Tipografia**: Sem serifa (Inter, Geist ou similar), neutra e limpa.

### Componentes Principais
- **SkillCard**: Exibe o título, autor, descrição curta e o **Dual Score** (Qualidade Jurídica e Segurança).
- **Navegação**: Busca global focada, filtros por Vertical Jurídica (ex: Trabalhista, LGPD, Regulatório) e abas temporais (Recentes, Populares).
- **Skill Detail & Playground**: Página específica da skill com visualização do arquivo markdown gerado e um ambiente de testes interativo (Playground) para simular casos práticos antes da instalação.

---

## 2. Backend (Lex) e Pipeline de Grafos
O backend utiliza **FastAPI** e **LangGraph** (com Postgres para checkpointing) modelado como um pipeline iterativo. 

### Modos de Operação
1. **Modo Interativo (Turnos com o Usuário)**: A coleta de informações (elicitação) acontece por turnos. O modelo não pergunta tudo de uma vez; ele avalia o que já foi dito e formula perguntas estruturadas.
2. **Modo Iterativo (Loop Interno)**: Após coletar o contexto, o LLM entra em um loop interno fechado de geração, auto-crítica (`self_review_loop`), testes e refinamento, antes de mostrar o rascunho ao usuário.

### Agente QA e Rubrica
Existe um Agente de QA dedicado (separado da redação) que avalia a skill em 4 dimensões (0-100 pontos):
- **Descoberta (Discovery)**: Nome e contexto de uso bem definidos.
- **Estrutura (Structure)**: Validação determinística do YAML e cabeçalhos.
- **Implementação (Implementation)**: Instruções verificáveis e em passos claros.
- **Especialização (Specialization)**: Profundidade do conhecimento jurídico embarcado (citações a leis, entendimento de armadilhas, etc).

---

## 3. Conhecimento Jurídico (Domínio)
O projeto carrega profundidade normativa brasileira (como a Lei de Propriedade Industrial - Lei nº 9.279, Direito Autoral, Antitruste, LGPD, etc). A geração e avaliação das skills (`meta-skill`) é avaliada pelo preenchimento correto dos contextos normativos específicos ao invés de sugestões genéricas.
