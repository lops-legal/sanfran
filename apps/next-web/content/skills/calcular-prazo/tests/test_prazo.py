"""Testes da skill calcular-prazo. Rodar de dentro da pasta da skill: python -m unittest discover -s tests

Gabaritos conferidos manualmente contra o calendário (ver comentários em cada caso)."""

import os
import sys
import unittest
from datetime import date as D

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))

from prazo import FERIADO_LOCAL_NAO_CONFIRMADO, calcular, pascoa  # noqa: E402

# (nome, argumentos, vencimento principal, vencimento com calendário do tribunal ou None, publicação/ciência)
CASOS = [
    # 15/11 sáb → publicação 17/11; início 18/11; 20/11 feriado nacional (Lei 14.759/2023); 08/12 só no calendário do TJSP
    ("20/11 e 08/12", dict(regime="cpc", tribunal="TJSP", meio="djen", data_ref=D(2025, 11, 14), dias=15), "2025-12-09", "2025-12-10", "2025-11-17"),
    # publicação 19/12; suspensão 20/12–20/01; início 21/01/2026
    ("virada de ano", dict(regime="cpc", tribunal="TJSP", meio="djen", data_ref=D(2025, 12, 18), dias=15), "2026-02-10", None, "2025-12-19"),
    # disponibilização 19/12: recesso 20/12–06/01 sem expediente → publicação 07/01; início 21/01
    ("disponibilização no recesso", dict(regime="cpc", tribunal="TJSP", meio="djen", data_ref=D(2025, 12, 19), dias=15), "2026-02-10", None, "2026-01-07"),
    # CLT: publicação 21/01 (fim da suspensão não impede publicação); início 22/01; 8 dias úteis
    ("CLT pós-suspensão", dict(regime="clt", tribunal="TRT2", meio="djen", data_ref=D(2026, 1, 20), dias=8), "2026-02-02", None, "2026-01-21"),
    # Carnaval só no calendário do TJSP; com ele, início protraído da Quarta de Cinzas (expediente reduzido) para 19/02
    ("Carnaval TJSP", dict(regime="cpc", tribunal="TJSP", meio="djen", data_ref=D(2026, 2, 12), dias=5), "2026-02-20", "2026-02-25", "2026-02-13"),
    # com calendário, o 6º dia cai na Quarta de Cinzas → protraído para 19/02 (CPC, art. 224, § 1º)
    ("vencimento em expediente reduzido", dict(regime="cpc", tribunal="TJSP", meio="djen", data_ref=D(2026, 2, 5), dias=6), "2026-02-16", "2026-02-19", "2026-02-06"),
    # Justiça Federal: quarta a sexta santas sem expediente por lei (Lei 5.010/1966, art. 62, II)
    ("Semana Santa TRF3", dict(regime="cpc", tribunal="TRF3", meio="djen", data_ref=D(2026, 3, 27), dias=5), "2026-04-09", None, "2026-03-30"),
    ("Semana Santa TJSP", dict(regime="cpc", tribunal="TJSP", meio="djen", data_ref=D(2026, 3, 27), dias=5), "2026-04-06", "2026-04-07", "2026-03-30"),
    # portal sem consulta: ciência ficta em 02/03 + 10 = 12/03
    ("portal ciência ficta", dict(regime="clt", tribunal="TRT2", meio="portal", data_ref=D(2026, 3, 2), dias=8), "2026-03-24", None, "2026-03-12"),
    # 10º dia num sábado: adota-se a leitura literal (mais cedo) e avisa da alternativa (23/03)
    ("ciência ficta em sábado", dict(regime="clt", tribunal="TRT2", meio="portal", data_ref=D(2026, 3, 4), dias=5), "2026-03-20", None, "2026-03-14"),
    ("portal com consulta", dict(regime="cpc", tribunal="TJSP", meio="portal", data_ref=D(2026, 3, 2), dias=5, consulta=D(2026, 3, 4)), "2026-03-11", None, "2026-03-04"),
    # 25/01 (aniversário de São Paulo) só se a comarca for informada
    ("feriado municipal SP", dict(regime="cpc", tribunal="TJSP", meio="djen", data_ref=D(2027, 1, 20), dias=5, municipio="São Paulo"), "2027-01-29", None, "2027-01-21"),
    ("sem comarca", dict(regime="cpc", tribunal="TJSP", meio="djen", data_ref=D(2027, 1, 20), dias=5), "2027-01-28", None, "2027-01-21"),
    # 20/11 só é feriado nacional a partir de 2024
    ("20/11 antes de 2024", dict(regime="cpc", tribunal="TJSP", meio="djen", data_ref=D(2023, 11, 16), dias=5), "2023-11-24", None, "2023-11-17"),
]


