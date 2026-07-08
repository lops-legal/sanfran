# Lex Backend

Este repositório contém o **backend** do agente **Lex**. Ele combina:

* **FastAPI** – API HTTP com rotas para iniciar/continuar entrevistas, criar e buscar skills, gerar casos de teste e rodar a avaliação de qualidade.
* **LangGraph** – pipeline “gasoduto” que orquestra os nós de entrevista, geração de skill, auto‑review, testes, QA e persistência.
* **Adapters** – `MockLLMAdapter` (uso padrão) e `RealLLMAdapter` (conecta ao provedor GPT‑OSS‑120B via chave de API).
* **SkillStorage** – grava o SKILL.md em disco local (`skills_repo/`).
* **QA Checker** – wrapper que executa o script externo `agentskill_quality.sh` (fork do `agentskill.sh`).
* **Utilidades** – contagem aproximada de tokens, validador YAML, verificador de caminhos Windows, logger JSON.

A estrutura de pastas está organizada para evitar conflitos futuros e facilitar a expansão.
