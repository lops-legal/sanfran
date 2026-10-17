"""Testes da skill cnj-numero. Rodar: python -m unittest discover -s tests (de dentro da pasta da skill)."""

import os
import random
import sys
import unittest
from datetime import date

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))

from cnj import analisar, calcular_dv, extrair, formatar  # noqa: E402

HOJE = date(2026, 10, 17)


def gerar(seq: str, ano: str, j: str, tr: str, origem: str) -> str:
    return formatar(f"{seq}{calcular_dv(seq, ano, j, tr, origem)}{ano}{j}{tr}{origem}")


class TestDigitoVerificador(unittest.TestCase):
    def test_propriedade_iso7064_mod97(self):
        """Para qualquer número, (N AAAA J TR OOOO DD) mod 97 == 1."""
        rnd = random.Random(65)
        for _ in range(5000):
            seq, ano = f"{rnd.randint(0, 9999999):07d}", str(rnd.randint(2010, 2026))
            tr, origem = f"{rnd.randint(1, 27):02d}", f"{rnd.randint(0, 9999):04d}"
            dv = calcular_dv(seq, ano, "8", tr, origem)
            self.assertEqual(int(f"{seq}{ano}8{tr}{origem}{dv}") % 97, 1)

    def test_exemplo_do_repositorio_de_referencia_e_invalido(self):
        """O exemplo usado em skills-teste-docker (DV 34) não passa na fórmula oficial: o correto é 39."""
        r = analisar("0002150-34.2023.8.13.0024", HOJE)
        self.assertFalse(r.valido)
        self.assertEqual(r.dv_esperado, "39")
        self.assertTrue(analisar("0002150-39.2023.8.13.0024", HOJE).valido)

    def test_troca_de_digitos_e_detectada(self):
        bom = gerar("1234567", "2024", "8", "26", "0100")
        seq_trocado = "1243567" + bom[7:]
        self.assertFalse(analisar(seq_trocado, HOJE).valido)


class TestTribunais(unittest.TestCase):
    def casos(self):
        return [
            ("8", "26", "TJSP"), ("8", "07", "TJDFT"), ("8", "13", "TJMG"), ("8", "19", "TJRJ"),
            ("5", "02", "TRT2"), ("5", "00", "TST"), ("5", "24", "TRT24"),
            ("4", "03", "TRF3"), ("4", "06", "TRF6"), ("4", "90", "CJF"),
            ("6", "26", "TRE-SP"), ("6", "00", "TSE"),
            ("3", "00", "STJ"), ("1", "00", "STF"), ("7", "00", "STM"), ("9", "26", "TJMSP"),
        ]

    def test_mapa(self):
        for j, tr, sigla in self.casos():
            with self.subTest(sigla=sigla):
                r = analisar(gerar("0000123", "2024", j, tr, "0001"), HOJE)
                self.assertTrue(r.valido, r.erros)
                self.assertEqual(r.tribunal_sigla, sigla)

    def test_trf4_nao_e_stj(self):
        """Regressão: o repo de referência mapeava J=4/TR=07 como STJ."""
        r = analisar(gerar("0000123", "2024", "4", "07", "0001"), HOJE)
        self.assertFalse(r.valido)
        self.assertIsNone(r.tribunal_sigla)

    def test_segmento_inexistente(self):
        r = analisar(gerar("0000123", "2024", "0", "01", "0001"), HOJE)
        self.assertFalse(r.valido)
        self.assertTrue(any("Segmento" in e for e in r.erros))

    def test_tribunal_inexistente_no_segmento(self):
        r = analisar(gerar("0000123", "2024", "8", "28", "0001"), HOJE)
        self.assertFalse(r.valido)


class TestEntradas(unittest.TestCase):
    def test_sem_mascara_e_com_ruido(self):
        n = gerar("0001234", "2025", "8", "26", "0100")
        digitos = n.replace("-", "").replace(".", "")
        self.assertTrue(analisar(digitos, HOJE).valido)
        self.assertEqual(analisar(f"Proc. {n} (TJSP)", HOJE).numero_formatado, n)

    def test_tamanho_errado(self):
        r = analisar("123", HOJE)
        self.assertFalse(r.valido)
        self.assertIn("20 dígitos", r.erros[0])

    def test_ano_futuro(self):
        self.assertFalse(analisar(gerar("0000001", "2027", "8", "26", "0100"), HOJE).valido)

    def test_ano_antigo_gera_alerta_nao_erro(self):
        r = analisar(gerar("0000001", "2005", "8", "26", "0100"), HOJE)
        self.assertTrue(r.valido)
        self.assertTrue(r.alertas)

    def test_origem_tribunal(self):
        self.assertTrue(analisar(gerar("0000001", "2024", "8", "26", "0000"), HOJE).origem_e_tribunal)

    def test_extrair_lote_sem_duplicatas(self):
        a = gerar("0000001", "2024", "8", "26", "0100")
        b = gerar("0000002", "2023", "5", "02", "0040")
        texto = f"Processos: {a}; {b.replace('-', '').replace('.', '')}; repetido {a}. Telefone 11999998888."
        self.assertEqual(len(extrair(texto)), 2)


if __name__ == "__main__":
    unittest.main()