class TestGabaritos(unittest.TestCase):
    def test_casos(self):
        for nome, kw, venc, venc_cal, ciencia in CASOS:
            with self.subTest(nome):
                r = calcular(**kw)
                self.assertEqual(r["vencimento"], venc)
                self.assertEqual(r["datas"].get("publicação") or r["datas"].get("ciência"), ciencia)
                cal = r["cenario_calendario_tribunal"]
                self.assertEqual(cal and cal["vencimento"], venc_cal)


class TestRegras(unittest.TestCase):
    def test_pascoa(self):
        self.assertEqual([str(pascoa(a)) for a in (2024, 2025, 2026, 2027)], ["2024-03-31", "2025-04-20", "2026-04-05", "2027-03-28"])

    def test_memoria_conta_exatamente_os_dias(self):
        r = calcular("cpc", "TJSP", "djen", D(2025, 12, 18), 15)
        contados = [l for l in r["memoria"] if l["conta"]]
        self.assertEqual(len(contados), 15)
        self.assertEqual(contados[0]["data"], "2026-01-21")
        self.assertEqual(contados[-1]["data"], r["vencimento"])
        self.assertTrue(any(l["motivo"] and "suspensão" in l["motivo"] for l in r["memoria"]))
        self.assertTrue(any("atravessou a suspensão" in a for a in r["alertas"]))

    def test_20_11_aparece_na_memoria(self):
        r = calcular("cpc", "TJSP", "djen", D(2025, 11, 14), 15)
        linha = next(l for l in r["memoria"] if l["data"] == "2025-11-20")
        self.assertFalse(linha["conta"])
        self.assertIn("Lei 14.759/2023", linha["motivo"])

    def test_feriado_local_nao_confirmado(self):
        r = calcular("cpc", "TJMG", "djen", D(2026, 3, 4), 5)
        self.assertTrue(r["alertas"][0].startswith(FERIADO_LOCAL_NAO_CONFIRMADO))
        r = calcular("cpc", "TJSP", "djen", D(2026, 2, 12), 5, municipio="São Paulo")
        self.assertTrue(any(a.startswith(FERIADO_LOCAL_NAO_CONFIRMADO) and "calendário de 2026" in a for a in r["alertas"]))

    def test_ficta_em_dia_nao_util_avisa_alternativa(self):
        r = calcular("clt", "TRT2", "portal", D(2026, 3, 4), 5)
        self.assertTrue(any("2026-03-23" in a for a in r["alertas"]))

    def test_feriado_informado_pelo_usuario(self):
        r = calcular("cpc", "TJMG", "djen", D(2026, 3, 4), 5, feriados_extras=[D(2026, 3, 9)])
        self.assertEqual(r["vencimento"], "2026-03-13")

    def test_em_dobro(self):
        r = calcular("cpc", "TRF3", "djen", D(2026, 5, 4), 15, em_dobro=True)
        self.assertEqual(r["dias"], 30)
        self.assertEqual(len([l for l in r["memoria"] if l["conta"]]), 30)

    def test_entradas_invalidas(self):
        with self.assertRaises(ValueError):
            calcular("cpp", "TJSP", "djen", D(2026, 3, 4), 5)
        with self.assertRaises(ValueError):
            calcular("cpc", "TJSP", "djen", D(2026, 3, 4), 0)


if __name__ == "__main__":
    unittest.main()
