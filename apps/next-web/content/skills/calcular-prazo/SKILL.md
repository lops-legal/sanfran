---
name: calcular-prazo
description: >-
  Calcula o vencimento de prazos processuais em dias úteis no CPC e na CLT, a partir da
  disponibilização no DJEN/DJe, do envio pelo portal eletrônico ou da data da intimação,
  considerando feriados nacionais, estaduais, municipais e forenses, recesso e a suspensão
  de 20/12 a 20/01, com memória de cálculo dia a dia. Use quando o usuário perguntar quando
  vence um prazo, quiser conferir a contagem de um colega ou montar a agenda de prazos.
license: MIT
compatibility: Requer Python 3.9+ (somente biblioteca padrão) e o arquivo feriados.json da skill feriados-forenses.
metadata:
  author: sanfran
  version: "1.0.0"
---

# Contagem de prazo processual (CPC e CLT)

## Quando usar
- "A intimação saiu no DJEN em 19/12. Tenho 15 dias para contestar. Quando vence?"
- Conferir a contagem de prazos de uma carteira ou de um colega.
- Explicar ao estagiário ou ao cliente por que o prazo vence em determinado dia.

## Como executar

**Nunca conte os dias de cabeça.** Use a ferramenta `calcular_prazo` (conector sanfran) ou o script:

```bash
python scripts/prazo.py --regime cpc --tribunal TJSP --meio djen --data 2025-12-19 --dias 15 --formato texto
python scripts/prazo.py --regime clt --tribunal TRT2 --meio portal --data 2026-03-02 --dias 8
```

Pergunte ao usuário o que faltar:

| Dado | Valores |
|---|---|
| Regime | `cpc` (cível) ou `clt` (trabalhista) |
| Tribunal | `TJSP`, `TRT2`, `TRF3` (já na base); outros funcionam só com feriados nacionais |
| Meio | `djen` (data de **disponibilização** no diário), `portal` (data de **envio**; informe a consulta, se houver) ou `intimacao` (data em que a intimação se considera feita) |
| Prazo | número de dias; `em_dobro` quando houver prazo em dobro |
| Comarca | município, para feriados municipais (ex.: São Paulo) |
| Dias sem expediente confirmados | datas que o usuário já conferiu no site do tribunal |

## Como responder
1. **Vencimento** em destaque, com o dia da semana.
2. Datas-chave: disponibilização → publicação → início (ou envio → ciência → início).
3. Memória de cálculo em tabela (`Data | Dia | Conta? | Nº | Motivo`), mostrando por que cada dia não contou.
4. Todos os **alertas** retornados, sem resumir. Se houver cenário com o calendário do tribunal, diga: *"Vencimento seguro: X. Se o tribunal confirmar os dias sem expediente abaixo, passa a Y."* Recomende protocolar até a data segura.
5. Os fundamentos legais retornados.

## Regras que costumam ser erradas
- No DJEN/DJe, a **publicação** é o 1º dia útil seguinte à disponibilização, e a contagem começa no dia útil **seguinte à publicação** (Lei 11.419/2006, art. 4º, §§ 3º e 4º; CPC, art. 224, §§ 2º e 3º).
- No portal, sem consulta, a intimação ocorre ao fim de **10 dias corridos** do envio (Lei 11.419/2006, art. 5º, § 3º).
- A CLT conta em **dias úteis** desde a Lei 13.467/2017 (art. 775). Os dois regimes suspendem os prazos de **20/12 a 20/01** (CPC, art. 220; CLT, art. 775-A).
- **20 de novembro** é feriado nacional desde 2024 (Lei 14.759/2023).
- Dia de expediente reduzido (ex.: Quarta-feira de Cinzas com início às 13h) conta no meio do prazo, mas não pode ser dia de começo nem de vencimento (CPC, art. 224, § 1º).
- Na Justiça Federal, quarta a sexta da Semana Santa, segunda e terça de Carnaval, 11/08, 01/11 e 08/12 não têm expediente por lei (Lei 5.010/1966, art. 62).
- O feriado local que altera o prazo de recurso deve ser comprovado no ato de interposição (CPC, art. 1.003, § 6º).

## Limites
- **Feriado local não confirmado**: o vencimento principal usa só feriados previstos em lei. Os dias que dependem do calendário anual do tribunal (Carnaval no TJSP, Corpus Christi etc.) aparecem num cenário alternativo até a base ser conferida para o ano.
- Não considera suspensões extraordinárias (indisponibilidade de sistema, fechamento de fórum por portaria): peça ao usuário que informe essas datas.
- Não define qual é o prazo legal do ato (ex.: 15 dias para contestar).
- Não substitui a conferência no sistema do tribunal antes do protocolo.
