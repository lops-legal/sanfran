#!/usr/bin/env python3
"""
Contagem de prazo processual em dias úteis (CPC e CLT), com memória de cálculo dia a dia.

Regras implementadas
- Dias úteis: CPC, art. 219; CLT, art. 775.
- Exclui o dia do começo e inclui o do vencimento; começo e vencimento em dia de expediente
  reduzido são protraídos para o dia útil seguinte (CPC, art. 224, caput e § 1º).
- Diário eletrônico (DJEN/DJe): publicação no 1º dia útil seguinte à disponibilização; a contagem
  começa no 1º dia útil seguinte à publicação (Lei 11.419/2006, art. 4º, §§ 3º e 4º; CPC, art. 224, §§ 2º e 3º).
- Portal eletrônico: intimação na data da consulta (em dia não útil, no 1º dia útil seguinte) ou,
  sem consulta, ao fim de 10 dias corridos do envio (Lei 11.419/2006, art. 5º, §§ 1º a 3º).
- Suspensão de 20/12 a 20/01 (CPC, art. 220; CLT, art. 775-A).

Feriados vêm de ../feriados-forenses/dados/feriados.json (ou --dados). Dois cenários:
- principal ("seguro"): só feriados previstos em lei e dias informados pelo usuário;
- com calendário do tribunal: acrescenta os dias habituais sem expediente ainda não conferidos para o ano.

Uso:
    python prazo.py --regime cpc --tribunal TJSP --meio djen --data 2025-11-14 --dias 15
    python prazo.py --regime clt --tribunal TRT2 --meio portal --data 2026-03-02 --dias 8 --formato texto

Somente biblioteca padrão.
"""

from __future__ import annotations

import argparse
import json
import sys
import unicodedata
from datetime import date, timedelta
from pathlib import Path

DIAS_SEMANA = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"]
FERIADO_LOCAL_NAO_CONFIRMADO = "Feriado local não confirmado"


def pascoa(ano: int) -> date:
    """Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher, calendário gregoriano)."""
    a, b, c = ano % 19, ano // 100, ano % 100
    d, e = b // 4, b % 4
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = c // 4, c % 4
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    mes = (h + l - 7 * m + 114) // 31
    dia = (h + l - 7 * m + 114) % 31 + 1
    return date(ano, mes, dia)


def _norm(txt: str) -> str:
    return unicodedata.normalize("NFD", txt).encode("ascii", "ignore").decode().strip().lower()


def carregar_dados(caminho: str | None = None) -> dict:
    aqui = Path(__file__).resolve().parent.parent
    candidatos = [Path(caminho)] if caminho else [aqui / "dados" / "feriados.json", aqui.parent / "feriados-forenses" / "dados" / "feriados.json"]
    for c in candidatos:
        if c.exists():
            return json.loads(c.read_text(encoding="utf-8"))
    raise FileNotFoundError("feriados.json não encontrado; use --dados")


def _data_item(item: dict, ano: int) -> date | None:
    if item.get("desde") and ano < item["desde"]:
        return None
    if "pascoa" in item:
        return pascoa(ano) + timedelta(days=item["pascoa"])
    mes, dia = (int(x) for x in item["data"].split("-"))
    return date(ano, mes, dia)


def _no_intervalo(d: date, ini: str, fim: str) -> bool:
    """Intervalo MM-DD que pode atravessar a virada do ano (ex.: 12-20 a 01-20)."""
    md, i, f = d.strftime("%m-%d"), ini, fim
    return (i <= md <= f) if i <= f else (md >= i or md <= f)


