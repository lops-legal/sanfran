from pydantic import BaseModel, Field
from typing import List

class TestGenerateRequest(BaseModel):
    depth: int = Field(2, description="Quantas iterações de teste gerar")

class TestCaseResponse(BaseModel):
    input: str
    expected: str
