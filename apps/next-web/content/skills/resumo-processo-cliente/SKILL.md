---
name: resumo-processo-cliente
description: >-
  Transforma andamentos, decisões e publicações de um processo em um resumo em linguagem
  simples para o cliente: o que aconteceu, o que significa, o que vem a seguir e se ele
  precisa fazer algo. Use quando o advogado precisar responder "como está meu processo?",
  preparar relatório periódico ou explicar uma decisão a quem não é da área.
license: MIT
metadata:
  author: sanfran
  version: "1.0.0"
---

# Resumo do processo para o cliente

## Quando usar
- O cliente perguntou como está o processo.
- Saiu uma decisão importante (liminar, sentença, acórdão) e é preciso explicar.
- Relatório mensal ou trimestral para cliente pessoa física ou empresa.

## Como trabalhar

1. **Reúna o material**: últimos andamentos, a decisão (se houver) e o que o cliente já sabe. Se não souber o perfil do cliente, pergunte: pessoa física leiga, empresa com jurídico interno ou diretoria.
2. **Separe** o que é rotina (juntadas, conclusão ao juiz, remessas) do que muda algo para o cliente.
3. **Traduza** cada termo técnico. Use o glossário abaixo; nunca deixe um termo sem explicação.
4. **Seja honesto sobre incerteza**: não prometa resultado nem prazo de julgamento. Diga o que é provável e o que depende do juiz.
5. Se houver prazo para o cliente agir (juntar documento, pagar custas, comparecer), destaque com data — calculada com `calcular_prazo` quando for prazo processual.

### Glossário rápido
| Termo | Explicação para o cliente |
|---|---|
| Concluso para decisão | O processo está com o juiz para decidir. |
| Juntada | Um documento foi anexado ao processo. |
| Liminar / tutela de urgência | Decisão rápida e provisória, antes do fim do processo. |
| Sentença | Decisão do juiz que encerra esta fase do processo. Ainda cabe recurso. |
| Trânsito em julgado | Não cabe mais recurso; a decisão é definitiva. |
| Cumprimento de sentença | Fase para fazer a outra parte cumprir o que foi decidido (pagar, entregar, fazer). |
| Citação / intimação | Aviso oficial à parte sobre o processo ou sobre um ato. |
| Audiência de conciliação | Reunião para tentar um acordo. |

## Como responder

Formato padrão (adapte o tom ao perfil do cliente):

> **Situação atual:** [uma frase].
> **O que aconteceu:** [2 a 4 frases, em ordem, sem jargão].
> **O que isso significa para você:** [impacto prático: dinheiro, prazo, risco].
> **Próximos passos:** [o que o escritório vai fazer e quando].
> **Você precisa fazer algo?** [Sim — o quê e até quando / Não].

Para empresas: acrescente uma linha de **risco** (baixo/médio/alto) e o valor envolvido, se informado.

## Regras que costumam ser erradas
- Chamar sentença de "vitória definitiva" quando ainda cabe recurso.
- Copiar a ementa ou o dispositivo da decisão em vez de explicar.
- Prometer prazo de julgamento ("sai mês que vem").
- Incluir dados de outros processos ou de terceiros: o resumo vai só para o cliente daquele processo (sigilo profissional).

## Limites
- O resumo depende do que foi informado; não consulta os autos.
- A estratégia e a previsão de resultado são do advogado responsável.
