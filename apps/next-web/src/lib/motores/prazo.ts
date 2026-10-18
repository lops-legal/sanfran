/**
 * Contagem de prazo processual em dias úteis (CPC e CLT), com memória de cálculo.
 * Porta em TypeScript de content/skills/calcular-prazo/scripts/prazo.py — mesmas regras e gabaritos.
 * Datas são tratadas como número de dias desde 1970-01-01 (UTC), sem fuso horário.
 */

export interface ItemFeriado {
  data?: string; // MM-DD
  pascoa?: number; // deslocamento a partir do Domingo de Páscoa
  nome: string;
  fonte: string;
  base?: boolean;
  desde?: number;
  tipo?: string;
}

export interface TribunalFeriados {
  nome: string;
  segmento: string;
  ufs: string[];
  recesso: { inicio: string; fim: string; fonte: string };
  calendario_oficial: string;
  anos_conferidos: number[];
  itens: ItemFeriado[];
}

export interface DadosFeriados {
  versao: string;
  suspensao_prazos: { inicio: string; fim: string; fontes: Record<"cpc" | "clt", string> };
  nacionais: ItemFeriado[];
  estados: Record<string, ItemFeriado[]>;
  municipios: Record<string, ItemFeriado[]>;
  tribunais: Record<string, TribunalFeriados>;
}

export type Regime = "cpc" | "clt";
export type Meio = "djen" | "portal" | "intimacao";

export interface LinhaMemoria {
  data: string;
  dia_semana: string;
  conta: boolean;
  n: number | null;
  motivo: string | null;
  marcos: string[];
}

export interface ResultadoPrazo {
  regime: string;
  tribunal: string;
  meio: Meio;
  dias: number;
  datas: Record<string, string>;
  vencimento: string;
  memoria: LinhaMemoria[];
  cenario_calendario_tribunal: {
    vencimento: string;
    datas: Record<string, string>;
    dias_aplicados: { data: string; nome: string; fonte: string }[];
    notas: string[];
    memoria: LinhaMemoria[];
  } | null;
  alertas: string[];
  fundamentos: string[];
}

export const FERIADO_LOCAL_NAO_CONFIRMADO = "Feriado local não confirmado";
const DIAS_SEMANA = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];
const DIA_MS = 86_400_000;

/* ───────── datas ───────── */

export function parseData(iso: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) throw new Error(`Data inválida: '${iso}' (use AAAA-MM-DD).`);
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (new Date(t).toISOString().slice(0, 10) !== iso.trim()) throw new Error(`Data inexistente: '${iso}'.`);
  return t / DIA_MS;
}
const iso = (d: number) => new Date(d * DIA_MS).toISOString().slice(0, 10);
const ano = (d: number) => new Date(d * DIA_MS).getUTCFullYear();
const mmdd = (d: number) => iso(d).slice(5);
/** 0 = segunda … 6 = domingo (como weekday() do Python). */
const diaSemana = (d: number) => (new Date(d * DIA_MS).getUTCDay() + 6) % 7;
const deData = (a: number, mes: number, dia: number) => Date.UTC(a, mes - 1, dia) / DIA_MS;

/** Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher). */
export function pascoa(a: number): string {
  const A = a % 19, b = Math.floor(a / 100), c = a % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * A + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((A + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return iso(deData(a, mes, dia));
}

function dataItem(item: ItemFeriado, a: number): number | null {
  if (item.desde && a < item.desde) return null;
  if (item.pascoa !== undefined) return parseData(pascoa(a)) + item.pascoa;
  const [mes, dia] = item.data!.split("-").map(Number);
  return deData(a, mes, dia);
}

/** Intervalo MM-DD que pode atravessar a virada do ano (ex.: 12-20 a 01-20). */
const noIntervalo = (d: number, i: string, f: string) => {
  const md = mmdd(d);
  return i <= f ? i <= md && md <= f : md >= i || md <= f;
};

const norm = (t: string) => t.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase();

/* ───────── calendário ───────── */

type ItemAno = ItemFeriado & { origem: string };

class Calendario {
  readonly trib: TribunalFeriados | undefined;
  readonly uf: string | null;
  readonly munKey: string | null;
  private cache = new Map<number, Map<number, ItemAno>>();
  private readonly dados: DadosFeriados;
  private readonly regime: Regime;
  private readonly extras: Set<number>;
  private readonly comCalendario: boolean;

  constructor(
    dados: DadosFeriados,
    regime: Regime,
    tribunal: string,
    uf: string | null | undefined,
    municipio: string | null | undefined,
    extras: Set<number>,
    comCalendario: boolean,
  ) {
    this.dados = dados;
    this.regime = regime;
    this.extras = extras;
    this.comCalendario = comCalendario;
    this.trib = dados.tribunais[tribunal.toUpperCase()];
    this.uf = (uf || (this.trib && this.trib.ufs.length === 1 ? this.trib.ufs[0] : "") || "").toUpperCase() || null;
    this.munKey = municipio && this.uf ? `${this.uf}/${norm(municipio)}` : null;
  }

  private itensAno(a: number): Map<number, ItemAno> {
    const hit = this.cache.get(a);
    if (hit) return hit;
    const out = new Map<number, ItemAno>();
    const add = (itens: ItemFeriado[], origem: string, confirmado: boolean) => {
      for (const it of itens) {
        if (it.base === false && !(this.comCalendario || confirmado)) continue;
        const d = dataItem(it, a);
        if (d !== null && !out.has(d)) out.set(d, { ...it, origem });
      }
    };
    add(this.dados.nacionais, "nacional", true);
    if (this.uf) add(this.dados.estados[this.uf] ?? [], `estadual (${this.uf})`, true);
    if (this.munKey) add(this.dados.municipios[this.munKey] ?? [], "municipal", true);
    if (this.trib) add(this.trib.itens, "tribunal", this.trib.anos_conferidos.includes(a));
    this.cache.set(a, out);
    return out;
  }

  semExpediente(d: number): string | null {
    if (diaSemana(d) >= 5) return "fim de semana";
    if (this.extras.has(d)) return "dia sem expediente informado pelo usuário";
    const it = this.itensAno(ano(d)).get(d);
    if (it && it.tipo !== "expediente-reduzido") return `${it.nome} (${it.fonte})`;
    if (this.trib && noIntervalo(d, this.trib.recesso.inicio, this.trib.recesso.fim)) return `recesso forense (${this.trib.recesso.fonte})`;
    return null;
  }

  reduzido(d: number): string | null {
    const it = this.itensAno(ano(d)).get(d);
    return it && it.tipo === "expediente-reduzido" ? `${it.nome} (${it.fonte})` : null;
  }

  naoConta(d: number): string | null {
    const m = this.semExpediente(d);
    if (m) return m;
    const s = this.dados.suspensao_prazos;
    return noIntervalo(d, s.inicio, s.fim) ? `suspensão dos prazos (${s.fontes[this.regime]})` : null;
  }

  diasTribunalAplicados(ini: number, fim: number) {
    const res: { data: string; nome: string; fonte: string }[] = [];
    for (let d = ini; d <= fim; d++) {
      const it = this.itensAno(ano(d)).get(d);
      if (it && it.origem === "tribunal" && it.base === false) res.push({ data: iso(d), nome: it.nome, fonte: it.fonte });
    }
    return res;
  }
}

/* ───────── contagem ───────── */

const proximo = (d: number, pred: (x: number) => boolean) => {
  d += 1;
  while (!pred(d)) d += 1;
  return d;
};

type Marcos = Map<string, number>;

function contar(cal: Calendario, meio: Meio, ref: number, dias: number, consulta: number | null, fictaProrrogada: boolean) {
  const temExpediente = (d: number) => cal.semExpediente(d) === null;
  const podeComecarOuVencer = (d: number) => cal.naoConta(d) === null && cal.reduzido(d) === null;
  const marcos: Marcos = new Map();
  const notas: string[] = [];
  let ciencia: number;

  if (meio === "djen") {
    marcos.set("disponibilização", ref);
    ciencia = proximo(ref, temExpediente);
    marcos.set("publicação", ciencia);
  } else if (meio === "portal") {
    marcos.set("envio", ref);
    if (consulta !== null) {
      ciencia = temExpediente(consulta) ? consulta : proximo(consulta, temExpediente);
      if (ciencia !== consulta) notas.push("Consulta em dia não útil: intimação considerada no 1º dia útil seguinte (Lei 11.419/2006, art. 5º, § 2º).");
    } else {
      ciencia = ref + 10;
      if (fictaProrrogada && !temExpediente(ciencia)) ciencia = proximo(ciencia, temExpediente);
    }
    marcos.set("ciência", ciencia);
  } else {
    ciencia = ref;
    marcos.set("intimação", ciencia);
  }

  const inicio = proximo(ciencia, podeComecarOuVencer);
  marcos.set("início", inicio);
  let n = 1, d = inicio, ultimo = inicio;
  while (n < dias) {
    d += 1;
    if (cal.naoConta(d) === null) {
      n += 1;
      ultimo = d;
    }
  }
  let venc = ultimo;
  const red = cal.reduzido(venc);
  if (red) {
    notas.push(`Vencimento em dia de expediente reduzido (${red}): protraído para o dia útil seguinte (CPC, art. 224, § 1º).`);
    venc = proximo(venc, podeComecarOuVencer);
  }
  marcos.set("vencimento", venc);
  return { marcos, notas };
}

function memoria(cal: Calendario, marcos: Marcos, dias: number): LinhaMemoria[] {
  const rotulos = new Map<number, string[]>();
  for (const [nome, d] of marcos) rotulos.set(d, [...(rotulos.get(d) ?? []), nome]);
  const inicio = marcos.get("início")!, venc = marcos.get("vencimento")!;
  const linhas: LinhaMemoria[] = [];
  let n = 0;
  for (let d = Math.min(...marcos.values()); d <= venc; d++) {
    const motivo = cal.naoConta(d);
    const conta = inicio <= d && motivo === null && n < dias;
    if (conta) n += 1;
    const red = cal.reduzido(d);
    linhas.push({
      data: iso(d),
      dia_semana: DIAS_SEMANA[diaSemana(d)],
      conta,
      n: conta ? n : null,
      motivo: conta ? null : motivo || (red && `expediente reduzido: ${red}`) || (d < inicio ? "antes do início da contagem" : "prazo já completo; vencimento protraído"),
      marcos: rotulos.get(d) ?? [],
    });
  }
  return linhas;
}

const datasISO = (m: Marcos) => Object.fromEntries([...m].map(([k, v]) => [k, iso(v)]));

function fundamentos(regime: Regime, meio: Meio): string[] {
  const f =
    regime === "cpc"
      ? ["CPC, art. 219 (dias úteis)", "CPC, art. 224 (exclusão do dia do começo; protração)"]
      : ["CLT, art. 775 (dias úteis; exclusão do dia do começo)", "CPC, art. 224, § 1º, c/c CLT, art. 769 (protração)"];
  f.push(regime === "cpc" ? "CPC, art. 220 (suspensão de 20/12 a 20/01)" : "CLT, art. 775-A (suspensão de 20/12 a 20/01)");
  if (meio === "djen") f.push("Lei 11.419/2006, art. 4º, §§ 3º e 4º; CPC, art. 224, §§ 2º e 3º (Diário eletrônico)");
  else if (meio === "portal") f.push("Lei 11.419/2006, art. 5º (intimação pelo portal; ciência ficta em 10 dias corridos)");
  return f;
}

export interface EntradaPrazo {
  regime: Regime;
  tribunal: string;
  meio: Meio;
  data: string; // disponibilização (djen), envio (portal) ou data da intimação
  dias: number;
  consulta?: string | null;
  uf?: string | null;
  municipio?: string | null;
  em_dobro?: boolean;
  feriados_extras?: string[];
}

export function calcularPrazo(e: EntradaPrazo, dados: DadosFeriados): ResultadoPrazo {
  const regime = String(e.regime).toLowerCase() as Regime;
  const meio = String(e.meio).toLowerCase() as Meio;
  if (regime !== "cpc" && regime !== "clt") throw new Error("regime deve ser 'cpc' ou 'clt'");
  if (!["djen", "portal", "intimacao"].includes(meio)) throw new Error("meio deve ser 'djen', 'portal' ou 'intimacao'");
  if (!Number.isInteger(e.dias) || e.dias < 1 || e.dias > 365) throw new Error("dias deve ser inteiro entre 1 e 365");

  const ref = parseData(e.data);
  const consulta = e.consulta ? parseData(e.consulta) : null;
  const extras = new Set((e.feriados_extras ?? []).map(parseData));
  const prazo = e.em_dobro ? e.dias * 2 : e.dias;
  const novo = (comCalendario: boolean) => new Calendario(dados, regime, e.tribunal, e.uf, e.municipio, extras, comCalendario);

  const base = novo(false);
  const { marcos, notas } = contar(base, meio, ref, prazo, consulta, false);
  const alertas = [...notas];

  if (!base.trib) {
    alertas.push(`${FERIADO_LOCAL_NAO_CONFIRMADO}: o tribunal '${e.tribunal}' ainda não está na base; aplicamos só feriados nacionais${base.uf ? " e estaduais" : ""}. Confira o calendário do tribunal.`);
  }
  if (!base.munKey || !(base.munKey in dados.municipios)) {
    alertas.push(`${FERIADO_LOCAL_NAO_CONFIRMADO}: feriados municipais da comarca${e.municipio ? " de " + e.municipio : ""} não estão na base. Se houver, informe-os como dias sem expediente (feriados_extras).`);
  }

  const r: ResultadoPrazo = {
    regime: regime.toUpperCase(),
    tribunal: e.tribunal.toUpperCase(),
    meio,
    dias: prazo,
    datas: datasISO(marcos),
    vencimento: iso(marcos.get("vencimento")!),
    memoria: memoria(base, marcos, prazo),
    cenario_calendario_tribunal: null,
    alertas,
    fundamentos: fundamentos(regime, meio),
  };

  if (base.trib) {
    const cal = novo(true);
    const { marcos: m2, notas: n2 } = contar(cal, meio, ref, prazo, consulta, false);
    const v1 = marcos.get("vencimento")!, v2 = m2.get("vencimento")!;
    const aplicados = cal.diasTribunalAplicados(Math.min(...m2.values()), v2);
    const a = ano(ref);
    if (aplicados.length && !base.trib.anos_conferidos.includes(a)) {
      if (v2 !== v1) {
        r.cenario_calendario_tribunal = { vencimento: iso(v2), datas: datasISO(m2), dias_aplicados: aplicados, notas: n2, memoria: memoria(cal, m2, prazo) };
      }
      const nomes = aplicados.map((x) => `${x.data} ${x.nome}`).join("; ");
      alertas.push(
        `${FERIADO_LOCAL_NAO_CONFIRMADO}: o calendário de ${a} do ${base.trib.nome} ainda não foi conferido. ` +
          `Dias habitualmente sem expediente no período: ${nomes}. ` +
          (v2 !== v1 ? `Se confirmados, o vencimento passa para ${iso(v2)}. ` : "") +
          `Fonte a conferir: ${base.trib.calendario_oficial}.`,
      );
      alertas.push("Se o prazo depender de feriado local, comprove-o no ato de interposição do recurso (CPC, art. 1.003, § 6º, red. Lei 14.939/2024).");
    }
  }

  if (meio === "portal" && consulta === null) {
    const { marcos: m3 } = contar(novo(false), meio, ref, prazo, consulta, true);
    if (m3.get("vencimento") !== marcos.get("vencimento")) {
      alertas.push(
        `O 10º dia após o envio (${iso(marcos.get("ciência")!)}) não é dia útil. Há tribunais que prorrogam a ciência ficta para o 1º dia útil seguinte; ` +
          `nesse entendimento o vencimento seria ${iso(m3.get("vencimento")!)}. Por segurança, adotamos a data mais cedo.`,
      );
    }
  }

  const s = dados.suspensao_prazos;
  if (r.memoria.some((l) => !l.conta && l.motivo?.startsWith("suspensão"))) {
    alertas.push(`O prazo atravessou a suspensão de ${s.inicio.slice(3)}/${s.inicio.slice(0, 2)} a ${s.fim.slice(3)}/${s.fim.slice(0, 2)} (${s.fontes[regime]}).`);
  }
  if (e.em_dobro) alertas.push(`Prazo contado em dobro (${e.dias} → ${prazo} dias). Confira o fundamento (ex.: CPC, arts. 180, 183, 186 e 229).`);
  if (consulta !== null && consulta > ref + 10) alertas.push("A consulta informada é posterior ao 10º dia do envio: vale a ciência ficta. Confira as datas.");
  return r;
}

/** Resumo em texto para o assistente mostrar ao usuário. */
export function resumoPrazo(r: ResultadoPrazo): string {
  const br = (s: string) => s.split("-").reverse().join("/");
  const dia = (s: string) => DIAS_SEMANA[diaSemana(parseData(s))];
  const linhas = [
    `VENCIMENTO: ${br(r.vencimento)} (${dia(r.vencimento)}) — prazo de ${r.dias} dias úteis (${r.regime}, ${r.tribunal}).`,
    ...Object.entries(r.datas).map(([k, v]) => `- ${k[0].toUpperCase()}${k.slice(1)}: ${br(v)} (${dia(v)})`),
  ];
  if (r.cenario_calendario_tribunal) {
    linhas.push(`Com o calendário do tribunal (não confirmado): ${br(r.cenario_calendario_tribunal.vencimento)}. Recomenda-se protocolar até ${br(r.vencimento)}.`);
  }
  linhas.push("", "Memória de cálculo:", "| Data | Dia | Conta? | Nº | Motivo / marco |", "|---|---|---|---|---|");
  for (const l of r.memoria) {
    const extra = [l.marcos.join(", "), l.motivo].filter(Boolean).join(" — ");
    linhas.push(`| ${br(l.data)} | ${l.dia_semana} | ${l.conta ? "sim" : "não"} | ${l.n ?? ""} | ${extra} |`);
  }
  if (r.alertas.length) linhas.push("", "Alertas:", ...r.alertas.map((a) => `- ${a}`));
  linhas.push("", `Fundamentos: ${r.fundamentos.join("; ")}.`);
  return linhas.join("\n");
}
