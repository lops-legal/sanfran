// Rodar: npm test. Mesmos gabaritos de content/skills/calcular-prazo/tests/test_prazo.py.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { calcularPrazo, FERIADO_LOCAL_NAO_CONFIRMADO, pascoa, resumoPrazo, type DadosFeriados, type EntradaPrazo } from "../src/lib/motores/prazo.ts";

const DADOS = JSON.parse(
  readFileSync(new URL("../content/skills/feriados-forenses/dados/feriados.json", import.meta.url), "utf8"),
) as DadosFeriados;
const calc = (e: EntradaPrazo) => calcularPrazo(e, DADOS);

// [nome, entrada, vencimento principal, vencimento com calendário do tribunal, publicação/ciência]
const CASOS: [string, EntradaPrazo, string, string | null, string][] = [
  ["20/11 e 08/12", { regime: "cpc", tribunal: "TJSP", meio: "djen", data: "2025-11-14", dias: 15 }, "2025-12-09", "2025-12-10", "2025-11-17"],
  ["virada de ano", { regime: "cpc", tribunal: "TJSP", meio: "djen", data: "2025-12-18", dias: 15 }, "2026-02-10", null, "2025-12-19"],
  ["disponibilização no recesso", { regime: "cpc", tribunal: "TJSP", meio: "djen", data: "2025-12-19", dias: 15 }, "2026-02-10", null, "2026-01-07"],
  ["CLT pós-suspensão", { regime: "clt", tribunal: "TRT2", meio: "djen", data: "2026-01-20", dias: 8 }, "2026-02-02", null, "2026-01-21"],
  ["Carnaval TJSP", { regime: "cpc", tribunal: "TJSP", meio: "djen", data: "2026-02-12", dias: 5 }, "2026-02-20", "2026-02-25", "2026-02-13"],
  ["vencimento em expediente reduzido", { regime: "cpc", tribunal: "TJSP", meio: "djen", data: "2026-02-05", dias: 6 }, "2026-02-16", "2026-02-19", "2026-02-06"],
  ["Semana Santa TRF3", { regime: "cpc", tribunal: "TRF3", meio: "djen", data: "2026-03-27", dias: 5 }, "2026-04-09", null, "2026-03-30"],
  ["Semana Santa TJSP", { regime: "cpc", tribunal: "TJSP", meio: "djen", data: "2026-03-27", dias: 5 }, "2026-04-06", "2026-04-07", "2026-03-30"],
  ["portal ciência ficta", { regime: "clt", tribunal: "TRT2", meio: "portal", data: "2026-03-02", dias: 8 }, "2026-03-24", null, "2026-03-12"],
  ["ciência ficta em sábado", { regime: "clt", tribunal: "TRT2", meio: "portal", data: "2026-03-04", dias: 5 }, "2026-03-20", null, "2026-03-14"],
  ["portal com consulta", { regime: "cpc", tribunal: "TJSP", meio: "portal", data: "2026-03-02", dias: 5, consulta: "2026-03-04" }, "2026-03-11", null, "2026-03-04"],
  ["feriado municipal SP", { regime: "cpc", tribunal: "TJSP", meio: "djen", data: "2027-01-20", dias: 5, municipio: "São Paulo" }, "2027-01-29", null, "2027-01-21"],
  ["sem comarca", { regime: "cpc", tribunal: "TJSP", meio: "djen", data: "2027-01-20", dias: 5 }, "2027-01-28", null, "2027-01-21"],
  ["20/11 antes de 2024", { regime: "cpc", tribunal: "TJSP", meio: "djen", data: "2023-11-16", dias: 5 }, "2023-11-24", null, "2023-11-17"],
];

test("gabaritos", () => {
  for (const [nome, e, venc, vencCal, ciencia] of CASOS) {
    const r = calc(e);
    assert.equal(r.vencimento, venc, nome);
    assert.equal(r.datas["publicação"] ?? r.datas["ciência"], ciencia, nome);
    assert.equal(r.cenario_calendario_tribunal?.vencimento ?? null, vencCal, nome);
  }
});

test("Páscoa", () => {
  assert.deepEqual([2024, 2025, 2026, 2027].map(pascoa), ["2024-03-31", "2025-04-20", "2026-04-05", "2027-03-28"]);
});

test("memória conta exatamente os dias e registra 20/11 e a suspensão", () => {
  const r = calc({ regime: "cpc", tribunal: "TJSP", meio: "djen", data: "2025-12-18", dias: 15 });
  const contados = r.memoria.filter((l) => l.conta);
  assert.equal(contados.length, 15);
  assert.equal(contados[0].data, "2026-01-21");
  assert.equal(contados.at(-1)!.data, r.vencimento);
  assert.ok(r.alertas.some((a) => a.includes("atravessou a suspensão")));
  const n = calc({ regime: "cpc", tribunal: "TJSP", meio: "djen", data: "2025-11-14", dias: 15 });
  const linha = n.memoria.find((l) => l.data === "2025-11-20")!;
  assert.equal(linha.conta, false);
  assert.match(linha.motivo!, /Lei 14\.759\/2023/);
});

test("avisos de feriado local e de ciência ficta", () => {
  const r = calc({ regime: "cpc", tribunal: "TJMG", meio: "djen", data: "2026-03-04", dias: 5 });
  assert.ok(r.alertas[0].startsWith(FERIADO_LOCAL_NAO_CONFIRMADO));
  assert.equal(r.vencimento, "2026-03-12");
  const f = calc({ regime: "clt", tribunal: "TRT2", meio: "portal", data: "2026-03-04", dias: 5 });
  assert.ok(f.alertas.some((a) => a.includes("2026-03-23")));
});

test("dias informados pelo usuário, prazo em dobro e entradas inválidas", () => {
  assert.equal(calc({ regime: "cpc", tribunal: "TJMG", meio: "djen", data: "2026-03-04", dias: 5, feriados_extras: ["2026-03-09"] }).vencimento, "2026-03-13");
  const d = calc({ regime: "cpc", tribunal: "TRF3", meio: "djen", data: "2026-05-04", dias: 15, em_dobro: true });
  assert.equal(d.memoria.filter((l) => l.conta).length, 30);
  assert.throws(() => calc({ regime: "cpp" as "cpc", tribunal: "TJSP", meio: "djen", data: "2026-03-04", dias: 5 }));
  assert.throws(() => calc({ regime: "cpc", tribunal: "TJSP", meio: "djen", data: "2026-02-30", dias: 5 }));
});

test("resumo em texto traz vencimento em formato brasileiro", () => {
  const txt = resumoPrazo(calc({ regime: "cpc", tribunal: "TJSP", meio: "djen", data: "2025-11-14", dias: 15 }));
  assert.match(txt, /^VENCIMENTO: 09\/12\/2025 \(ter\)/);
  assert.match(txt, /Com o calendário do tribunal \(não confirmado\): 10\/12\/2025/);
});
