import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "../../../lib/mcp/server";

/**
 * Endpoint MCP (Streamable HTTP, sem estado). Os conectores do Claude, ChatGPT e Manus
 * enviam JSON-RPC via POST; respondemos com JSON (sem SSE, sem sessão).
 */

export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

const MAX_BODY = 512 * 1024;

export async function POST(request: NextRequest) {
  const raw = await request.text();
  if (raw.length > MAX_BODY) {
    return NextResponse.json({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "Requisição grande demais." } }, { status: 413, headers: CORS });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "JSON inválido." } }, { status: 400, headers: CORS });
  }

  const messages = Array.isArray(body) ? body : [body];
  const responses = messages.map(processMessage).filter((r) => r !== null);

  // Só notificações/respostas: 202 sem corpo, conforme a especificação.
  if (responses.length === 0) return new NextResponse(null, { status: 202, headers: CORS });

  return NextResponse.json(Array.isArray(body) ? responses : responses[0], { headers: CORS });
}

/** Sem fluxo SSE iniciado pelo servidor: GET não é suportado (405, conforme a especificação). */
export async function GET() {
  return new NextResponse("Use POST com JSON-RPC 2.0. Guia: /integrate", { status: 405, headers: { ...CORS, Allow: "POST, OPTIONS" } });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
