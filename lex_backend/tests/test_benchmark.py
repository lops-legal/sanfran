"""Benchmark de latencia real — roda via pytest."""
import time
import pytest


RUNS = 10


@pytest.fixture(scope="module")
def api_client():
    from fastapi.testclient import TestClient
    from lex_backend.api.main import app
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


def test_benchmark_interview_start(api_client, capsys):
    latencies = []
    for i in range(RUNS):
        t0 = time.perf_counter()
        r = api_client.post('/interview/start', json={'raw_request': f'Skill {i} CLT'})
        ms = (time.perf_counter() - t0) * 1000
        latencies.append(ms)

    with capsys.disabled():
        print(f"\n/interview/start  ({RUNS} runs, status={r.status_code})")
        for i, ms in enumerate(latencies):
            print(f"  #{i+1:02d}: {ms:7.3f} ms")
        print(f"  min: {min(latencies):.3f} ms")
        print(f"  max: {max(latencies):.3f} ms")
        print(f"  avg: {sum(latencies)/len(latencies):.3f} ms")

    assert max(latencies) < 5000


def test_benchmark_lex_chat(api_client, capsys):
    latencies = []
    for i in range(RUNS):
        t0 = time.perf_counter()
        r = api_client.post('/api/lex-chat', json={'message': f'msg {i}', 'history': []})
        ms = (time.perf_counter() - t0) * 1000
        latencies.append(ms)

    with capsys.disabled():
        print(f"\n/api/lex-chat  ({RUNS} runs, status={r.status_code})")
        for i, ms in enumerate(latencies):
            print(f"  #{i+1:02d}: {ms:7.3f} ms")
        print(f"  min: {min(latencies):.3f} ms")
        print(f"  max: {max(latencies):.3f} ms")
        print(f"  avg: {sum(latencies)/len(latencies):.3f} ms")

    assert max(latencies) < 5000


def test_benchmark_interview_continue(api_client, capsys):
    r0 = api_client.post('/interview/start', json={'raw_request': 'bench CLT'})
    sid = r0.json()['session_id']

    latencies = []
    for i in range(RUNS):
        t0 = time.perf_counter()
        r = api_client.post('/interview/continue', json={
            'session_id': sid,
            'answer': f'R{i}',
            'state': {'user_message': f'R{i}'}
        })
        ms = (time.perf_counter() - t0) * 1000
        latencies.append(ms)

    with capsys.disabled():
        print(f"\n/interview/continue  ({RUNS} runs, status={r.status_code})")
        for i, ms in enumerate(latencies):
            print(f"  #{i+1:02d}: {ms:7.3f} ms")
        print(f"  min: {min(latencies):.3f} ms")
        print(f"  max: {max(latencies):.3f} ms")
        print(f"  avg: {sum(latencies)/len(latencies):.3f} ms")

    assert max(latencies) < 5000
