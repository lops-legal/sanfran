"""
PATCH para models.py — substitua só as classes LexSession e LexInteraction
pelo conteúdo abaixo (o resto do seu models.py permanece igual).

Mudanças:
  - LexSession: + title (str), + updated_at (str) — necessários para o
    histórico de sessões funcionar (listar por atividade recente, exibir
    nome customizado/auto-gerado).
  - LexInteraction: nada mudou na declaração (já tinha `content`), só
    documentando que agora a coluna existe de fato na tabela (migration 0002).
"""

# ─────────────────────────────────────────────
# 9. LexSession (existente — sessões do agente)
# ─────────────────────────────────────────────

class LexSession(Base):
    """Sessão do agente Lex (LangGraph state) + metadados de exibição
    no histórico do frontend (title, updated_at).
    """
    __tablename__ = "lex_sessions"

    id         = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    title      = Column(String, nullable=False, default="Nova Conversa")
    state      = Column(JSON)    # Estado do grafo LangGraph
    created_at = Column(String, default="now()")
    updated_at = Column(String, default="now()", onupdate="now()")

    interactions = relationship(
        "LexInteraction",
        back_populates="session_rel",
        cascade="all, delete-orphan",   # deletar sessão remove as interações dela
        order_by="LexInteraction.id",
    )


# ─────────────────────────────────────────────
# 10. LexInteraction (existente — histórico)
# ─────────────────────────────────────────────

class LexInteraction(Base):
    """Log de interações do agente Lex (uma linha por mensagem de usuário
    ou de assistente dentro de uma sessão)."""
    __tablename__ = "lex_interactions"

    id         = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("lex_sessions.session_id"), index=True)
    role       = Column(String)      # "user" | "assistant" | "tool"
    content    = Column(Text, nullable=True)
    tokens     = Column(Integer, nullable=True)
    timestamp  = Column(String, default="now()")

    session_rel = relationship("LexSession", back_populates="interactions")
