#!/usr/bin/env bash

# Performance test script for skill search (vetorial) and Lex concurrency
# Utiliza curl para chamadas HTTP e measure time com 'time' builtin

BASE_API="http://localhost:8080"
BASE_LEX="http://localhost:8000"

# 1. Teste de busca de 10k skills (simulado) – mede tempo de resposta
echo "Teste de busca vetorial (Level 1)"
/usr/bin/time -f "Tempo: %e s" curl -s -X GET "$BASE_API/skills/search?q=contrato&limit=10" > /dev/null

# 2. Teste de concorrência Lex – 5 sessões paralelas criando skill
echo "Teste de concorrência Lex (5 sessões simultâneas)"
for i in {1..5}; do
  (
    SESSION=$(curl -s -X POST "$BASE_LEX/lex/sessions" | jq -r .session_id)
    curl -s -X POST "$BASE_LEX/lex/sessions/$SESSION/messages" \
      -H "Content-Type: application/json" \
      -d '{"role":"user","content":"{\"task\":\"Criar skill teste $i\",\"context\":\"Direito civil\"}"}' > /dev/null
    curl -s -X GET "$BASE_LEX/lex/sessions/$SESSION/skill" > /dev/null
  ) &
done
wait

echo "Performance test concluído."
