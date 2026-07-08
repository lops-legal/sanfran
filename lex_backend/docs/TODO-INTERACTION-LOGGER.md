# TODO – Interaction Logger

* **Objetivo**: Registrar cada troca de mensagens (usuário, assistente, tool) com contagem de tokens e timestamps.
* **Implementação atual**: usamos o modelo ``services.db.models.LexInteraction`` com SQLite.
* **Passos futuros**:
  1. Quando o backend for migrado para PostgreSQL, a mesma tabela será usada sem alterações.
  2. Criar função utilitária ``log_interaction(session_id: str, role: str, content: str)`` que:
     - calcula tokens via ``utils.token_counter.approximate_token_count``;
     - insere o registro via SQLAlchemy session.
  3. Chamar ``log_interaction`` nos endpoints da API (por ex., ao receber uma pergunta em ``/interview/continue``) e nos nós do grafo que interagem com o LLM.
  4. Para fallback (sem DB), gravar linhas JSON em ``logs/interaction.log`` (arquivo de texto) usando ``utils.logger.json_log``.
* **Exemplo de uso**:
  ```python
  from services.db.session import get_db
  from services.db.models import LexInteraction
  from utils.token_counter import approximate_token_count

  def log_interaction(session_id, role, content):
      with next(get_db()) as db:
          db.add(
              LexInteraction(
                  session_id=session_id,
                  role=role,
                  tokens=approximate_token_count(content),
              )
          )
          db.commit()
  ```
* **Quando concluído**: o grafo poderá consultar estatísticas de custo (tokens) e a equipe terá audit trail completo.
