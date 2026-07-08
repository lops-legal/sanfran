# TODO – QA Checker (agentskill_quality.sh)

* **Objetivo**: Substituir o placeholder ``scripts/agentskill_quality.sh`` por um fork completo do ``agentskill.sh`` que executa a rubrica de qualidade da agentskill.
* **Passos**:
  1. Clonar o repositório original ``agentskill`` (ou copiar o script ``agentskill.sh``).
  2. Adaptar as partes que esperam um caminho de SKILL.md para aceitar a entrada via ``stdin`` (o wrapper ``QAChecker.run`` já envia o markdown por ``stdin``).
  3. Garantir que o script finaliza imprimindo **JSON** estrito (sem mensagens de log extra). O formato deve conter as chaves ``discovery``, ``implementation``, ``structure``, ``specialization`` e ``final_score``.
  4. Testar localmente:
     ```bash
     echo "---\nname: teste\n---\n## Exemplo" | bash scripts/agentskill_quality.sh
     ```
     O output deve ser um JSON parseable.
  5. Atualizar ``services/qa_checker.py`` para apontar para o caminho correto (variável de ambiente ``AGENT_QUALITY_SCRIPT`` ou caminho relativo).
  6. (Opcional) Adicionar um flag ``--debug`` ao script para imprimir logs em ``stderr`` sem interferir no JSON.
* **Quando concluído**: ``QAChecker.run`` retornará um dicionário completo que será armazenado no grafo sob ``state["qa_report"]``.
