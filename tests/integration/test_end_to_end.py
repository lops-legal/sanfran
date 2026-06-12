import subprocess
import time
import requests
import json

BASE_API = "http://localhost:8080"   # API Gateway placeholder
BASE_LEX = "http://localhost:8000"

def wait_for_service(url, timeout=30):
    start = time.time()
    while time.time() - start < timeout:
        try:
            r = requests.get(url)
            if r.status_code == 200:
                return True
        except Exception:
            pass
        time.sleep(1)
    raise RuntimeError(f"Serviço {url} não responsivo após {timeout}s")

def test_end_to_end_flow():
    # Verifica se os serviços estão up
    wait_for_service(f"{BASE_API}/health")
    wait_for_service(f"{BASE_LEX}/health")

    # 1. Cria skill via API (CRUD placeholder)
    skill_payload = {
        "slug": "revisao-contrato",
        "title": "Revisão de Cláusula de Rescisão",
        "visibility": "org",
    }
    r = requests.post(f"{BASE_API}/skills", json=skill_payload)
    assert r.status_code == 201, "Falha ao criar skill via API"
    skill_id = r.json()["id"]

    # 2. Inicia sessão Lex para gerar conteúdo da skill
    r = requests.post(f"{BASE_LEX}/lex/sessions", json={})
    assert r.status_code == 201
    session_id = r.json()["session_id"]

    # Envia tarefa
    task = {
        "task": "Criar skill de revisão de cláusula de rescisão",
        "context": "Direito trabalhista, empresa de médio porte",
    }
    r = requests.post(
        f"{BASE_LEX}/lex/sessions/{session_id}/messages",
        json={"role": "user", "content": json.dumps(task)}
    )
    assert r.status_code == 200

    # 3. Finaliza a sessão e obtém a skill gerada
    r = requests.get(f"{BASE_LEX}/lex/sessions/{session_id}/skill")
    assert r.status_code == 200
    generated = r.json()
    assert "skill_md_content" in generated

    # 4. Atualiza a skill criada com o conteúdo gerado (placeholder PUT)
    update_payload = {
        "skill_md_content": generated["skill_md_content"],
        "skill_sections": generated.get("skill_sections", []),
    }
    r = requests.put(f"{BASE_API}/skills/{skill_id}", json=update_payload)
    assert r.status_code == 200

    # 5. Publica a skill (placeholder endpoint)
    r = requests.post(f"{BASE_API}/skills/{skill_id}/publish")
    assert r.status_code == 200
    assert r.json().get("status") == "published"

    print("Fluxo end‑to‑end concluído com sucesso.")