class Calendario:
    def __init__(self, dados: dict, regime: str, tribunal: str, uf: str | None, municipio: str | None,
                 extras: list[date], com_calendario: bool):
        self.dados, self.regime = dados, regime
        self.trib = dados["tribunais"].get(tribunal.upper())
        self.uf = (uf or (self.trib["ufs"][0] if self.trib and len(self.trib["ufs"]) == 1 else None) or "").upper() or None
        self.mun_key = f"{self.uf}/{_norm(municipio)}" if (municipio and self.uf) else None
        self.extras = set(extras)
        self.com_calendario = com_calendario
        self._cache: dict[int, dict[date, dict]] = {}

    def _itens_ano(self, ano: int) -> dict[date, dict]:
        if ano in self._cache:
            return self._cache[ano]
        out: dict[date, dict] = {}

        def add(itens: list[dict], origem: str, confirmado: bool):
            for it in itens:
                if not it.get("base", True) and not (self.com_calendario or confirmado):
                    continue
                d = _data_item(it, ano)
                if d and d not in out:
                    out[d] = {**it, "origem": origem}

        add(self.dados["nacionais"], "nacional", True)
        if self.uf:
            add(self.dados.get("estados", {}).get(self.uf, []), f"estadual ({self.uf})", True)
        if self.mun_key:
            add(self.dados.get("municipios", {}).get(self.mun_key, []), "municipal", True)
        if self.trib:
            add(self.trib["itens"], "tribunal", ano in self.trib.get("anos_conferidos", []))
        self._cache[ano] = out
        return out

    def motivo_sem_expediente(self, d: date) -> str | None:
        if d.weekday() >= 5:
            return "fim de semana"
        if d in self.extras:
            return "dia sem expediente informado pelo usuário"
        it = self._itens_ano(d.year).get(d)
        if it and it.get("tipo") != "expediente-reduzido":
            return f"{it['nome']} ({it['fonte']})"
        if self.trib and _no_intervalo(d, self.trib["recesso"]["inicio"], self.trib["recesso"]["fim"]):
            return f"recesso forense ({self.trib['recesso']['fonte']})"
        return None

    def reduzido(self, d: date) -> str | None:
        it = self._itens_ano(d.year).get(d)
        return f"{it['nome']} ({it['fonte']})" if it and it.get("tipo") == "expediente-reduzido" else None

    def motivo_nao_conta(self, d: date) -> str | None:
        m = self.motivo_sem_expediente(d)
        if m:
            return m
        s = self.dados["suspensao_prazos"]
        if _no_intervalo(d, s["inicio"], s["fim"]):
            return f"suspensão dos prazos ({s['fontes'][self.regime]})"
        return None

    def dias_tribunal_aplicados(self, inicio: date, fim: date) -> list[dict]:
        res, d = [], inicio
        while d <= fim:
            it = self._itens_ano(d.year).get(d)
            if it and it["origem"] == "tribunal" and not it.get("base", True):
                res.append({"data": d.isoformat(), "nome": it["nome"], "fonte": it["fonte"]})
            d += timedelta(days=1)
        return res


def _proximo(d: date, pred) -> date:
    d += timedelta(days=1)
    while not pred(d):
        d += timedelta(days=1)
    return d


def _contar(cal: Calendario, meio: str, data_ref: date, dias: int, consulta: date | None, ficta_prorrogada: bool):
    """Retorna marcos e vencimento para um cenário de calendário."""
    tem_expediente = lambda d: cal.motivo_sem_expediente(d) is None
    pode_comecar_ou_vencer = lambda d: cal.motivo_nao_conta(d) is None and cal.reduzido(d) is None
    marcos: dict[str, date] = {}
    notas: list[str] = []

    if meio == "djen":
        marcos["disponibilização"] = data_ref
        ciencia = _proximo(data_ref, tem_expediente)
        marcos["publicação"] = ciencia
    elif meio == "portal":
        marcos["envio"] = data_ref
        if consulta:
            ciencia = consulta if tem_expediente(consulta) else _proximo(consulta, tem_expediente)
            if ciencia != consulta:
                notas.append("Consulta em dia não útil: intimação considerada no 1º dia útil seguinte (Lei 11.419/2006, art. 5º, § 2º).")
        else:
            ciencia = data_ref + timedelta(days=10)
            if ficta_prorrogada and not tem_expediente(ciencia):
                ciencia = _proximo(ciencia, tem_expediente)
        marcos["ciência"] = ciencia
    else:  # data em que a intimação se considera feita (ex.: juntada do mandado, ciência pessoal)
        ciencia = data_ref
        marcos["intimação"] = ciencia

    inicio = _proximo(ciencia, pode_comecar_ou_vencer)
    marcos["início"] = inicio
    n, d, ultimo = 1, inicio, inicio
    while n < dias:
        d += timedelta(days=1)
        if cal.motivo_nao_conta(d) is None:
            n += 1
            ultimo = d
    venc = ultimo
    if cal.reduzido(venc):
        notas.append(f"Vencimento em dia de expediente reduzido ({cal.reduzido(venc)}): protraído para o dia útil seguinte (CPC, art. 224, § 1º).")
        venc = _proximo(venc, pode_comecar_ou_vencer)
    marcos["vencimento"] = venc
    return marcos, notas


