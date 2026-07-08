from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class InterviewStartRequest(BaseModel):
    raw_request: str = Field(..., description="Descrição jurídica ou objetivo do usuário")
    interrupt_before: bool = Field(False, description="Se True, interrompe antes da revisão do usuário")

class InterviewContinueRequest(BaseModel):
    session_id: str = Field(...)
    answer: str = Field(..., description="Resposta do usuário à última pergunta do agente")
    state: Dict[str, Any] = Field(..., description="Estado completo da sessão (serializado)")

class InterviewResponse(BaseModel):
    session_id: str
    turn_output: Optional[Any] = None
