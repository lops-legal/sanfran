from fastapi import APIRouter
from typing import Dict

router = APIRouter()

@router.post("/{skill_id}/qa")
async def run_qa(skill_id: str) -> Dict[str, int]:
    # Placeholder: devolve score 0 (a ser implementado)
    return {"skill_id": skill_id, "score": 0}