def _memoria(cal: Calendario, marcos: dict[str, date], dias: int) -> list[dict]:
    rotulos: dict[date, list[str]] = {}
    for nome, d in marcos.items():
        rotulos.setdefault(d, []).append(nome)
    inicio, venc = marcos["início"], marcos["vencimento"]
    d, n, linhas = min(marcos.values()), 0, []
    while d <= venc:
        motivo = cal.motivo_nao_conta(d)
        conta = inicio <= d and motivo is None and n < dias
        if conta:
            n += 1
        red = cal.reduzido(d)
        linhas.append({
            "data": d.isoformat(),
            "dia_semana": DIAS_SEMANA[d.weekday()],
            "conta": conta,
            "n": n if conta else None,
            "motivo": None if conta else (motivo or (red and f"expediente reduzido: {red}") or ("antes do início da contagem" if d < inicio else "prazo já completo; vencimento protraído")),
            "marcos": rotulos.get(d, []),
        })
        d += timedelta(days=1)
    return linhas


def calcular(regime: str, tribunal: str, meio: str, data_ref: date, dias: int, *, consulta: date | None = None,
             uf: str | None = None, municipio: str | None = None, em_dobro: bool = False,
             feriados_extras: list[date] | None = None, dados: dict | None = None) -> dict:
    regime, meio = regime.lower(), meio.lower()
    if regime not in ("cpc", "clt"):
        raise ValueError("regime deve ser 'cpc' ou 'clt'")
    if meio not in ("djen", "portal", "intimacao"):
        raise ValueError("meio deve ser 'djen', 'portal' ou 'intimacao'")
    if not 1 <= dias <= 365:
        raise ValueError("dias deve estar entre 1 e 365")
    dados = dados or carregar_dados()
    extras = feriados_extras or []
    prazo = dias * 2 if em_dobro else dias

    base = Calendario(dados, regime, tribunal, uf, municipio, extras, com_calendario=False)
    marcos, notas = _contar(base, meio, data_ref, prazo, consulta, ficta_prorrogada=False)
    alertas: list[str] = list(notas)

    if not base.trib:
        alertas.append(f"{FERIADO_LOCAL_NAO_CONFIRMADO}: o tribunal '{tribunal}' ainda não está na base; aplicamos só feriados nacionais"
                       f"{' e estaduais' if base.uf else ''}. Confira o calendário do tribunal.")
    if not base.mun_key or base.mun_key not in dados.get("municipios", {}):
        alertas.append(f"{FERIADO_LOCAL_NAO_CONFIRMADO}: feriados municipais da comarca"
                       f"{' de ' + municipio if municipio else ''} não estão na base. Se houver, informe-os como dias sem expediente (feriados_extras).")

    resultado = {
        "regime": regime.upper(), "tribunal": tribunal.upper(), "meio": meio, "dias": prazo,
        "datas": {k: v.isoformat() for k, v in marcos.items()},
        "vencimento": marcos["vencimento"].isoformat(),
        "memoria": _memoria(base, marcos, prazo),
        "cenario_calendario_tribunal": None,
        "alertas": alertas,
        "fundamentos": _fundamentos(regime, meio),
    }

    if base.trib:
        cal = Calendario(dados, regime, tribunal, uf, municipio, extras, com_calendario=True)
        m2, n2 = _contar(cal, meio, data_ref, prazo, consulta, ficta_prorrogada=False)
        aplicados = cal.dias_tribunal_aplicados(min(m2.values()), m2["vencimento"])
        ano = data_ref.year
        if aplicados and ano not in base.trib.get("anos_conferidos", []):
            if m2["vencimento"] != marcos["vencimento"]:
                resultado["cenario_calendario_tribunal"] = {
                    "vencimento": m2["vencimento"].isoformat(),
                    "datas": {k: v.isoformat() for k, v in m2.items()},
                    "dias_aplicados": aplicados,
                    "notas": n2,
                    "memoria": _memoria(cal, m2, prazo),
                }
            nomes = "; ".join(f"{a['data']} {a['nome']}" for a in aplicados)
            alertas.append(f"{FERIADO_LOCAL_NAO_CONFIRMADO}: o calendário de {ano} do {base.trib['nome']} ainda não foi conferido. "
                           f"Dias habitualmente sem expediente no período: {nomes}. "
                           + (f"Se confirmados, o vencimento passa para {m2['vencimento'].isoformat()}. " if m2["vencimento"] != marcos["vencimento"] else "")
                           + f"Fonte a conferir: {base.trib['calendario_oficial']}.")
            alertas.append("Se o prazo depender de feriado local, comprove-o no ato de interposição do recurso (CPC, art. 1.003, § 6º, red. Lei 14.939/2024).")

    if meio == "portal" and not consulta:
        alt = Calendario(dados, regime, tribunal, uf, municipio, extras, com_calendario=False)
        m3, _ = _contar(alt, meio, data_ref, prazo, consulta, ficta_prorrogada=True)
        if m3["vencimento"] != marcos["vencimento"]:
            alertas.append(f"O 10º dia após o envio ({marcos['ciência'].isoformat()}) não é dia útil. Há tribunais que prorrogam a ciência ficta para o 1º dia útil seguinte; "
                           f"nesse entendimento o vencimento seria {m3['vencimento'].isoformat()}. Por segurança, adotamos a data mais cedo.")

    s = dados["suspensao_prazos"]
    if any(not l["conta"] and l["motivo"] and l["motivo"].startswith("suspensão") for l in resultado["memoria"]):
        alertas.append(f"O prazo atravessou a suspensão de {s['inicio'][3:]}/{s['inicio'][:2]} a {s['fim'][3:]}/{s['fim'][:2]} ({s['fontes'][regime]}).")
    if em_dobro:
        alertas.append(f"Prazo contado em dobro ({dias} → {prazo} dias). Confira o fundamento (ex.: CPC, arts. 180, 183, 186 e 229).")
    if consulta and consulta > data_ref + timedelta(days=10):
        alertas.append("A consulta informada é posterior ao 10º dia do envio: vale a ciência ficta. Confira as datas.")
    return resultado


