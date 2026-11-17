import { MCP_TOOLS } from "./tools";
import { REPO_SKILLS, getRepoSkill, reviewLabel, searchRepoSkills } from "../catalog";
import { analisarCNJ, extrairCNJ } from "../motores/cnj";
import { calcularPrazo, resumoPrazo, type EntradaPrazo } from "../motores/prazo";
import { FERIADOS } from "../motores/feriados-data";
import { SITE_URL } from "../site";

/**
 * Servidor MCP sem estado (Streamable HTTP, respostas JSON).
 * Implementa: initialize, ping, tools/list, tools/call, resources/list, resources/read.
 */

export const SUPPORTED_PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
const SERVER_INFO = { name: "sanfran", title: "sanfran.md — Skills jurídicas brasileiras", version: "0.2.0" };

const INSTRUCTIONS =
  "Skills jurídicas para o Direito brasileiro. Para qualquer tarefa jurídica brasileira: " +
  "1) chame buscar_skills com o que o usuário precisa; 2) chame obter_skill com o slug escolhido e siga as instruções; " +
  "3) para cálculos e validações use as ferramentas de motor (ex.: validar_numero_cnj) em vez de calcular por conta própria. " +
  "Informe ao usuário o status de revisão da skill usada e cite os dispositivos legais. A ferramenta apoia, não substitui, a análise de um advogado.";

type JsonRpcId = string | number | null;
export interface JsonRpcRequest { jsonrpc: "2.0"; id?: JsonRpcId; method: string; params?: Record<string, unknown> }
type JsonRpcResponse = { jsonrpc: "2.0"; id: JsonRpcId; result?: unknown; error?: { code: number; message: string; data?: unknown } };

class RpcError extends Error {
  constructor(public code: number, message: string) { super(message); }
}

const text = (t: string, structured?: unknown, isError = false) => ({
  content: [{ type: "text", text: t }],
  ...(structured !== undefined ? { structuredContent: structured } : {}),
  ...(isError ? { isError: true } : {}),
});

function str(v: unknown, field: string, required = true): string {
  if (typeof v === "string" && v.trim()) return v.trim();
  if (!required && (v === undefined || v === null || v === "")) return "";
  throw new RpcError(-32602, `Parâmetro '${field}' inválido ou ausente.`);
}

function callTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "buscar_skills": {
      const consulta = str(args.consulta, "consulta");
      const limite = Math.min(Math.max(Number(args.limite) || 8, 1), 25);
      const found = searchRepoSkills(consulta, { area: str(args.area, "area", false) || null, type: str(args.tipo, "tipo", false) || null }).slice(0, limite);
      const skills = found.map((s) => ({ slug: s.slug, titulo: s.title, area: s.area, tipo: s.type, revisao: reviewLabel(s), descricao: s.description }));
      if (!skills.length) return text(`Nenhuma skill encontrada para "${consulta}". Tente outros termos ou use listar_areas.`, { skills });
      const lines = skills.map((s) => `- ${s.slug} — ${s.titulo} [${s.area} · ${s.revisao}]\n  ${s.descricao}`);
      return text(`${skills.length} skill(s) para "${consulta}":\n${lines.join("\n")}\n\nPróximo passo: obter_skill com o slug escolhido.`, { skills });
    }
    case "obter_skill": {
      const s = getRepoSkill(str(args.slug, "slug"));
      if (!s) return text(`Skill '${args.slug}' não encontrada. Use buscar_skills.`, undefined, true);
      const apoio = Object.keys(s.references);
      const header = [
        `Skill: ${s.title} (${s.slug}) · v${s.version} · ${s.area}`,
        `Status de revisão jurídica: ${reviewLabel(s)}${s.review.reviewer ? ` — ${s.review.reviewer}` : ""}`,
        s.legalBasis.length ? `Base normativa: ${s.legalBasis.map((b) => b.ref).join("; ")}` : null,
        apoio.length ? `Arquivos de apoio (obter_arquivo_skill): ${apoio.join(", ")}` : null,
        `Página: ${SITE_URL}/skills/${s.slug}`,
        "",
      ].filter((l) => l !== null);
      return text(`${header.join("\n")}\n${s.markdown}`);
    }
    case "obter_arquivo_skill": {
      const s = getRepoSkill(str(args.slug, "slug"));
      const arquivo = str(args.arquivo, "arquivo").replace(/^\.?\//, "");
      const conteudo = s?.references[arquivo];
      if (!s || conteudo === undefined) {
        return text(`Arquivo '${arquivo}' não encontrado${s ? `. Disponíveis: ${Object.keys(s.references).join(", ")}` : ""}.`, undefined, true);
      }
      return text(conteudo);
    }
    case "listar_areas": {
      const areas: Record<string, number> = {};
      for (const s of REPO_SKILLS) areas[s.area] = (areas[s.area] ?? 0) + 1;
      const lista = Object.entries(areas).sort((a, b) => b[1] - a[1]).map(([area, total]) => ({ area, total }));
      return text(`${REPO_SKILLS.length} skills em ${lista.length} áreas:\n${lista.map((a) => `- ${a.area}: ${a.total}`).join("\n")}`, { areas: lista });
    }
    case "calcular_prazo": {
      const lista = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
      const entrada: EntradaPrazo = {
        regime: str(args.regime, "regime").toLowerCase() as EntradaPrazo["regime"],
        tribunal: str(args.tribunal, "tribunal"),
        meio: str(args.meio, "meio").toLowerCase() as EntradaPrazo["meio"],
        data: str(args.data, "data"),
        dias: Number(args.dias),
        consulta: str(args.consulta, "consulta", false) || null,
        municipio: str(args.municipio, "municipio", false) || null,
        uf: str(args.uf, "uf", false) || null,
        em_dobro: args.em_dobro === true,
        feriados_extras: lista(args.feriados_extras),
      };
      try {
        const r = calcularPrazo(entrada, FERIADOS);
        return text(resumoPrazo(r), r);
      } catch (e) {
        return text(`Não foi possível calcular: ${(e instanceof Error ? e.message : "entrada inválida").replace(/\.?$/, ".")}`, undefined, true);
      }
    }
    case "validar_numero_cnj": {
      const numeros = Array.isArray(args.numeros) ? args.numeros.filter((n): n is string => typeof n === "string") : [];
      const texto = typeof args.texto === "string" ? args.texto.slice(0, 200_000) : "";
      const entradas = [...numeros, ...extrairCNJ(texto)].slice(0, 1000);
      if (!entradas.length) return text("Informe 'numeros' ou um 'texto' que contenha números de processo.", undefined, true);
      const resultados = entradas.map((e) => analisarCNJ(e));
      const linhas = resultados.map((r, i) =>
        `${i + 1}. ${r.numero_formatado ?? r.entrada} — ${r.valido ? "VÁLIDO" : "INVÁLIDO"}` +
        (r.tribunal_sigla ? ` · ${r.tribunal_sigla}` : "") + (r.ano ? ` · ${r.ano}` : "") +
        (r.erros.length ? ` · ${r.erros.join(" ")}` : "") + (r.alertas.length ? ` · Atenção: ${r.alertas.join(" ")}` : ""),
      );
      return text(linhas.join("\n"), { resultados });
    }
    default:
      throw new RpcError(-32602, `Ferramenta desconhecida: ${name}`);
  }
}

