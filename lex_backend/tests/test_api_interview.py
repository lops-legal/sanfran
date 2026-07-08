"""Tests for the interview endpoints (FastAPI).

Uses ``httpx.AsyncClient`` with the FastAPI app.
"""

import pytest
from fastapi.testclient import TestClient
from lex_backend.api.main import app

def test_start_interview():
    client = TestClient(app)
    resp = client.post("/interview/start", json={"raw_request": "Quero criar skill de direito"})
    assert resp.status_code == 200
    data = resp.json()
    assert "turn_output" in data
    assert data["awaiting_user"] is True
