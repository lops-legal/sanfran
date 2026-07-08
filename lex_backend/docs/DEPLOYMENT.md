# Deployment

## Banco de Dados (reservado)

Por enquanto o projeto usa um **SQLite** (`lex.db`) como placeholder.  Quando for necessário escalar, basta:

1. **Definir** a variável de ambiente `DATABASE_URL` apontando para um PostgreSQL, ex.:
   ```
   export DATABASE_URL=postgresql://lex_user:senha@localhost:5432/lex_db
   ```
2. Executar as migrações Alembic que já foram inicializadas em `services/db/migrations/`:
   ```bash
   alembic upgrade head
   ```
   (O comando pode ser rodado dentro do virtualenv com `alembic` instalado.)
3. O código de `services/db/session.py` detecta automaticamente o `DATABASE_URL` e cria o engine adequado.

## Execução Local
```bash
python -m venv .venv
source .venv/bin/activate   # no Windows usa: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn api.main:app --reload
```

## Observação sobre PowerShell
O erro que você viu ao rodar `python -m venv .venv && source .venv/bin/activate` ocorre porque **PowerShell** não reconhece o operador `&&`. Use um ponto e vírgula `;` ou execute os comandos separadamente:
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # ativa o venv no PowerShell
```
Ou, se estiver usando o bash do MSYS (como o terminal da Hermès):
```bash
python -m venv .venv && source .venv/bin/activate
```