def _fundamentos(regime: str, meio: str) -> list[str]:
    f = ["CPC, art. 219 (dias úteis)", "CPC, art. 224 (exclusão do dia do começo; protração)"] if regime == "cpc" else \
        ["CLT, art. 775 (dias úteis; exclusão do dia do começo)", "CPC, art. 224, § 1º, c/c CLT, art. 769 (protração)"]
    f.append("CPC, art. 220 (suspensão de 20/12 a 20/01)" if regime == "cpc" else "CLT, art. 775-A (suspensão de 20/12 a 20/01)")
    if meio == "djen":
        f.append("Lei 11.419/2006, art. 4º, §§ 3º e 4º; CPC, art. 224, §§ 2º e 3º (Diário eletrônico)")
    elif meio == "portal":
        f.append("Lei 11.419/2006, art. 5º (intimação pelo portal; ciência ficta em 10 dias corridos)")
    return f


def _texto(r: dict) -> str:
    linhas = [f"Prazo de {r['dias']} dias úteis ({r['regime']}, {r['tribunal']}, meio: {r['meio']})",
              *(f"  {k.capitalize()}: {v}" for k, v in r["datas"].items()), f"VENCIMENTO: {r['vencimento']}", "",
              "| Data | Dia | Conta? | Nº | Motivo / marco |", "|---|---|---|---|---|"]
    for l in r["memoria"]:
        extra = ", ".join(l["marcos"]) + (" — " if l["marcos"] and l["motivo"] else "") + (l["motivo"] or "") if (l["marcos"] or l["motivo"]) else ""
        linhas.append(f"| {l['data']} | {l['dia_semana']} | {'sim' if l['conta'] else 'não'} | {l['n'] or ''} | {extra} |")
    if r["alertas"]:
        linhas += ["", "Alertas:", *(f"- {a}" for a in r["alertas"])]
    return "\n".join(linhas)


def _main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Contagem de prazo processual (CPC/CLT) com feriados forenses.")
    p.add_argument("--regime", required=True, choices=["cpc", "clt"])
    p.add_argument("--tribunal", required=True, help="Ex.: TJSP, TRT2, TRF3")
    p.add_argument("--meio", required=True, choices=["djen", "portal", "intimacao"])
    p.add_argument("--data", required=True, help="Disponibilização (djen), envio (portal) ou data da intimação (AAAA-MM-DD)")
    p.add_argument("--dias", required=True, type=int)
    p.add_argument("--consulta", help="Data em que o portal foi consultado (opcional)")
    p.add_argument("--uf")
    p.add_argument("--municipio", help="Comarca/município, para feriados municipais")
    p.add_argument("--em-dobro", action="store_true")
    p.add_argument("--feriado", action="append", default=[], help="Dia sem expediente confirmado (repetível)")
    p.add_argument("--dados", help="Caminho alternativo do feriados.json")
    p.add_argument("--formato", choices=["json", "texto"], default="json")
    a = p.parse_args(argv)
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    r = calcular(a.regime, a.tribunal, a.meio, date.fromisoformat(a.data), a.dias,
                 consulta=date.fromisoformat(a.consulta) if a.consulta else None, uf=a.uf, municipio=a.municipio,
                 em_dobro=a.em_dobro, feriados_extras=[date.fromisoformat(f) for f in a.feriado], dados=carregar_dados(a.dados))
    print(json.dumps(r, ensure_ascii=False, indent=2) if a.formato == "json" else _texto(r))
    return 0


if __name__ == "__main__":
    sys.exit(_main())
