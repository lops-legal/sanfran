import os
import json
import urllib.request
from .llm_adapter import RealLLMAdapter

class GPTOSSAdapter(RealLLMAdapter):
    """Adapter que usa o cliente OpenAI (compatível com NVIDIA) conforme o código
    que você enviou. O endpoint, a chave e o modelo são configuráveis via env.
    """
    def __init__(self):
        super().__init__()
        self.base_url = os.getenv(
            "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",
            "https://integrate.api.nvidia.com/v1",
        )
        self.api_key = os.getenv("GPT_OSS_API_KEY")
        if not self.api_key:
            raise RuntimeError("GPT_OSS_API_KEY não definida no .env")
        self.model = os.getenv("GPT_OSS_MODEL", "openai/gpt-oss-120b")
        self.endpoint = f"{self.base_url}/chat/completions"

    def generate(self, prompt: str) -> str:
        payload = json.dumps({
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 1,
            "top_p": 1,
            "max_tokens": 4096,
            "stream": False,
        }).encode()
        req = urllib.request.Request(self.endpoint, data=payload, method="POST")
        req.add_header("Authorization", f"Bearer {self.api_key}")
        req.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.load(resp)
        # O campo pode ser `choices[0].message.content`
        try:
            return data["choices"][0]["message"]["content"]
        except Exception:
            return data.get("completion", "")
