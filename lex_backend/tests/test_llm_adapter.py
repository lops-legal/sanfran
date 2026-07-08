import os
import sys
import importlib.util
import pytest
from unittest.mock import MagicMock, patch


# ── Carrega o módulo llm_adapter limpo (sem o monkey-patch do conftest) ──────

def _load_clean_adapter_module():
    """Carrega o módulo llm_adapter.py diretamente do source, sem o monkey-patch
    do conftest.py que substitui RealLLMAdapter por MockLLMAdapter."""
    adapter_path = os.path.join(
        os.path.dirname(__file__), "..", "services", "llm_adapter.py"
    )
    spec = importlib.util.spec_from_file_location("_llm_adapter_clean", adapter_path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


# ─── Testes do MockLLMAdapter ─────────────────────────────────────────────────

def test_mock_llm_generate():
    from lex_backend.services.llm_adapter import MockLLMAdapter
    adapter = MockLLMAdapter()
    result = adapter.generate("teste")
    assert result.startswith("MOCK_RESPONSE")


def test_mock_llm_generate_chat():
    from lex_backend.services.llm_adapter import MockLLMAdapter
    adapter = MockLLMAdapter()
    result = adapter.generate_chat([{"role": "user", "content": "teste"}])
    assert result.startswith("MOCK_RESPONSE_CHAT")


# ─── Testes do RealLLMAdapter (classe original, carregada do source) ──────────

def test_real_llm_raises_without_key():
    """Se GPT_OSS_API_KEY não estiver definida, deve lançar RuntimeError."""
    mod = _load_clean_adapter_module()
    # Remove GPT_OSS_API_KEY do ambiente
    env_clean = {k: v for k, v in os.environ.items() if k != "GPT_OSS_API_KEY"}
    with patch.dict(os.environ, env_clean, clear=True):
        with pytest.raises(RuntimeError) as exc:
            mod.RealLLMAdapter()
        assert "GPT_OSS_API_KEY" in str(exc.value)


def test_real_llm_success():
    """Com chave válida e mock do OpenAI, deve retornar o conteúdo da resposta."""
    mod = _load_clean_adapter_module()
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content="RESPOSTA_REAL"))]
    mock_client.chat.completions.create.return_value = mock_response

    # Substitui OpenAI no namespace do módulo limpo
    with patch.dict(os.environ, {"GPT_OSS_API_KEY": "fake_key"}):
        mod.OpenAI = MagicMock(return_value=mock_client)
        adapter = mod.RealLLMAdapter()
        result = adapter.generate("pergunta")

    assert result == "RESPOSTA_REAL"
    mock_client.chat.completions.create.assert_called_once()


def test_real_llm_retry_and_success():
    """Deve tentar novamente após falha e retornar sucesso na segunda tentativa."""
    mod = _load_clean_adapter_module()
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content="DEU_CERTO"))]
    mock_client.chat.completions.create.side_effect = [
        Exception("Erro temporário"),
        mock_response,
    ]

    with patch.dict(os.environ, {"GPT_OSS_API_KEY": "fake_key"}):
        with patch.object(mod, "OpenAI", return_value=mock_client):
            with patch("time.sleep", return_value=None) as mock_sleep:
                adapter = mod.RealLLMAdapter(max_retries=3)
                result = adapter.generate("pergunta")

    assert result == "DEU_CERTO"
    assert mock_client.chat.completions.create.call_count == 2
    mock_sleep.assert_called_once_with(1)


def test_real_llm_failure_after_retries():
    """Após esgotar todas as tentativas, deve lançar RuntimeError."""
    mod = _load_clean_adapter_module()
    mock_client = MagicMock()
    mock_client.chat.completions.create.side_effect = Exception("Erro permanente")

    with patch.dict(os.environ, {"GPT_OSS_API_KEY": "fake_key"}):
        with patch.object(mod, "OpenAI", return_value=mock_client):
            with patch("time.sleep", return_value=None):
                adapter = mod.RealLLMAdapter(max_retries=3)
                with pytest.raises(RuntimeError) as exc:
                    adapter.generate("pergunta")

    assert "Falha ao chamar LLM após 3 tentativas" in str(exc.value)
    assert mock_client.chat.completions.create.call_count == 3
