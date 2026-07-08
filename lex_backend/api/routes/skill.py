from fastapi import APIRouter, HTTPException
from typing import Dict, Any
# Relative import for the skill schema definitions
from ..schemas.skill import SkillCreateRequest, SkillResponse

router = APIRouter()

# Em memória simples (para demo)
# Store de skills em memória para demonstração
_skill_store: Dict[str, Dict[str, Any]] = {}

@router.post("/create", response_model=SkillResponse)
async def create_skill(payload: SkillCreateRequest):
    skill_id = payload.name.lower().replace(" ", "-")
    if skill_id in _skill_store:
        raise HTTPException(status_code=409, detail="Skill already exists")
    _skill_store[skill_id] = {
        "name": payload.name,
        "content": payload.content,
        "metadata": payload.metadata or {}
    }
    return SkillResponse(skill_id=skill_id, status="created")

@router.get("/{skill_id}", response_model=SkillResponse)
async def get_skill(skill_id: str):
    skill = _skill_store.get(skill_id)
    if not skill:
        # Return placeholder for unknown skills (demo behavior)
        return SkillResponse(skill_id=skill_id, status="placeholder", content="Placeholder skill content", metadata={})
    return SkillResponse(skill_id=skill_id, status="found", content=skill["content"], metadata=skill["metadata"])
