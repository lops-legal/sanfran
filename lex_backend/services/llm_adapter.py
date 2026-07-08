import os
from typing import Optional
# Compatibilidade: tenta importar a classe OpenAI (SDK v1). Caso não esteja disponível,
# recai para a API legacy do pacote ``openai`` (ChatCompletion).
try:
    from openai import OpenAI  # SDK >= 1.0
except Exception:  # pragma: no cover
    import openai as _openai

    class OpenAI:  # type: ignore
        """Wrapper simplificado para compatibilidade com a SDK legacy.

        O código original usa ``client.chat.completions.create``. Este wrapper
        expõe a mesma cadeia de atributos delegando a chamada para
        ``openai.ChatCompletion.create`` da biblioteca legacy.
        """

        def __init__(self, base_url: str, api_key: str):
            # Configura a API legacy
            _openai.api_base = base_url
            _openai.api_key = api_key
            # ``client.chat`` deve apontar para um objeto que tem ``completions``
            self._chat = self._Chat()

        class _Chat:
            class _Completions:
                @staticmethod
                def create(*, model, messages, temperature, top_p, max_tokens, stream, timeout):
                    # Delegação direta à API legacy
                    return _openai.ChatCompletion.create(
                        model=model,
                        messages=messages,
                        temperature=temperature,
                        top_p=top_p,
                        max_tokens=max_tokens,
                    )

            def __init__(self):
                self.completions = self._Completions()

        @property
        def chat(self):
            return self._chat

        def __init__(self):
            self.completions = self._Completions()

    @property
    def chat(self):
        return self._chat


# Mock adapter remains unchanged
class MockLLMAdapter:
    """Adapter de LLM usado em testes e desenvolvimento local.
    Simula a geração de texto devolvendo o prompt recebido em maiúsculas.
    """
    def generate(self, prompt: str) -> str:
        return f"MOCK_RESPONSE: {prompt.upper()}"

    def generate_chat(self, messages: list) -> str:
        last_msg = messages[-1]["content"] if messages else ""
        return f"MOCK_RESPONSE_CHAT: {last_msg.upper()}"

# Real adapter – utiliza o cliente OpenAI apontando para o endpoint da NVIDIA
class RealLLMAdapter:
    """Adapter que chama o endpoint serverless da NVIDIA (GPT‑OSS‑120B).

    Variáveis de ambiente esperadas:
        * ``GPT_OSS_API_KEY`` – chave da API NVIDIA (default)
        * ``GPT_OSS_ENDPOINT`` – URL base da API (default: ``https://integrate.api.nvidia.com/v1``)
        * ``GPT_OSS_MODEL`` – modelo a ser usado (default: ``openai/gpt-oss-120b``)
    """

    def __init__(self, timeout: int = 30, max_retries: int = 3):
        self.api_key: str = os.getenv("GPT_OSS_API_KEY")
        if not self.api_key:
            raise RuntimeError("GPT_OSS_API_KEY")
        self.endpoint: str = os.getenv(
            "GPT_OSS_ENDPOINT", "https://integrate.api.nvidia.com/v1"
        )
        self.model: str = os.getenv("GPT_OSS_MODEL", "openai/gpt-oss-120b")
        self.timeout = timeout
        self.max_retries = max_retries
        # Importa OpenAI somente aqui para evitar dependência pesada quando não usado
        self.client = OpenAI(base_url=self.endpoint, api_key=self.api_key)

    def _call_api(self, prompt: str) -> str:
        """Realiza a chamada ao endpoint da NVIDIA.
        Retorna apenas o conteúdo da mensagem de resposta.
        """
        return self._call_api_chat([{"role": "user", "content": prompt}])

    def _call_api_chat(self, messages: list) -> str:
        """Realiza a chamada ao endpoint usando histórico de mensagens."""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=1.0,
            top_p=1.0,
            max_tokens=4096,
            stream=False,
            timeout=self.timeout,
        )
        return response.choices[0].message.content

    def generate(self, prompt: str) -> str:
        """Envolve a chamada real com política de *retry* exponencial.
        Em caso de falha após ``max_retries`` levanta ``RuntimeError``.
        """
        attempt = 0
        while attempt < self.max_retries:
            try:
                return self._call_api(prompt)
            except Exception as exc:  # pylint: disable=broad-except
                attempt += 1
                if attempt >= self.max_retries:
                    raise RuntimeError(
                        f"Falha ao chamar LLM após {self.max_retries} tentativas: {exc}"
                    ) from exc
                # espera exponencial (1s, 2s, 4s ...)
                import time

                time.sleep(2 ** (attempt - 1))
        # Nunca deve chegar aqui
        raise RuntimeError("Erro inesperado no RealLLMAdapter")

    def generate_chat(self, messages: list) -> str:
        """Envolve a chamada real via chat com política de retry."""
        attempt = 0
        while attempt < self.max_retries:
            try:
                return self._call_api_chat(messages)
            except Exception as exc:
                attempt += 1
                if attempt >= self.max_retries:
                    raise RuntimeError(
                        f"Falha ao chamar LLM após {self.max_retries} tentativas: {exc}"
                    ) from exc
                import time
                time.sleep(2 ** (attempt - 1))
        raise RuntimeError("Erro inesperado no RealLLMAdapter (chat)")
