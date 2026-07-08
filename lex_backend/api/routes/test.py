from fastapi import APIRouter, HTTPException
from typing import List
# Relative import for test schemas
from ..schemas.test import TestGenerateRequest, TestCaseResponse

router = APIRouter()

@router.post("/{skill_id}/test", response_model=List[TestCaseResponse])
async def generate_tests(skill_id: str, payload: TestGenerateRequest):
    # Placeholder: devolve duas cases genéricas
    return [
        {
            "input": "Exemplo de entrada 1",
            "expected": "Saída esperada 1",
        },
        {
            "input": "Exemplo de entrada 2",
            "expected": "Saída esperada 2",
        },
    ]
