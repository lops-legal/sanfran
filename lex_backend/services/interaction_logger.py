"""InteractionLogger – registra interações (tokens in/out) em um banco SQLite leve.

A base de dados ``interactions.db`` é criada na primeira chamada.
"""

import sqlite3
import os
from datetime import datetime

DB_PATH = os.getenv("INTERACTION_DB", "interactions.db")

def _init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            direction TEXT CHECK(direction IN ('in','out')),
            token_count INTEGER,
            timestamp TEXT
        )
        """
    )
    conn.commit()
    conn.close()

_init_db()

class InteractionLogger:
    @staticmethod
    def log(session_id: str, direction: str, token_count: int) -> None:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO interactions (session_id, direction, token_count, timestamp) VALUES (?,?,?,?)",
            (session_id, direction, token_count, datetime.utcnow().isoformat()),
        )
        conn.commit()
        conn.close()
