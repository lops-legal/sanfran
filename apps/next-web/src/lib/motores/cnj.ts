/**
 * Numeração única de processos — Resolução CNJ nº 65/2008.
 * Porta em TypeScript de content/skills/cnj-numero/scripts/cnj.py (mesmas regras e testes).
 *
 * DV = 98 − ((NNNNNNN AAAA J TR OOOO) × 100 mod 97)   — ISO 7064 MOD 97-10, Anexo VIII.
 */

export const SEGMENTOS: Record<string, string> = {
  "1": "Supremo Tribunal Federal",
  "2": "Conselho Nacional de Justiça",
  "3": "Superior Tribunal de Justiça",
  "4": "Justiça Federal",
  "5": "Justiça do Trabalho",
  "6": "Justiça Eleitoral",
  "7": "Justiça Militar da União",
  "8": "Justiça dos Estados e do Distrito Federal e Territórios",
  "9": "Justiça Militar Estadual",
};

const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SE", "SP", "TO"];
const pad2 = (n: number) => String(n).padStart(2, "0");
const range = (a: number, b: number, f: (i: number) => string) =>
  Object.fromEntries(Array.from({ length: b - a + 1 }, (_, k) => [pad2(a + k), f(a + k)]));

export const TRIBUNAIS: Record<string, Record<string, string>> = {
  "1": { "00": "STF" },
  "2": { "00": "CNJ" },
  "3": { "00": "STJ" },
  "4": { "90": "CJF", ...range(1, 6, (i) => `TRF${i}`) },
  "5": { "00": "TST", "90": "CSJT", ...range(1, 24, (i) => `TRT${i}`) },
  "6": { "00": "TSE", ...range(1, 27, (i) => `TRE-${UFS[i - 1]}`) },
  "7": { "00": "STM", ...range(1, 12, (i) => `${i}ª CJM`) },
  "8": range(1, 27, (i) => (UFS[i - 1] === "DF" ? "TJDFT" : `TJ${UFS[i - 1]}`)),
  "9": { "13": "TJMMG", "21": "TJMRS", "26": "TJMSP" },
};

export interface ResultadoCNJ {
  entrada: string;
  valido: boolean;
  numero_formatado: string | null;
  sequencial: string | null;
  digito_verificador: string | null;
  ano: string | null;
  segmento_codigo: string | null;
  segmento_nome: string | null;
  tribunal_codigo: string | null;
  tribunal_sigla: string | null;
  origem: string | null;
  origem_e_tribunal: boolean | null;
  dv_esperado: string | null;
  erros: string[];
  alertas: string[];
}

/** (base × 100) mod 97 sem perder precisão: processa a string de dígitos em blocos. */
function mod97(digits: string): number {
  let r = 0;
  for (const ch of digits) r = (r * 10 + Number(ch)) % 97;
  return r;
}

export function calcularDV(sequencial: string, ano: string, segmento: string, tribunal: string, origem: string): string {
  return pad2(98 - mod97(`${sequencial}${ano}${segmento}${tribunal}${origem}00`));
}

export function formatarCNJ(d: string): string {
  return `${d.slice(0, 7)}-${d.slice(7, 9)}.${d.slice(9, 13)}.${d[13]}.${d.slice(14, 16)}.${d.slice(16, 20)}`;
}

export function analisarCNJ(entrada: string, hoje: Date = new Date()): ResultadoCNJ {
  const digitos = entrada.replace(/\D/g, "");
  const r: ResultadoCNJ = {
    entrada, valido: false, numero_formatado: null, sequencial: null, digito_verificador: null, ano: null,
    segmento_codigo: null, segmento_nome: null, tribunal_codigo: null, tribunal_sigla: null, origem: null,
    origem_e_tribunal: null, dv_esperado: null, erros: [], alertas: [],
  };

  if (digitos.length !== 20) {
    r.erros.push(`Esperados 20 dígitos, encontrados ${digitos.length}.`);
    return r;
  }

  const [n, dd, aaaa, j, tr, oooo] = [digitos.slice(0, 7), digitos.slice(7, 9), digitos.slice(9, 13), digitos[13], digitos.slice(14, 16), digitos.slice(16, 20)];
  Object.assign(r, {
    numero_formatado: formatarCNJ(digitos), sequencial: n, digito_verificador: dd, ano: aaaa,
    segmento_codigo: j, tribunal_codigo: tr, origem: oooo, origem_e_tribunal: oooo === "0000",
  });

  if (!SEGMENTOS[j]) {
    r.erros.push(`Segmento de justiça '${j}' inexistente (válidos: 1 a 9).`);
  } else {
    r.segmento_nome = SEGMENTOS[j];
    r.tribunal_sigla = TRIBUNAIS[j][tr] ?? null;
    if (!r.tribunal_sigla) r.erros.push(`Tribunal '${tr}' não existe no segmento ${j} (${SEGMENTOS[j]}).`);
  }

  r.dv_esperado = calcularDV(n, aaaa, j, tr, oooo);
  if (dd !== r.dv_esperado) r.erros.push(`Dígito verificador inválido: informado ${dd}, esperado ${r.dv_esperado}.`);

  const ano = Number(aaaa);
  if (ano > hoje.getFullYear()) r.erros.push(`Ano ${aaaa} posterior ao ano corrente.`);
  else if (ano < 2010) r.alertas.push(`Ano ${aaaa}: anterior à vigência plena da numeração única (2010); confira a numeração de origem.`);

  r.valido = r.erros.length === 0;
  return r;
}

const RE_CNJ = /(?<!\d)\d{7}-?\d{2}\.?\d{4}\.?\d\.?\d{2}\.?\d{4}(?!\d)/g;

/** Extrai números CNJ (com ou sem máscara) de texto livre, sem duplicatas, na ordem em que aparecem. */
export function extrairCNJ(texto: string): string[] {
  return [...new Set([...texto.matchAll(RE_CNJ)].map((m) => m[0].replace(/\D/g, "")))];
}
