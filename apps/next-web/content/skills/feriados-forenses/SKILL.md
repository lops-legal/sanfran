---
name: feriados-forenses
description: >-
  Base versionada de feriados e dias sem expediente forense usada na contagem de prazos:
  feriados nacionais (inclusive 20/11), datas móveis calculadas pela Páscoa (Carnaval,
  Semana Santa, Corpus Christi), feriados estaduais e municipais, recesso de 20/12 a 06/01
  e suspensão de prazos de 20/12 a 20/01, com a fonte legal de cada data. Use quando o
  usuário perguntar se há expediente num dia, quais feriados afetam um prazo ou para
  conferir a base usada pela skill calcular-prazo.
license: MIT
metadata:
  author: sanfran
  version: "1.0.0"
---

# Feriados e dias sem expediente forense

## O que há na base (`dados/feriados.json`)

| Bloco | Conteúdo | Fonte |
|---|---|---|
| `nacionais` | 01/01, 21/04, 01/05, 07/09, 12/10, 02/11, 15/11, 20/11 (desde 2024), 25/12 | Lei 662/1949; Lei 6.802/1980; Lei 14.759/2023 |
| `suspensao_prazos` | 20/12 a 20/01 | CPC, art. 220; CLT, art. 775-A |
| `estados.SP` | 09/07 | Lei estadual SP 9.497/1997 |
| `municipios["SP/sao paulo"]` | 25/01, Sexta-feira Santa, Corpus Christi | Lei 9.093/1995 e legislação municipal |
| `tribunais.TRF3` | Recesso 20/12–06/01, Carnaval, quarta a sexta santas, 11/08, 01/11, 08/12 | Lei 5.010/1966, art. 62 |
| `tribunais.TJSP` / `TRT2` | Recesso 20/12–06/01; dias habituais do calendário anual | Res. CNJ 244/2016; calendário de cada tribunal |

Datas móveis são gravadas como deslocamento a partir do Domingo de Páscoa (Carnaval: −48 e −47; Cinzas: −46; Sexta-feira Santa: −2; Corpus Christi: +60).

## Como usar
- Para saber se um prazo é afetado, use a skill **calcular-prazo** (ferramenta `calcular_prazo`): ela lê esta base e mostra, dia a dia, por que cada data não contou.
- Para responder "tem expediente em tal dia no tribunal X?", consulte o arquivo e cite a fonte do item.

## Regras da base
- `base: true` → previsto em lei ou ato normativo geral: entra no vencimento principal.
- `base: false` → dia habitualmente sem expediente no calendário anual do tribunal, **ainda não conferido para o ano**: entra só no cenário alternativo, com o aviso "feriado local não confirmado".
- `anos_conferidos` → anos cujo calendário oficial do tribunal já foi conferido; nesses anos, todos os itens do tribunal passam a valer no vencimento principal.
- `tipo: expediente-reduzido` → o dia conta no meio do prazo, mas não pode ser começo nem vencimento (CPC, art. 224, § 1º).

## Como atualizar
1. Baixe o ato anual do tribunal (provimento, portaria ou ato da Presidência).
2. Ajuste `itens` do tribunal (inclua dias transferidos, como o Dia do Servidor) e acrescente o ano em `anos_conferidos`.
3. Rode os testes da skill calcular-prazo.

## Limites
- Por enquanto: TJSP, TRT2 e TRF3, e feriados municipais só da capital paulista.
- Não inclui fechamentos extraordinários (indisponibilidade de sistema, obras, eventos climáticos).
