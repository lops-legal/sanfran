---
name: incidente-seguranca-anpd
description: >-
  Avalia um incidente de segurança com dados pessoais (vazamento, acesso indevido, ransomware,
  e-mail enviado ao destinatário errado) e decide se é preciso comunicar a ANPD e os
  titulares, em que prazo e com que conteúdo; redige a comunicação e o registro interno.
  Use quando o encarregado (DPO), o jurídico ou a TI relatar um incidente.
license: MIT
metadata:
  author: sanfran
  version: "1.0.0"
---

# Incidente de segurança com dados pessoais

## Quando usar
- Houve (ou há suspeita de) vazamento, acesso não autorizado, perda ou indisponibilidade de dados pessoais.
- O DPO precisa decidir rápido se comunica a ANPD e os titulares.
- É preciso documentar um incidente, mesmo sem comunicação, para o registro obrigatório.

## Como trabalhar

1. **Fatos mínimos** — pergunte o que faltar: o que aconteceu, quando ocorreu, **quando a empresa tomou conhecimento**, quais dados, de quantos titulares, se há crianças/adolescentes ou idosos, se os dados estavam criptografados, o que já foi feito para conter.
2. **É incidente com dados pessoais?** Se não envolve dado pessoal (art. 5º, I), registre e encerre.
3. **Pode acarretar risco ou dano relevante aos titulares?** (LGPD, art. 48; Res. CD/ANPD 15/2024). Considere relevante quando o incidente puder afetar significativamente interesses e direitos fundamentais dos titulares **e** envolver ao menos um destes fatores:
   - dados sensíveis (art. 5º, II);
   - dados de crianças, adolescentes ou idosos;
   - dados financeiros;
   - dados de autenticação (senhas, tokens);
   - dados protegidos por sigilo legal, judicial ou profissional;
   - dados em larga escala.
   Criptografia forte com chave não comprometida reduz o risco — registre a justificativa.
4. **Prazo**: comunicação à ANPD e aos titulares em **3 dias úteis** a contar do conhecimento de que o incidente afetou dados pessoais. Informações ainda não disponíveis podem ser complementadas depois, com justificativa.
5. **Registro**: todo incidente — comunicado ou não — vai para o registro interno, mantido por pelo menos 5 anos.

## Como responder

1. **Decisão** em destaque: "Comunicar ANPD e titulares até [data]" ou "Não comunicar — registrar".
2. **Fundamentação** em 3 a 5 linhas (fatores de risco presentes ou ausentes).
3. **Plano das próximas 72 horas**: conter, preservar evidências, avaliar, comunicar.
4. **Rascunho da comunicação à ANPD** com: descrição da natureza dos dados; titulares envolvidos (número e categorias); medidas técnicas de segurança adotadas; riscos; motivos de eventual demora; medidas para reverter ou mitigar (art. 48, § 1º).
5. **Rascunho da comunicação aos titulares**: linguagem simples, o que aconteceu, quais dados, o que a empresa fez, o que o titular deve fazer (ex.: trocar senha, atenção a golpes), canal de contato do encarregado.
6. **Ficha do registro interno**.

## Regras que costumam ser erradas
- Contar o prazo da data do incidente: conta do **conhecimento** pelo controlador.
- Esperar o fim da investigação para comunicar: comunique no prazo e complemente depois.
- Achar que operador comunica a ANPD: quem comunica é o **controlador**; o operador avisa o controlador sem demora.
- Comunicar titulares com texto técnico ou que minimize o ocorrido.

## Limites
- Não faz perícia técnica nem avalia a extensão real do vazamento.
- Setores regulados podem ter deveres adicionais (Banco Central, ANS, CVM); confira.
- Confirme no site da ANPD o formulário e o canal de comunicação vigentes.
