import os, sqlite3
from fastapi import APIRouter, HTTPException

router = APIRouter()

DB_PATH = os.getenv('CHECKPOINT_DB_URL', 'sqlite:///lex.db')
# Convert URL to file path (sqlite:///path)
if DB_PATH.startswith('sqlite:///'):
    DB_FILE = DB_PATH.replace('sqlite:///', '')
else:
    raise RuntimeError('Only SQLite URLs are supported for session deletion')

def _get_conn():
    return sqlite3.connect(DB_FILE)

@router.delete('/{thread_id}')
def delete_session(thread_id: str):
    """Remove todos os checkpoints associados a ``thread_id``.
    Também remove se houver referência na tabela ``users`` (nenhum cascade aqui).
    """
    try:
        conn = _get_conn()
        cur = conn.cursor()
        # Verifica se existe
        cur.execute('SELECT COUNT(*) FROM checkpoints WHERE thread_id = ?', (thread_id,))
        count = cur.fetchone()[0]
        if count == 0:
            raise HTTPException(status_code=404, detail='Sessão não encontrada')
        # Deleta os checkpoints
        cur.execute('DELETE FROM checkpoints WHERE thread_id = ?', (thread_id,))
        conn.commit()
        return {'deleted': count, 'thread_id': thread_id}
    finally:
        conn.close()
