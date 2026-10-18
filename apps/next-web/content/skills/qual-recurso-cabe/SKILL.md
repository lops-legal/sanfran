---
name: qual-recurso-cabe
description: >-
  Identifica qual recurso cabe contra uma decisão judicial (cível, juizados ou trabalhista),
  o prazo, para quem é dirigido e os requisitos que mais derrubam o recurso. Use quando o
  usuário perguntar "cabe agravo?", "qual o recurso dessa sentença?", "tenho quanto tempo
  para recorrer?" ou colar uma decisão pedindo orientação.
license: MIT
metadata:
  author: sanfran
  version: "1.0.0"
---

# Qual recurso cabe

## Quando usar
- Recebeu uma decisão e precisa saber o recurso, o prazo e o órgão de destino.
- Dúvida entre agravo de instrumento, apelação ou só preliminar de apelação.
- Estagiário ou advogado júnior conferindo o cabimento antes de redigir.

## Como trabalhar

1. **Classifique o pronunciamento** (CPC, art. 203): sentença (põe fim à fase de conhecimento ou à execução), decisão interlocutória, despacho (irrecorrível — art. 1.001), acórdão ou decisão monocrática de relator.
2. **Identifique o sistema**: CPC (Justiça comum), Juizados Especiais (Lei 9.099/1995) ou CLT.
3. **Aplique a tabela.** Se houver dúvida real de cabimento, diga isso e explique as duas leituras.
4. **Para o vencimento**, chame `calcular_prazo` (regime `cpc` ou `clt`). Juizados não estão no motor: avise e conte com cautela em dias úteis.

### CPC (prazos em dias úteis — art. 219; todos de 15 dias, salvo embargos de declaração — art. 1.003, § 5º)

| Decisão | Recurso | Prazo | Dispositivo |
|---|---|---|---|
| Sentença | Apelação | 15 | arts. 1.009 a 1.014 |
| Interlocutória das hipóteses do art. 1.015 (tutela provisória, mérito parcial, gratuidade, exclusão de litisconsorte, etc.) | Agravo de instrumento | 15 | arts. 1.015 a 1.020 |
| Interlocutória fora do rol, com urgência que torne inútil o exame na apelação | Agravo de instrumento (taxatividade mitigada) | 15 | Tema 988/STJ |
| Interlocutória fora do rol, sem urgência | Não há recurso imediato: impugne em preliminar de apelação ou contrarrazões | — | art. 1.009, § 1º |
| Decisão monocrática do relator | Agravo interno | 15 | art. 1.021 |
| Qualquer decisão com omissão, contradição, obscuridade ou erro material | Embargos de declaração | **5** | arts. 1.022 e 1.023 |
| Acórdão que contraria lei federal / Constituição | Recurso especial / extraordinário | 15 | CF, arts. 105, III, e 102, III; CPC, art. 1.029 |
| Inadmissão de REsp/RE na origem | Agravo em REsp/RE | 15 | art. 1.042 |

### Juizados Especiais Cíveis

| Decisão | Recurso | Prazo | Dispositivo |
|---|---|---|---|
| Sentença | Recurso inominado (com preparo em 48 h após a interposição) | 10 | Lei 9.099/1995, arts. 41 a 42 |
| Sentença ou acórdão com omissão, contradição ou obscuridade | Embargos de declaração | 5 | arts. 48 e 49 |

### Justiça do Trabalho (prazos de 8 dias — Lei 5.584/1970, art. 6º; contados em dias úteis — CLT, art. 775)

| Decisão | Recurso | Prazo | Dispositivo |
|---|---|---|---|
| Sentença | Recurso ordinário (com depósito recursal e custas) | 8 | CLT, arts. 895 e 899 |
| Decisão na execução | Agravo de petição | 8 | art. 897, a |
| Denegação de seguimento de recurso | Agravo de instrumento | 8 | art. 897, b |
| Acórdão regional (divergência ou violação) | Recurso de revista | 8 | art. 896 |
| Omissão, contradição ou erro material | Embargos de declaração | 5 | art. 897-A |
| Interlocutória | Em regra irrecorrível de imediato (exceções da Súmula 214/TST) | — | art. 893, § 1º |

### Prazo em dobro
Fazenda Pública (art. 183), Ministério Público (art. 180), Defensoria (art. 186) e litisconsortes com advogados de escritórios diferentes **em autos físicos** (art. 229).

## Como responder
1. **Recurso cabível** em uma linha, com o dispositivo.
2. **Prazo** e vencimento (pelo `calcular_prazo`, quando houver a data).
3. **Para quem** e **como** (interposto no juízo de origem ou direto no tribunal — o agravo de instrumento vai direto ao tribunal, art. 1.016).
4. **Três cuidados** específicos do caso (preparo, peças obrigatórias, prequestionamento, dialeticidade).
5. Se houver dúvida de cabimento: as duas leituras e qual é mais segura.

## Regras que costumam ser erradas
- Embargos de declaração **interrompem** o prazo dos demais recursos (art. 1.026), salvo se intempestivos.
- Agravo de instrumento sem as peças obrigatórias em autos físicos (art. 1.017); em autos eletrônicos elas são dispensadas (§ 5º).
- Preparo insuficiente: o recorrente é intimado a complementar em 5 dias (art. 1.007, § 2º); sem recolhimento algum, paga em dobro (§ 4º).
- Recurso que só repete a inicial é inadmitido por falta de dialeticidade (art. 1.010, II e III).

## Limites
- Não substitui a leitura do regimento interno do tribunal nem de regras especiais (falência, execução fiscal, mandado de segurança, ECA).
- Prazo processual penal segue regras próprias (CPP) e não é coberto aqui.
