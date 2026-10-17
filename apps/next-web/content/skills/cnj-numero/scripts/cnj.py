#!/usr/bin/env python3
"""
Numeração única de processos (Resolução CNJ nº 65/2008).

Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
Dígito verificador: ISO 7064 MOD 97-10, conforme Anexo VIII da resolução:
    DD = 98 - ((NNNNNNN AAAA J TR OOOO) * 100 mod 97)
Equivalente: o número reordenado (NNNNNNN AAAA J TR OOOO DD) mod 97 == 1.

Uso:
    python cnj.py "0002150-34.2023.8.13.0024"
    python cnj.py --arquivo processos.txt --formato csv
    echo "texto com vários números" | python cnj.py --stdin

Somente biblioteca padrão. Não consulta tribunais: faz parse local.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from dataclasses import asdict, dataclass, field
from datetime import date

SEGMENTOS = {
    "1": "Supremo Tribunal Federal",
    "2": "Conselho Nacional de Justiça",
    "3": "Superior Tribunal de Justiça",
    "4": "Justiça Federal",
    "5": "Justiça do Trabalho",
    "6": "Justiça Eleitoral",
    "7": "Justiça Militar da União",
    "8": "Justiça dos Estados e do Distrito Federal e Territórios",
    "9": "Justiça Militar Estadual",
}

# Ordem das UFs usada pela Res. 65/2008 para TJs (J=8) e TREs (J=6).
_UFS = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
    "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SE", "SP", "TO",
]

TRIBUNAIS: dict[str, dict[str, str]] = {
    "1": {"00": "STF"},
    "2": {"00": "CNJ"},
    "3": {"00": "STJ"},
    "4": {"90": "CJF", **{f"{i:02d}": f"TRF{i}" for i in range(1, 7)}},
    "5": {"00": "TST", "90": "CSJT", **{f"{i:02d}": f"TRT{i}" for i in range(1, 25)}},
    "6": {"00": "TSE", **{f"{i:02d}": f"TRE-{uf}" for i, uf in enumerate(_UFS, 1)}},
    "7": {"00": "STM", **{f"{i:02d}": f"{i}ª CJM" for i in range(1, 13)}},
    "8": {f"{i:02d}": ("TJDFT" if uf == "DF" else f"TJ{uf}") for i, uf in enumerate(_UFS, 1)},
    "9": {"13": "TJMMG", "21": "TJMRS", "26": "TJMSP"},
}

_RE_MASCARADO = re.compile(r"(?<!\d)\d{7}-?\d{2}\.?\d{4}\.?\d\.?\d{2}\.?\d{4}(?!\d)")


@dataclass
class ResultadoCNJ:
    entrada: str
    valido: bool
    numero_formatado: str | None = None
    sequencial: str | None = None
    digito_verificador: str | None = None
    ano: str | None = None
    segmento_codigo: str | None = None
    segmento_nome: str | None = None
    tribunal_codigo: str | None = None
    tribunal_sigla: str | None = None
    origem: str | None = None
    origem_e_tribunal: bool | None = None
    dv_esperado: str | None = None
    erros: list[str] = field(default_factory=list)
    alertas: list[str] = field(default_factory=list)


def calcular_dv(sequencial: str, ano: str, segmento: str, tribunal: str, origem: str) -> str:
    """Retorna os 2 dígitos verificadores corretos."""
    base = int(f"{sequencial}{ano}{segmento}{tribunal}{origem}")
    return f"{98 - (base * 100) % 97:02d}"


def formatar(digitos: str) -> str:
    d = digitos
    return f"{d[0:7]}-{d[7:9]}.{d[9:13]}.{d[13]}.{d[14:16]}.{d[16:20]}"


def analisar(entrada: str, hoje: date | None = None) -> ResultadoCNJ:
    hoje = hoje or date.today()
    digitos = re.sub(r"\D", "", entrada)
    r = ResultadoCNJ(entrada=entrada, valido=False)

    if len(digitos) != 20:
        r.erros.append(f"Esperados 20 dígitos, encontrados {len(digitos)}.")
        return r

    n, dd, aaaa, j, tr, oooo = digitos[0:7], digitos[7:9], digitos[9:13], digitos[13], digitos[14:16], digitos[16:20]
    r.numero_formatado = formatar(digitos)
    r.sequencial, r.digito_verificador, r.ano = n, dd, aaaa
    r.segmento_codigo, r.tribunal_codigo, r.origem = j, tr, oooo
    r.origem_e_tribunal = oooo == "0000"

    if j not in SEGMENTOS:
        r.erros.append(f"Segmento de justiça '{j}' inexistente (válidos: 1 a 9).")
    else:
        r.segmento_nome = SEGMENTOS[j]
        sigla = TRIBUNAIS[j].get(tr)
        if sigla is None:
            r.erros.append(f"Tribunal '{tr}' não existe no segmento {j} ({SEGMENTOS[j]}).")
        r.tribunal_sigla = sigla

    r.dv_esperado = calcular_dv(n, aaaa, j, tr, oooo)
    if dd != r.dv_esperado:
        r.erros.append(f"Dígito verificador inválido: informado {dd}, esperado {r.dv_esperado}.")

    ano_int = int(aaaa)
    if ano_int > hoje.year:
        r.erros.append(f"Ano {aaaa} posterior ao ano corrente.")
    elif ano_int < 2010:
        # Números anteriores foram convertidos retroativamente: válidos, mas merecem atenção.
        r.alertas.append(f"Ano {aaaa}: anterior à vigência plena da numeração única (2010); confira a numeração de origem.")

    r.valido = not r.erros
    return r


def extrair(texto: str) -> list[str]:
    """Extrai candidatos a número CNJ (com ou sem máscara) de texto livre, sem duplicatas, na ordem."""
    vistos: dict[str, None] = {}
    for m in _RE_MASCARADO.finditer(texto):
        vistos.setdefault(re.sub(r"\D", "", m.group()), None)
    return list(vistos)


def _main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Valida e decompõe números de processo CNJ.")
    p.add_argument("numeros", nargs="*", help="Números a validar")
    p.add_argument("--arquivo", help="Arquivo de texto com números (qualquer formato)")
    p.add_argument("--stdin", action="store_true", help="Ler texto livre do stdin")
    p.add_argument("--formato", choices=["json", "csv"], default="json")
    a = p.parse_args(argv)
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")  # console do Windows usa cp1252 por padrão

    entradas: list[str] = list(a.numeros)
    if a.arquivo:
        with open(a.arquivo, encoding="utf-8") as f:
            entradas += extrair(f.read())
    if a.stdin:
        entradas += extrair(sys.stdin.read())
    if not entradas:
        p.error("informe ao menos um número, --arquivo ou --stdin")

    resultados = [analisar(e) for e in entradas]
    if a.formato == "json":
        json.dump([asdict(r) for r in resultados], sys.stdout, ensure_ascii=False, indent=2)
        sys.stdout.write("\n")
    else:
        w = csv.writer(sys.stdout)
        w.writerow(["entrada", "valido", "numero_formatado", "tribunal", "ano", "erros"])
        for r in resultados:
            w.writerow([r.entrada, r.valido, r.numero_formatado, r.tribunal_sigla, r.ano, " | ".join(r.erros)])
    return 0 if all(r.valido for r in resultados) else 1


if __name__ == "__main__":
    sys.exit(_main())
