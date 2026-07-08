def test_get_skill_placeholder(client):
    resp = client.get("/skill/skill-123")
    assert resp.status_code == 200
    # TODO: validar estrutura real da skill
