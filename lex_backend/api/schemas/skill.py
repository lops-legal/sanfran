from pydantic import BaseModel, Field
from typing import Optional, Dict

class SkillCreateRequest(BaseModel):
    name: str = Field(..., description="Nome da skill (human readable)")
    content: str = Field(..., description="Conteúdo completo do SKILL.md")
    metadata: Optional[Dict[str, str]] = None

class SkillResponse(BaseModel):
    skill_id: str
    status: str
    content: Optional[str] = None
    metadata: Optional[Dict[str, str]] = None
