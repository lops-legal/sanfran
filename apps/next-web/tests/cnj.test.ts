// Rodar: npm test  (Node 22.18+ executa TypeScript nativamente)
import { test } from "node:test";
import assert from "node:assert/strict";
import { analisarCNJ, calcularDV, extrairCNJ, formatarCNJ } from "../src/lib/motores/cnj.ts";

const HOJE = new Date(2026, 9, 17);
const gerar = (seq: string, ano: string, j: string, tr: string, o: string) =>
  formatarCNJ(`${seq}${calcularDV(seq, ano, j, tr, o)}${ano}${j}${tr}${o}`);

test("propriedade ISO 7064: número reordenado mod 97 == 1", () => {
  for (let i = 0; i < 2000; i++) {
    const seq = String(Math.floor(Math.random() * 1e7)).padStart(7, "0");
    const tr = String(1 + Math.floor(Math.random() * 27)).padStart(2, "0");
    const o = String(Math.floor(Math.random() * 1e4)).padStart(4, "0");
    const dv = calcularDV(seq, "2024", "8", tr, o);
    assert.equal(BigInt(`${seq}20248${tr}${o}${dv}`) % 97n, 1n);
  }
});

test("mesmo resultado que o script Python (exemplo do repositório de referência)", () => {
  const r = analisarCNJ("0002150-34.2023.8.13.0024", HOJE);
  assert.equal(r.valido, false);
  assert.equal(r.dv_esperado, "39");
  assert.equal(analisarCNJ("00001234520255020040", HOJE).dv_esperado, "22");
  assert.ok(analisarCNJ("0002150-39.2023.8.13.0024", HOJE).valido);
});

test("mapa de tribunais", () => {
  const casos: [string, string, string][] = [["8", "26", "TJSP"], ["8", "07", "TJDFT"], ["5", "02", "TRT2"], ["5", "00", "TST"], ["4", "06", "TRF6"], ["4", "90", "CJF"], ["6", "26", "TRE-SP"], ["9", "26", "TJMSP"], ["3", "00", "STJ"]];
  for (const [j, tr, sigla] of casos) {
    const r = analisarCNJ(gerar("0000123", "2024", j, tr, "0001"), HOJE);
    assert.ok(r.valido, `${sigla}: ${r.erros}`);
    assert.equal(r.tribunal_sigla, sigla);
  }
  assert.equal(analisarCNJ(gerar("0000123", "2024", "4", "07", "0001"), HOJE).valido, false, "TRF7 não existe");
});

test("entradas e lote", () => {
  assert.match(analisarCNJ("123", HOJE).erros[0], /20 dígitos/);
  assert.equal(analisarCNJ(gerar("0000001", "2027", "8", "26", "0100"), HOJE).valido, false);
  const r = analisarCNJ(gerar("0000001", "2005", "8", "26", "0100"), HOJE);
  assert.ok(r.valido && r.alertas.length === 1);
  const a = gerar("0000001", "2024", "8", "26", "0100");
  const b = gerar("0000002", "2023", "5", "02", "0040");
  assert.equal(extrairCNJ(`${a}; ${b.replace(/\D/g, "")}; ${a}; tel 11999998888`).length, 2);
});
