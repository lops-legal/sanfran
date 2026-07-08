# Arquitetura e Integração com a API GPT‑OSS

- O adaptador concreto para a API da NVIDIA está em **`services/gpt_oss_adapter.py`**.
- Ele herda de `RealLLMAdapter` (em `services/llm_adapter.py`) e implementa `generate` usando o cliente OpenAI‑compatible.
- Variáveis de ambiente necessárias:
  * **`GPT_OSS_API_KEY`** – chave de acesso ao modelo.
  * **`GPT_OSS_BASE_URL`** (opcional) – base URL, padrão `https://integrate.api.nvidia.com/v1`.
  * **`GPT_OSS_MODEL`** (opcional) – modelo, padrão `openai/gpt-oss-120b`.
- Para usar, importe `from services.gpt_oss_adapter import GPTOSSAdapter` e chame `adapter = GPTOSSAdapter(); resposta = adapter.generate(prompt)`.

Esta pasta está dentro do projeto **lex_backend**, portanto a API do modelo fica disponível localmente sem necessidade de criar novos diretórios.