function handle(req: JsonRpcRequest): unknown {
  const p = req.params ?? {};
  switch (req.method) {
    case "initialize": {
      const requested = typeof p.protocolVersion === "string" ? p.protocolVersion : "";
      return {
        protocolVersion: SUPPORTED_PROTOCOL_VERSIONS.includes(requested) ? requested : SUPPORTED_PROTOCOL_VERSIONS[1],
        capabilities: { tools: { listChanged: false }, resources: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      };
    }
    case "ping":
      return {};
    case "tools/list":
      return { tools: MCP_TOOLS.map(({ name, description, inputSchema, annotations }) => ({ name, description, inputSchema, annotations })) };
    case "tools/call": {
      const name = str(p.name, "name");
      const args = (p.arguments && typeof p.arguments === "object" ? p.arguments : {}) as Record<string, unknown>;
      try {
        return callTool(name, args);
      } catch (e) {
        // Erro de argumento em ferramenta existente vira resultado com isError, para o modelo corrigir a chamada.
        if (e instanceof RpcError && e.code === -32602 && MCP_TOOLS.some((t) => t.name === name)) return text(e.message, undefined, true);
        throw e;
      }
    }
    case "resources/list":
      return {
        resources: REPO_SKILLS.map((s) => ({
          uri: `sanfran://skills/${s.slug}`,
          name: s.slug,
          title: s.title,
          description: s.description,
          mimeType: "text/markdown",
        })),
      };
    case "resources/read": {
      const uri = str(p.uri, "uri");
      const m = uri.match(/^sanfran:\/\/skills\/([a-z0-9-]+)(?:\/(.+))?$/);
      const s = m ? getRepoSkill(m[1]) : undefined;
      const body = s ? (m![2] ? s.references[m![2]] : s.markdown) : undefined;
      if (body === undefined) throw new RpcError(-32002, `Recurso não encontrado: ${uri}`);
      return { contents: [{ uri, mimeType: "text/markdown", text: body }] };
    }
    default:
      throw new RpcError(-32601, `Método não suportado: ${req.method}`);
  }
}

/** Processa uma mensagem JSON-RPC. Retorna null para notificações (sem id). */
export function processMessage(msg: unknown): JsonRpcResponse | null {
  const req = msg as JsonRpcRequest;
  const id = req && typeof req === "object" && "id" in req ? (req.id ?? null) : undefined;
  if (!req || typeof req !== "object" || req.jsonrpc !== "2.0" || typeof req.method !== "string") {
    return { jsonrpc: "2.0", id: id ?? null, error: { code: -32600, message: "Requisição JSON-RPC inválida." } };
  }
  if (id === undefined) return null; // notificação (ex.: notifications/initialized)
  try {
    return { jsonrpc: "2.0", id, result: handle(req) };
  } catch (e) {
    const err = e instanceof RpcError ? e : new RpcError(-32603, "Erro interno.");
    if (!(e instanceof RpcError)) console.error("[sanfran mcp]", e);
    return { jsonrpc: "2.0", id, error: { code: err.code, message: err.message } };
  }
}
