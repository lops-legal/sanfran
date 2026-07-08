from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ChatMessage(BaseModel):
    role: str
    text: str

class ContextDocument(BaseModel):
    name: str
    text: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage]
    contextDocument: Optional[ContextDocument] = None

class ChatResponse(BaseModel):
    text: str
    generatedSkillMarkdown: Optional[str] = None
    thoughts: Optional[List[str]] = None
