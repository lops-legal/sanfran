---
name: revisao-formal-peca
description: >-
  Faz a revisão formal de uma petição antes do protocolo — endereçamento, qualificação,
  número do processo, valor da causa, pedidos, provas, documentos, prazo e assinatura — e
  devolve a lista de correções com o dispositivo de cada exigência. Use quando o estagiário
  ou o advogado quiser conferir uma inicial, contestação ou recurso antes de enviar ao
  supervisor ou protocolar.
license: MIT
metadata:
  author: sanfran
  version: "1.0.0"
---

# Revisão formal da peça antes do protocolo

## Quando usar
- A peça está pronta e vai para o supervisor ou para o protocolo.
- O estagiário quer aprender o que o supervisor vai cobrar.
- A peça voltou com pedido de emenda e é preciso evitar o erro de novo.

## Como trabalhar

1. **Identifique o tipo**: petição inicial, contestação, réplica, apelação, agravo de instrumento, embargos de declaração ou manifestação simples.
2. **Rode o checklist** comum + o do tipo. Marque cada item como ✅ ok, ⚠️ conferir ou ❌ falta.
3. **Use os motores** sempre que houver número ou prazo:
   - números de processo → `validar_numero_cnj`;
   - tempestividade → `calcular_prazo` (com a data de disponibilização ou intimação).
4. **Não reescreva o mérito.** Esta skill revisa forma; se notar problema de conteúdo grave, aponte em uma linha separada.

### Checklist comum
- Endereçamento ao juízo ou tribunal correto (vara, comarca, câmara).
- Número do processo válido e igual em todas as páginas.
- Nome e qualificação das partes coerentes com os autos.
- Procuração nos autos ou juntada (art. 104; art. 287 para inicial).
- Pedidos claros, numerados e coerentes com a fundamentação.
- Citações de lei e jurisprudência com dispositivo/número — sem ementa inventada.
- Data, local, nome e OAB do advogado; assinatura eletrônica.

### Petição inicial (CPC, arts. 319 e 320)
- Fatos e fundamentos jurídicos do pedido (319, III).
- Pedido com especificações (319, IV); pedido certo e determinado (arts. 322 e 324).
- **Valor da causa** coerente com o pedido (319, V; arts. 291 e 292).
- Provas com que pretende demonstrar os fatos (319, VI).
- Opção pela realização ou não de audiência de conciliação (319, VII).
- Documentos indispensáveis (art. 320).
- Gratuidade: pedido e declaração, se for o caso (art. 99).

### Contestação (arts. 335 a 342)
- Tempestividade (15 dias úteis, art. 335).
- Preliminares do art. 337 **antes** do mérito.
- Impugnação **específica** de cada fato (art. 341) — impugnação genérica gera presunção de veracidade.
- Reconvenção, se houver, na própria contestação (art. 343).

### Recursos
- Apelação: nomes e qualificação, exposição do fato e do direito, razões do pedido de reforma ou de decretação de nulidade, pedido de nova decisão (art. 1.010); preparo (art. 1.007).
- Agravo de instrumento: hipótese do art. 1.015 indicada; peças obrigatórias em autos físicos (art. 1.017); comunicação ao juízo de origem quando exigida (art. 1.018).
- Embargos de declaração: indicação do vício (omissão, contradição, obscuridade ou erro material — art. 1.022) e prazo de 5 dias.

## Como responder

1. **Veredito** em uma linha: "Pronta para protocolo", "Pronta com ajustes" ou "Não protocolar ainda".
2. Tabela: `| # | Item | Situação | Onde está na peça | Correção sugerida | Dispositivo |` — primeiro os ❌, depois ⚠️.
3. **Três dicas de aprendizado** (para estagiários): o porquê dos erros mais relevantes, em linguagem direta.

## Regras que costumam ser erradas
- Valor da causa "para fins de alçada" quando o pedido tem conteúdo econômico definido (art. 292).
- Pedido genérico fora das hipóteses do art. 324, § 1º.
- Esquecer de manifestar interesse ou desinteresse na audiência de conciliação.
- Recurso protocolado no juízo errado (agravo de instrumento vai direto ao tribunal — art. 1.016).

## Limites
- Não confere exigências de regimento interno, de tamanho de arquivo ou de formato do sistema do tribunal.
- Não valida a tese jurídica; só a forma e os requisitos legais.
