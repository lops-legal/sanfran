# TODO: Test Generator Enhancements

## Current state

* ``services/test_generator.py`` returns duas amostras estáticas para qualquer skill.

## Desired features

1. **LLM‑driven generation** – usar ``RealLLMAdapter`` (quando disponível) para criar
   casos de teste baseados no conteúdo da skill.
2. **Diversidade de tipos** – suportar três categorias de teste:
   * *input / expected output*
   * *edge case* (valores limites)
   * *performance* (tempo esperado, tamanho de saída)
3. **Configuraçã‍o por nível** – skills de nível 1 recebem 2 casos, nível 2 recebem 3,
   nível 3 recebe 4.
4. **Validação** – garantir que cada caso tenha campos não‑nulos e que o
   ``expected_output_contains`` seja uma substring plausível.

## Implementation plan

* Expandir a API de ``TestGenerator.generate_for_skill(skill_id)`` para receber o
  ``level`` da skill.
* Dentro do método, montar o prompt para o LLM:
  ```
  "Generate N test cases for the following skill description: <skill markdown>"
  ```
* Parsear a resposta JSON do LLM e converter para a lista de ``dict`` esperada.
* Adicionar testes unitários que mockam ``RealLLMAdapter.generate`` e verificam a
  estrutura do retorno.

---

Esta melhoria será desenvolvida após a implementação do ``RealLLMAdapter``.
