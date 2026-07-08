"""TestGenerator service – gera casos de teste automáticos.

Neste scaffold retornamos uma lista estática; a versão completa usará modelos
LLM para criar casos mais elaborados.
"""

from typing import List, Dict

class TestGenerator:
    @staticmethod
    def generate_for_skill(skill_id: str) -> List[Dict]:
        # Placeholder: returns duas amostras genéricas
        return [
            {"input_text": "exemplo 1", "expected_output_contains": "resultado 1", "expected_output_format": "texto"},
            {"input_text": "exemplo 2", "expected_output_contains": "resultado 2", "expected_output_format": "texto"},
        ]
