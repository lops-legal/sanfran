---
name: impugnacao-edital
description: >-
  Analisa um edital de licitação (Lei 14.133/2021) em busca de cláusulas restritivas ou
  irregulares, calcula até quando é possível impugnar ou pedir esclarecimento, e redige a
  impugnação ou o pedido de esclarecimento. Use quando a empresa for participar de licitação
  e encontrar exigência que a exclui ou restringe a competição, ou quando o órgão precisar
  responder a uma impugnação.
license: MIT
metadata:
  author: sanfran
  version: "1.0.0"
---

# Impugnação de edital (Lei 14.133/2021)

## Quando usar
- O edital exige atestado, marca, prazo ou qualificação que parece restringir a competição.
- A empresa precisa saber se ainda dá tempo de impugnar.
- O órgão recebeu impugnação e precisa decidir e responder.

## Como trabalhar

1. **Dados do certame**: número, órgão, modalidade, **data e hora da abertura**, item ou cláusula questionada e por que prejudica a empresa.
2. **Prazo** (art. 164): qualquer pessoa pode impugnar ou pedir esclarecimento **até 3 dias úteis antes da data de abertura** do certame. A resposta deve ser divulgada em sítio eletrônico oficial em até 3 dias úteis, limitada ao último dia útil anterior à abertura.
   - Conte para trás a partir da data de abertura, só dias úteis, excluindo a data da abertura (art. 183). Ex.: abertura na segunda-feira 10/08/2026 → os 3 dias úteis anteriores são 07/08 (sex), 06/08 (qui) e 05/08 (qua) → protocolar até **05/08/2026**, salvo feriado.
   - O motor `calcular_prazo` ainda não cobre licitações: mostre a contagem dia a dia e recomende confirmar feriados locais e o horário de expediente do órgão. Na dúvida, protocole um dia antes.
3. **Análise das cláusulas** com a tabela de vícios frequentes.
4. **Escolha a via**: impugnação (cláusula ilegal) ou pedido de esclarecimento (cláusula ambígua). Esclarecimento não suspende nada; impugnação acolhida pode alterar o edital e, se afetar a formulação das propostas, exige republicação com nova contagem de prazos (art. 55, § 1º).

### Vícios frequentes

| Exigência | Problema | Fundamento |
|---|---|---|
| Marca específica sem justificativa técnica | Restrição à competição | arts. 9º, I, e 41, I |
| Atestados de quantidade acima do razoável | Qualificação técnica excessiva (a lei admite exigir até 50% do quantitativo, salvo justificativa) | art. 67, § 2º |
| Capital ou patrimônio líquido acima do limite | Qualificação econômica excessiva (até 10% do valor estimado) | art. 69, § 4º |
| Exigência de visita técnica obrigatória sem alternativa | Deve-se admitir declaração de conhecimento das condições | art. 63, §§ 2º e 3º |
| Prazo de entrega incompatível com o mercado | Direcionamento | art. 5º (princípios) e art. 18 |
| Aglutinação de itens divisíveis | Restringe a participação; a regra é o parcelamento | art. 40, V, b |

## Como responder

1. **Prazo**: "Impugnação deve ser protocolada até [data] (3 dias úteis antes da abertura em [data])" com a contagem.
2. **Diagnóstico**: tabela `| Cláusula | Problema | Fundamento | Força do argumento (alta/média/baixa) |`.
3. **Peça** endereçada ao agente de contratação/pregoeiro: qualificação da impugnante; tempestividade; fatos; fundamentos (um tópico por cláusula); pedidos (alteração ou supressão da cláusula, republicação com reabertura de prazo, e subsidiariamente esclarecimento).
4. Se o usuário for o **órgão**: minuta de decisão motivada (acolhe, acolhe em parte ou rejeita), com a avaliação de necessidade de republicar.

## Regras que costumam ser erradas
- Contar o prazo em dias corridos ou incluir a data da abertura.
- Impugnar cláusula de que a empresa só discorda comercialmente: impugnação precisa apontar ilegalidade ou restrição indevida.
- Não pedir republicação quando a alteração afeta as propostas.
- Esquecer que a impugnação não impede a participação: a empresa pode impugnar e participar.

## Limites
- Regulamentos locais e o próprio edital podem fixar forma e canal de protocolo; siga-os.
- Valores e percentuais dependem do caso; justificativas técnicas do órgão podem legitimar exigências maiores.
