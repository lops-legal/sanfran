import json
import pytest
from pathlib import Path

# Supondo que o Lex Engine exponha um endpoint HTTP local para criar skills
BASE_URL = "http://localhost:8000"

@pytest.fixture
def sample_skill_payload():
    return {
        "task": "Revisar cláusula de rescisão contratual",
        "context": "Direito trabalhista, empresa de médio porte",
        "normas": ["CLT arts. 443 a 447", "Súmula 331 TST"],
    }

def test_meta_skill_flow(sample_skill_payload, requests):
    # 1. Inicia sessão de criação
    resp = requests.post(f"{BASE_URL}/lex/sessions", json={})
    assert resp.status_code == 201
    session_id = resp.json()["session_id"]

    # 2. Envia o prompt inicial
    resp = requests.post(
        f"{BASE_URL}/lex/sessions/{session_id}/messages",
        json={"role": "user", "content": json.dumps(sample_skill_payload)}
    )
    assert resp.status_code == 200
    # Resposta da Lex deve conter o checklist de especificidade
    data = resp.json()
    assert "checklist" in data
    assert data["checklist"]["papel"] != ""

    # 3. Simula o preenchimento do checklist (apenas um exemplo)
    checklist_filled = {
        "papel": "Analisar cláusula de rescisão",
        "normas": "CLT arts. 443 a 447; Súmula 331 TST",
        "padrão_entrega": "Tabela com colunas: cláusula, risco, recomendação",
        "limites_autonomia": "Automático até risco médio, revisões acima requerem humano",
        "casos_teste": [
            {"input": "Cláusula de 30 dias", "expected_output_contains": "riscos", "expected_output_format": "tabela"}
        ]
    }
    resp = requests.post(
        f"{BASE_URL}/lex/sessions/{session_id}/checklist",
        json=checklist_filled,
    )
    assert resp.status_code == 200

    # 4. Finaliza e obtém a skill gerada
    resp = requests.get(f"{BASE_URL}/lex/sessions/{session_id}/skill")
    assert resp.status_code == 200
    skill = resp.json()
    # Valida estrutura mínima
    assert "skill_md_content" in skill
    assert "skill_sections" in skill
    # Verifica token budget
    assert skill["token_count_level1"] < 2000
    assert skill["token_count_level2"] < 5000

def test_gate_qualidade_rejeita_generico(requests):
    # Envia um prompt muito genérico e espera rejeição
    resp = requests.post(f"{BASE_URL}/lex/sessions", json={})
    session_id = resp.json()["session_id"]
    generic_prompt = {"task": "Revisar contrato"}
    resp = requests.post(
        f"{BASE_URL}/lex/sessions/{session_id}/messages",
        json={"role": "user", "content": json.dumps(generic_prompt)}
    )
    # Espera que a Lex retorne erro de especificidade
    data = resp.json()
    assert data.get("error") == "especificidade insuficiente"
