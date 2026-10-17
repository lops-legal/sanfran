---
name: cnj-numero
description: >
  Valida, corrige e decompõe números de processo no padrão CNJ
  (NNNNNNN-DD.AAAA.J.TR.OOOO), identificando segmento de justiça, tribunal,
  ano e origem. Use quando receber números de processo colados de sistemas,
  e-mails, planilhas ou publicações; quando precisar conferir dígito
  verificador antes de protocolar ou cadastrar; ou quando quiser extrair
  todos os processos citados num texto.
license: MIT
compatibility: Requer Python 3.9+ (somente biblioteca padrão) para o script; sem rede.
metadata:
  author: sanfran
  version: "1.0.0"
---

# Número de processo CNJ

## Quando usar
- Um número de processo chegou por e-mail, planilha, print ou publicação e precisa ser conferido.
- Antes de cadastrar processo em sistema de gestão ou consultar no DataJud/PJe/e-SAJ.
- Para extrair e validar **todos** os processos citados num texto longo.

## Como executar

**Sempre** rode o script; não calcule o dígito verificador "de cabeça".

```bash
python scripts/cnj.py "0002150-39.2023.8.13.0024"          # um ou vários números
python scripts/cnj.py --arquivo publicacoes.txt --formato csv  # extrai de texto livre
```

O script devolve, por número: `valido`, `numero_formatado`, `tribunal_sigla`, `segmento_nome`, `ano`, `origem`, `dv_esperado`, `erros` e `alertas`. Código de saída 1 se algum número for inválido.

Se não houver ambiente para executar código, aplique manualmente a fórmula do Anexo VIII e diga ao usuário que o resultado não foi verificado por script:

```
DD = 98 − ((NNNNNNN AAAA J TR OOOO) × 100  mod 97)
```

## Como responder

1. **Um número** → diga se é válido, mostre o número formatado, o tribunal por extenso e o ano.
2. **Inválido por dígito verificador** → mostre o DV esperado e o número corrigido, mas avise: *"o número corrigido é matematicamente válido, mas pode não ser o processo que você procura — confirme na fonte"*. Erro de DV normalmente indica erro de digitação em outro campo, não no DV.
3. **Lote** → tabela `| # | Número | Válido | Tribunal | Ano | Problema |`, inválidos primeiro.
4. Nunca invente partes, classe, vara ou assunto: o número não contém essas informações.

## Regras que costumam ser erradas
- `J=4`, `TR=90` é o **CJF**; `J=5`, `TR=00` é o **TST** e `TR=90` o **CSJT**. TRFs vão de 01 a 06 (o TRF6 existe desde 2022).
- `OOOO = 0000` indica competência originária do tribunal (2º grau ou superior).
- `J=9` só existe para TJMMG (13), TJMRS (21) e TJMSP (26).
- TJs e TREs usam a mesma ordem de UFs; `8.07` é o **TJDFT**.

## Limites
- Não consulta tribunais nem confirma que o processo existe.
- Não identifica a vara pelo código `OOOO` (cada tribunal mantém tabela própria).
