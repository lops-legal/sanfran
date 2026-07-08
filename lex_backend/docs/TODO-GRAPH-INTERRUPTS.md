# TODO – Graph Interrupts

- Revisar a utilização de ``graph.set_interrupt_before`` para nós que aguardam resposta.
- Implementar função helper que armazena o estado parcial e devolve ``await_user``.
- Garantir que, ao receber a resposta via endpoint `/interview/continue`, o grafo retome a partir do ponto correto.
- Testar fluxo completo: start -> elicit -> await -> continue -> next node.
