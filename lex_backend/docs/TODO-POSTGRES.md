# TODO: PostgreSQL migrations

## Por que precisamos de PostgreSQL?

* Persistir sessões completas (`lex_sessions`) com estado JSONB.
* Armazenar interações de token (`lex_interactions`).
* Persistir metadados de skills, testes e relatórios de QA.

## Passos para a primeira migração

1. Instalar dependência ``postgresql`` (ex.: ``psycopg2-binary`` ou ``asyncpg``).
2. Criar ``alembic`` configuration em ``services/db/migrations/``.
3. Gerar migração inicial com tabelas:
   ```sql
   CREATE TABLE lex_sessions (
       session_id TEXT PRIMARY KEY,
       state JSONB NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
   );
   
   CREATE TABLE lex_interactions (
       id SERIAL PRIMARY KEY,
       session_id TEXT REFERENCES lex_sessions(session_id),
       direction TEXT CHECK (direction IN ('in','out')),
       token_count INTEGER,
       timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
   );
   ```
4. Aplicar a migração com ``alembic upgrade head``.
5. Atualizar ``services.db.session`` para usar ``SQLAlchemy`` com a URL de conexão
   ``DATABASE_URL`` (padrão ambiente).

## Testes

* Criar fixtures ``engine`` e ``session`` usando um banco SQLite em memória para
  testes unitários.
* Verificar que as tabelas são criadas e que ``Session`` persiste/recupera
  ``LexGraphState`` corretamente.

---

Quando o banco estiver pronto, substituir a persisteência em disco de ``lex_sessions``
pela camada SQL.
