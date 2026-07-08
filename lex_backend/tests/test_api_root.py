import pytest
from fastapi.testclient import TestClient
from lex_backend.api.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Lex Backend is up"
