"""
api/routes/sessions.py
-------------------------
Rotas REST para gerenciar sessões de chat persistidas no SQLite (via
services/db/models.py::LexSession/LexInteraction). Substitui a persistência
em localStorage do LexBot.tsx.

Coloque este arquivo em: lex_backend/api/routes/sessions.py
E registre no main.py (ver instrução no fim deste arquivo).
"""

import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession

from ...services.db.session import get_db
from ...services.db.models import LexSession, LexInteraction

router = APIRouter(prefix="/sessions", tags=["sessions"])


# ---------------------------------------------------------------------------
# Schemas (response/request) — mantidos aqui por serem específicos desta
# rota; mova para api/schemas/session.py se preferir seguir o padrão dos
# outros schemas (chat.py, skill.py, etc.) que você já tem.
# ---------------------------------------------------------------------------

class SessionSummary(BaseModel):
    session_id: str
    title: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    message_count: int


class InteractionOut(BaseModel):
    role: str
    content: Optional[str] = None
    timestamp: Optional[str] = None


class SessionDetail(SessionSummary):
    interactions: List[InteractionOut]


class CreateSessionRequest(BaseModel):
    title: Optional[str] = None  # se omitido, usa "Nova Conversa"


class RenameSessionRequest(BaseModel):
    title: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _to_summary(session: LexSession, message_count: int) -> SessionSummary:
    return SessionSummary(
        session_id=session.session_id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        message_count=message_count,
    )


# ---------------------------------------------------------------------------
# Rotas
# ---------------------------------------------------------------------------

@router.get("", response_model=List[SessionSummary])
def list_sessions(db: DBSession = Depends(get_db)):
    """
    Lista sessões para o histórico do frontend, ordenadas por atividade
    recente (updated_at desc). Inclui sessões SEM mensagens — diferente do
    bug do localStorage, aqui o frontend decide se quer filtrar
    (ex: "Nova Conversa" recém-criada e ainda vazia pode aparecer no topo
    como rascunho, em vez de ficar invisível).
    """
    sessions = (
        db.query(LexSession)
        .order_by(LexSession.updated_at.desc())
        .all()
    )
    result = []
    for s in sessions:
        count = db.query(LexInteraction).filter(LexInteraction.session_id == s.session_id).count()
        result.append(_to_summary(s, count))
    return result


@router.post("", response_model=SessionSummary)
def create_session(body: CreateSessionRequest, db: DBSession = Depends(get_db)):
    """Cria uma sessão nova e persistida — substitui o que startNewSession()
    fazia só em memória/localStorage."""
    session_id = str(uuid.uuid4())
    now = _now_iso()

    session = LexSession(
        session_id=session_id,
        title=body.title or "Nova Conversa",
        state={},
        created_at=now,
        updated_at=now,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return _to_summary(session, message_count=0)


@router.get("/{session_id}", response_model=SessionDetail)
def get_session(session_id: str, db: DBSession = Depends(get_db)):
    """Retorna a sessão com o histórico completo de interações — usado ao
    clicar numa sessão no histórico (loadSession no frontend)."""
    session = db.query(LexSession).filter(LexSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada.")

    interactions = (
        db.query(LexInteraction)
        .filter(LexInteraction.session_id == session_id)
        .order_by(LexInteraction.id.asc())
        .all()
    )

    return SessionDetail(
        **_to_summary(session, message_count=len(interactions)).model_dump(),
        interactions=[
            InteractionOut(role=i.role, content=i.content, timestamp=i.timestamp)
            for i in interactions
        ],
    )


@router.patch("/{session_id}", response_model=SessionSummary)
def rename_session(session_id: str, body: RenameSessionRequest, db: DBSession = Depends(get_db)):
    """Renomeia a sessão (corresponde ao botão 'Renomear' no menu de
    contexto do LexBot.tsx)."""
    session = db.query(LexSession).filter(LexSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada.")

    title = body.title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="Título não pode ser vazio.")

    session.title = title
    session.updated_at = _now_iso()
    db.commit()
    db.refresh(session)

    count = db.query(LexInteraction).filter(LexInteraction.session_id == session_id).count()
    return _to_summary(session, message_count=count)


@router.delete("/{session_id}", status_code=204)
def delete_session(session_id: str, db: DBSession = Depends(get_db)):
    """Exclui a sessão e suas interações (cascade definido em models.py)."""
    session = db.query(LexSession).filter(LexSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada.")

    db.delete(session)
    db.commit()
    return None


# ---------------------------------------------------------------------------
# Registro no main.py — adicione estas duas linhas onde os outros routers
# já são incluídos:
#
#   from .routes import sessions as sessions_routes
#   app.include_router(sessions_routes.router)
# ---------------------------------------------------------------------------
