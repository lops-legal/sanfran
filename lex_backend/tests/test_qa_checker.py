import json
from unittest.mock import MagicMock, patch
import pytest
from lex_backend.services.qa_checker import QAChecker

# Compliant markdown for testing structural checks
COMPLIANT_SKILL = """---
name: test-skill-123
description: Esta é uma descrição longa o suficiente para passar no linter do qa.
---
## Objetivo
Esta skill serve para revisar as regras do CDC.

## Limites de Autonomia
O agente de IA não pode fechar acordos sem aprovação humana.
"""

def test_structural_checks_fully_compliant():
    checker = QAChecker()
    checks = checker._run_structural_checks(COMPLIANT_SKILL)
    
    assert checks["has_frontmatter"] is True
    assert checks["has_name"] is True
    assert checks["has_description"] is True
    assert checks["name_is_valid"] is True
    assert checks["description_length_ok"] is True
    assert checks["has_h2_headers"] is True
    assert checks["has_normas"] is True
    assert checks["has_autonomia"] is True
    assert checks["no_windows_paths"] is True

def test_structural_checks_missing_frontmatter():
    checker = QAChecker()
    # No yaml frontmatter
    content = "## Objetivo\nEsta skill revisa o CDC e limites de autonomia."
    checks = checker._run_structural_checks(content)
    
    assert checks["has_frontmatter"] is False
    assert checks["has_name"] is False
    assert checks["has_description"] is False
    assert checks["name_is_valid"] is False
    assert checks["description_length_ok"] is False

def test_structural_checks_invalid_name():
    checker = QAChecker()
    content = """---
name: Nome Invalido Com Espacos!
description: Esta é uma descrição longa o suficiente para passar no linter do qa.
---
## Objetivo
CLT e limite de autonomia.
"""
    checks = checker._run_structural_checks(content)
    assert checks["has_frontmatter"] is True
    assert checks["has_name"] is True
    assert checks["name_is_valid"] is False

def test_structural_checks_windows_paths():
    checker = QAChecker()
    content = """---
name: test-skill
description: Esta é uma descrição longa o suficiente para passar no linter do qa.
---
## Objetivo
CDC e limites de autonomia.
Referência: docs\\rules\\reference.md
"""
    checks = checker._run_structural_checks(content)
    assert checks["no_windows_paths"] is False

@patch("lex_backend.services.qa_checker.RealLLMAdapter")
def test_qa_checker_run_success(mock_adapter_class):
    mock_adapter = MagicMock()
    mock_adapter_class.return_value = mock_adapter
    
    # Mock LLM return value for adversarial check
    mock_llm_json = {
        "discovery": {"score": 3, "justification": "Good discovery"},
        "implementation": {"score": 2, "justification": "Good implementation"},
        "specialization": {"score": 3, "justification": "Excellent specialization"}
    }
    mock_adapter.generate.return_value = json.dumps(mock_llm_json)
    
    checker = QAChecker()
    checker.adapter = mock_adapter
    
    report = checker.run({"content": COMPLIANT_SKILL})
    
    # Since COMPLIANT_SKILL passes all 9/9 structural checks, ratio is 1.0 >= 0.9, so structure_score = 3.
    # Scores: discovery = 3, implementation = 2, structure = 3, specialization = 3.
    # Sum: 3+2+3+3 = 11.
    # Final Score: round((11 / 12) * 100) = 92.
    assert report["discovery"]["score"] == 3
    assert report["implementation"]["score"] == 2
    assert report["structure"]["score"] == 3
    assert report["specialization"]["score"] == 3
    assert report["final_score"] == 92
    assert report["design_pattern"] == "revisor_auditor"

@patch("lex_backend.services.qa_checker.RealLLMAdapter")
def test_qa_checker_run_fallback_on_llm_failure(mock_adapter_class):
    mock_adapter = MagicMock()
    mock_adapter_class.return_value = mock_adapter
    mock_adapter.generate.side_effect = RuntimeError("API error")
    
    checker = QAChecker()
    checker.adapter = mock_adapter
    
    report = checker.run({"content": COMPLIANT_SKILL})
    
    # Check that fallback values (score 2 for each LLM dim) are used
    assert report["discovery"]["score"] == 2
    assert report["implementation"]["score"] == 2
    assert report["structure"]["score"] == 3 # structure is computed locally, so it is still 3
    assert report["specialization"]["score"] == 2
    # Sum: 2+2+3+2 = 9. Final Score: round((9/12)*100) = 75
    assert report["final_score"] == 75
