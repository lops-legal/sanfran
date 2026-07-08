from pydantic import BaseModel

class TestCase(BaseModel):
    input_text: str
    expected_output_contains: str
    expected_output_format: str
