# UI/Overlay de Interação com o Lex Bot

Esta documentação descreve como habilitar e usar a camada de **overlay** que exibe o draft da skill gerada e permite enviar a continuação ao endpoint `/interview/continue`.

## 1. Visão geral
- O overlay aparece como um painel flutuante sobre a aplicação web (React) quando o grafo interrompe a execução (`awaiting_user=True`).
- Ele exibe o **draft** (`state["skill_draft"]`) retornado pelo nó `draft`.
- O usuário pode editar o texto livremente e clicar **Continuar** para enviar o estado atualizado ao backend.

## 2. Integração no Frontend
1. **Componente `HumanReviewOverlay.tsx`**
   - Crie um novo componente em `apps/web/src/components/HumanReviewOverlay.tsx` que recebe `draft` e uma callback `onContinue`.
   - Use um `textarea` com auto‑resize (mesmo hook usado em `LexBot.tsx`).
   - Exiba um botão **Continuar** que chama `onContinue(draftEdit)`.
2. **Atualização de `LexBot.tsx`**
   - Detecte mensagens com `awaiting_user` (campo `turn_output.awaiting_user`).
   - Quando verdadeiro, renderize `<HumanReviewOverlay />` passando o draft do último `turn_output`.
   - O callback `onContinue` deve enviar um `POST` para `/interview/continue` com `session_id`, `answer` (texto editado) e o `state` completo.
3. **Endpoint API**
   - O backend já aceita `InterviewContinueRequest`. Nenhuma mudança adicional é necessária.

## 3. Estilos
- O overlay deve usar a mesma paleta escura do `LexBot` (classe `bg-gray-900/80` e `backdrop-blur`).
- Posicione‑o centralizado relative ao viewport e ajuste à largura `max-w-2xl`.

## 4. Testes automatizados
- Adicione testes em `apps/web/src/__tests__/HumanReviewOverlay.test.tsx` verificando:
  - Renderização correta do draft.
  - Chamada da callback ao clicar **Continuar**.
  - Atualização do estado do `LexBot` após a resposta.

## 5. Observabilidade
- Registre no dashboard (Streamlit) as métricas:
  - Número de interações humanas (`human_review` node).
  - Tempo médio entre draft e continuação.

## 6. Referências
- Consulte o skill `floating-terminal-overlay` para padrões de overlay.
- Veja o arquivo `lex_backend/docs/TODO-INTERACTION-LOGGER.md` para hooks de logging.

> **Nota:** Esta documentação é versão inicial. Conforme a implementação evolui, atualize este arquivo com exemplos de código e screenshots.
