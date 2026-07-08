from pydantic import BaseModel

class QAReportResponse(BaseModel):
    discovery_score: int
    implementation_score: int
    structure_score: int
    specialization_score: int
    final_score: int
    design_pattern: str
    justification: dict
