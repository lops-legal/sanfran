---
name: triagem-intimacoes
description: >-
  Faz a triagem diária de intimações e publicações (DJEN, DJe, portal eletrônico, e-mail do
  escritório): identifica o processo, o ato, a providência exigida, o prazo e a urgência, e
  devolve uma agenda ordenada pelo vencimento. Use quando o usuário colar o recorte de
  publicações do dia, um lote de intimações ou pedir "o que vence esta semana".
license: MIT
metadata:
  author: sanfran
  version: "1.0.0"
---

# Triagem diária de intimações

## Quando usar
- O recorte de publicações do dia chegou e é preciso saber o que fazer em cada processo.
- Um lote de intimações do portal (PJe, e-SAJ, eproc) precisa virar agenda de prazos.
- Revisar a triagem feita por outra pessoa antes de lançar no sistema.

## Como executar

1. **Separe as publicações.** Cada publicação tem um processo. Extraia todos os números com `validar_numero_cnj` (campo `texto`). Número inválido → marque "conferir número" e siga.
2. **Classifique o ato** de cada uma (tabela abaixo) e a **providência**.
3. **Calcule o prazo com `calcular_prazo`** — nunca de cabeça. Informe:
   - `regime`: `cpc` (cível, família, fazenda) ou `clt` (trabalhista);
   - `meio`: `djen` com a **data de disponibilização** (não a de publicação), ou `portal` com a data de envio;
   - `dias`: pela tabela de prazos usuais, salvo se a decisão fixar outro (prazo judicial — art. 218, § 1º);
   - `em_dobro`: se o cliente for Fazenda Pública, MP ou Defensoria, ou litisconsortes com advogados diferentes em autos físicos.
   Se a ferramenta não estiver disponível, escreva "prazo não calculado — conferir" em vez de estimar.
4. **Defina a urgência**: 🔴 vence em até 2 dias úteis ou é liminar/audiência próxima · 🟡 até 5 dias úteis · 🟢 demais.

### Atos e prazos usuais (CPC)

| Ato publicado | Providência típica | Prazo usual |
|---|---|---|
| Citação | Contestação | 15 dias (art. 335) |
| Despacho "manifeste-se" | Manifestação | 5 dias, se o juiz não fixar (art. 218, § 3º) |
| Decisão interlocutória do art. 1.015 | Agravo de instrumento | 15 dias |
| Sentença | Apelação / embargos de declaração | 15 / 5 dias |
| Intimação para pagar (cumprimento) | Pagamento ou impugnação | 15 + 15 dias (arts. 523 e 525) |
| Designação de audiência | Agenda + intimar testemunhas | Data fixada; rol no prazo fixado pelo juiz, de até 15 dias (art. 357, § 4º) |
| Contrarrazões | Resposta ao recurso | 15 dias (art. 1.010, § 1º) |

Trabalhista: recursos em 8 dias (Lei 5.584/1970, art. 6º); embargos de declaração em 5 dias (CLT, art. 897-A).

## Como responder

1. **Resumo**: quantas publicações, quantas exigem providência, quantas são só ciência.
2. **Agenda** ordenada pelo vencimento:

| Urg. | Vencimento | Processo | Tribunal | Ato | Providência | Prazo | Observação |
|---|---|---|---|---|---|---|---|

3. **Só ciência** (sem providência): lista curta.
4. **Pendências**: números inválidos, publicações sem data de disponibilização, feriados locais não confirmados.

## Regras que costumam ser erradas
- Contar a partir da **disponibilização**. No DJEN, a publicação é o primeiro dia útil seguinte e o prazo começa no dia útil depois dela (Lei 11.419/2006, art. 4º, §§ 3º e 4º; CPC, art. 224).
- Esquecer a suspensão de **20/12 a 20/01** (CPC, art. 220; CLT, art. 775-A).
- Tratar "intime-se" sem prazo como prazo de 15 dias: sem fixação, é de 5 dias (art. 218, § 3º).
- Aplicar prazo em dobro a litisconsortes em **autos eletrônicos** (art. 229, § 2º, afasta).
- Na Justiça do Trabalho, interlocutória em regra **não** é recorrível de imediato (CLT, art. 893, § 1º; Súmula 214/TST).

## Limites
- Não acessa os sistemas dos tribunais: trabalha sobre o texto colado.
- O prazo calculado é apoio; a conferência final é do advogado responsável, com o calendário do tribunal.
