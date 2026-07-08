# TODO – LLM Adapter

* **Objetivo**: substituir o `MockLLMAdapter` por uma implementação que chame o endpoint GPT‑OSS‑120B.
* **Passos**:
  1. Definir a URL base (ex.: `https://api.nvidia.com/v1/completions`).
  2. Usar a chave de API (`GPT_OSS_API_KEY`) via cabeçalho `Authorization: Bearer <key>`.
  3. Implementar controle de timeout e retry exponencial (max 3 tentativas).
  4. Parsear a resposta JSON para extrair o campo `completion` ou `choices[0].text`.
  5. Expor um método `generate(prompt: str) -> str` que retorne a string final.
* **Testes**:
  * Mockar `urllib.request.urlopen` para validar a serialização da requisição.
  * Garantir que, na falta da variável de ambiente, a classe levante `RuntimeError`.
* **Integração**: substituir as importações nos nós do grafo que necessitam de LLM (ex.: `draft`, `self_review`).
