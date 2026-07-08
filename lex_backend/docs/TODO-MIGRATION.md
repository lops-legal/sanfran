# TODO – Migração para PostgreSQL

1. Definir a variável de ambiente ``DATABASE_URL`` com a URL do PostgreSQL, ex.:
   ```
   export DATABASE_URL=postgresql://lex_user:senha@localhost:5432/lex_db
   ```
2. Instalar ``psycopg2-binary`` (ou ``psycopg``) no ``requirements.txt`` e rodar ``pip install -r requirements.txt``.
3. Na primeira vez, criar o esquema com Alembic:
   ```bash
   alembic upgrade head
   ```
   Isso executa o script ``services/db/migrations/versions/0001_initial.py`` que cria as tabelas ``lex_sessions`` e ``lex_interactions``.
4. Caso queira versionar novas alterações, usar:
   ```bash
   alembic revision --autogenerate -m "descrição da mudança"
   alembic upgrade head
   ```
5. O módulo ``services.db.session`` já lê ``DATABASE_URL`` e cria o ``engine`` adequado, portanto basta reiniciar a aplicação.

**Observações**
* Enquanto o PostgreSQL ainda não estiver disponível, o código continua usando SQLite (``sqlite:///lex.db``) como fallback.
* Não esquecer de habilitar a extensão ``uuid-ossp`` se decidir usar UUIDs como PKs.
