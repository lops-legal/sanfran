"""
test_interaction_logger.py — Testa o logger de interações no banco SQLite.

Cobertura:
- Inserção de mensagens com session_id, role, tokens
- Leitura e filtragem por session_id
- Contadores de tokens (in/out) salvos corretamente
- Isolamento: usa banco em memória via fixture conftest.py
"""
import sqlite3
import uuid
import pytest


# ─── Helper: InteractionLogger simples para testes ───────────────────────────

class InteractionLogger:
    """Logger de interações que persiste no banco SQLite fornecido.
    
    Esse é o contrato esperado do logger no lex_backend. Se o módulo real
    já existir, substitua as importações e remova esta classe.
    """

    def __init__(self, conn: sqlite3.Connection):
        self.conn = conn

    def log(
        self,
        session_id: str,
        role: str,
        content: str,
        tokens_in: int = 0,
        tokens_out: int = 0,
    ) -> int:
        """Insere uma interação e retorna o rowid gerado."""
        cur = self.conn.execute(
            "INSERT INTO interactions (session_id, role, content, tokens_in, tokens_out) "
            "VALUES (?, ?, ?, ?, ?)",
            (session_id, role, content, tokens_in, tokens_out),
        )
        self.conn.commit()
        return cur.lastrowid

    def get_by_session(self, session_id: str) -> list:
        """Retorna todas as interações de uma sessão."""
        rows = self.conn.execute(
            "SELECT id, session_id, role, content, tokens_in, tokens_out, created_at "
            "FROM interactions WHERE session_id = ? ORDER BY id",
            (session_id,),
        ).fetchall()
        return [
            {
                "id": r[0],
                "session_id": r[1],
                "role": r[2],
                "content": r[3],
                "tokens_in": r[4],
                "tokens_out": r[5],
                "created_at": r[6],
            }
            for r in rows
        ]

    def total_tokens(self, session_id: str) -> dict:
        """Soma tokens_in e tokens_out para uma sessão."""
        row = self.conn.execute(
            "SELECT COALESCE(SUM(tokens_in), 0), COALESCE(SUM(tokens_out), 0) "
            "FROM interactions WHERE session_id = ?",
            (session_id,),
        ).fetchone()
        return {"tokens_in": row[0], "tokens_out": row[1]}


# ─── Testes ──────────────────────────────────────────────────────────────────

def test_log_single_message(memory_db):
    """Deve inserir uma mensagem e retornar um id válido."""
    logger = InteractionLogger(memory_db)
    session_id = str(uuid.uuid4())

    row_id = logger.log(session_id, "user", "Olá, Lex!", tokens_in=5, tokens_out=0)

    assert isinstance(row_id, int)
    assert row_id > 0


def test_get_by_session_returns_correct_messages(memory_db):
    """Deve retornar apenas as mensagens da sessão especificada."""
    logger = InteractionLogger(memory_db)
    session_a = str(uuid.uuid4())
    session_b = str(uuid.uuid4())

    logger.log(session_a, "user", "Mensagem da sessão A", tokens_in=3)
    logger.log(session_b, "user", "Mensagem da sessão B", tokens_in=4)
    logger.log(session_a, "assistant", "Resposta da sessão A", tokens_out=10)

    rows_a = logger.get_by_session(session_a)
    rows_b = logger.get_by_session(session_b)

    assert len(rows_a) == 2
    assert len(rows_b) == 1
    assert all(r["session_id"] == session_a for r in rows_a)


def test_log_preserves_roles(memory_db):
    """Roles 'user' e 'assistant' devem ser salvos corretamente."""
    logger = InteractionLogger(memory_db)
    session_id = str(uuid.uuid4())

    logger.log(session_id, "user", "Pergunta do usuário", tokens_in=5)
    logger.log(session_id, "assistant", "Resposta da Lex", tokens_out=15)

    rows = logger.get_by_session(session_id)
    assert rows[0]["role"] == "user"
    assert rows[1]["role"] == "assistant"


def test_log_tokens_counted_correctly(memory_db):
    """Tokens in/out devem ser somados corretamente por sessão."""
    logger = InteractionLogger(memory_db)
    session_id = str(uuid.uuid4())

    logger.log(session_id, "user", "msg1", tokens_in=10, tokens_out=0)
    logger.log(session_id, "assistant", "resp1", tokens_in=0, tokens_out=50)
    logger.log(session_id, "user", "msg2", tokens_in=8, tokens_out=0)
    logger.log(session_id, "assistant", "resp2", tokens_in=0, tokens_out=30)

    totals = logger.total_tokens(session_id)

    assert totals["tokens_in"] == 18
    assert totals["tokens_out"] == 80


def test_get_empty_session_returns_empty_list(memory_db):
    """Consulta de sessão inexistente deve retornar lista vazia."""
    logger = InteractionLogger(memory_db)
    non_existent_id = str(uuid.uuid4())

    rows = logger.get_by_session(non_existent_id)
    assert rows == []


def test_total_tokens_empty_session_returns_zeros(memory_db):
    """Tokens de sessão sem interações devem ser zero."""
    logger = InteractionLogger(memory_db)
    non_existent_id = str(uuid.uuid4())

    totals = logger.total_tokens(non_existent_id)
    assert totals["tokens_in"] == 0
    assert totals["tokens_out"] == 0


def test_log_long_content(memory_db):
    """Conteúdo longo (>1000 chars) deve ser salvo sem truncamento."""
    logger = InteractionLogger(memory_db)
    session_id = str(uuid.uuid4())
    long_content = "A" * 2000

    logger.log(session_id, "user", long_content, tokens_in=500)
    rows = logger.get_by_session(session_id)

    assert len(rows[0]["content"]) == 2000


def test_log_special_characters(memory_db):
    """Caracteres especiais e unicode devem ser salvos sem erro."""
    logger = InteractionLogger(memory_db)
    session_id = str(uuid.uuid4())
    special_content = "Arte: 🎨 | Legal: § 482 da CLT | Escape: '; DROP TABLE--"

    logger.log(session_id, "user", special_content)
    rows = logger.get_by_session(session_id)

    assert rows[0]["content"] == special_content


def test_multiple_sessions_isolated(memory_db):
    """Sessões diferentes não devem interferir entre si."""
    logger = InteractionLogger(memory_db)
    sessions = [str(uuid.uuid4()) for _ in range(5)]

    for i, sid in enumerate(sessions):
        for j in range(3):
            logger.log(sid, "user", f"msg-{i}-{j}", tokens_in=i + j)

    for sid in sessions:
        rows = logger.get_by_session(sid)
        assert len(rows) == 3
