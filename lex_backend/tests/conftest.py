"""
conftest.py — Configuração global de testes para o Lex Backend.

Garante:
- LLM sempre mockado (sem chamadas de rede reais durante o pytest)
- FastAPI TestClient disponível como fixture de sessão
- DB SQLite em memória para isolamento entre runs
"""
import os
import pytest

# ── Garante que a chave fake seja setada ANTES de qualquer import do app ──────
os.environ.setdefault("GPT_OSS_API_KEY", "pytest-fake-key")
os.environ.setdefault("GPT_OSS_ENDPOINT", "https://mock.nvidia.com/v1")
os.environ.setdefault("GPT_OSS_MODEL", "mock-model")

# ── Força o MockLLMAdapter em todos os testes ─────────────────────────────────
from unittest.mock import patch, MagicMock
import lex_backend.services.llm_adapter as _llm_mod

# Monkey-patch RealLLMAdapter para se comportar como Mock por padrão nos testes
_original_real = _llm_mod.RealLLMAdapter

class _SafeMockAdapter(_llm_mod.MockLLMAdapter):
    """MockLLMAdapter que aceita os mesmos __init__ kwargs do RealLLMAdapter."""
    def __init__(self, *args, **kwargs):
        pass

_llm_mod.RealLLMAdapter = _SafeMockAdapter

# ── FastAPI TestClient ─────────────────────────────────────────────────────────
from fastapi.testclient import TestClient
from lex_backend.api.main import app

@pytest.fixture(scope="session")
def client():
    """TestClient de sessão — inicializa o app uma única vez."""
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c

# ── Fixture para DB SQLite em memória (interaction logger) ────────────────────
@pytest.fixture()
def memory_db():
    """Cria um banco SQLite em memória e devolve a conexão.
    Ideal para testar o InteractionLogger sem poluir lex.db.
    """
    import sqlite3
    conn = sqlite3.connect(":memory:", check_same_thread=False)
    conn.execute(
        """CREATE TABLE interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            tokens_in INTEGER DEFAULT 0,
            tokens_out INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        )"""
    )
    conn.commit()
    yield conn
    conn.close()
