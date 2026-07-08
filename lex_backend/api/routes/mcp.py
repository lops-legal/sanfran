"""
mcp.py — MCP Endpoint JSON-RPC 2.0
====================================

spec §3.1 — MCP Endpoint (JSON-RPC 2.0)
URL: POST /api/mcp

Métodos implementados:
  tools/list       — lista ferramentas disponíveis
  tools/call       → resolve_skill — busca skills por query
  tools/call       → read_skill    — retorna conteúdo completo de uma skill

Autenticação:
  Authorization: Bearer {api_key} — opcional
  Sem key = free tier por IP (50 req/dia — rate limiting pendente Redis)

Rate Limiting:
  ⚠️  PENDENTE — requer Redis (Upstash)
  Keys esperadas:
    ratelimit:ip:{ip_hash}       → Counter + TTL sliding window
    ratelimit:key:{api_key_id}   → Counter + TTL sliding window
"""

import hashlib
import time
from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ...services.db.session import get_db
from ...services.db.models import Skill, SkillMetricTotal, APIKey, MCPRequest

router = APIRouter()

# ─────────────────────────────────────────────
# Rate limits (free tier)
# ─────────────────────────────────────────────
FREE_TIER_DAILY_LIMIT = 50  # spec §1.4


def hash_ip(ip: str) -> str:
    return hashlib.sha256(ip.encode()).hexdigest()


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "0.0.0.0"


# ─────────────────────────────────────────────
# JSON-RPC 2.0 helpers
# ─────────────────────────────────────────────

def rpc_error(id: Any, code: int, message: str) -> dict:
    return {
        "jsonrpc": "2.0",
        "id": id,
        "error": {"code": code, "message": message},
    }


def rpc_result(id: Any, result: Any) -> dict:
    return {
        "jsonrpc": "2.0",
        "id": id,
        "result": result,
    }


# ─────────────────────────────────────────────
# Tool: tools/list
# ─────────────────────────────────────────────

TOOLS_LIST_RESULT = {
    "tools": [
        {
            "name": "resolve_skill",
            "description": "Search for legal AI skills by task description. Returns the most relevant skill with its URL.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Task description, e.g. 'demand letter', 'motion to dismiss', 'NDA review'",
                    }
                },
                "required": ["query"],
            },
        },
        {
            "name": "read_skill",
            "description": "Get the full content of a legal AI skill by its slug identifier.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "slug": {
                        "type": "string",
                        "description": "Skill slug, e.g. 'demand-letter', 'litigation', 'motion-to-dismiss'",
                    }
                },
                "required": ["slug"],
            },
        },
    ]
}


# ─────────────────────────────────────────────
# Tool: resolve_skill
# ─────────────────────────────────────────────

def handle_resolve_skill(query: str, db: Session) -> dict:
    """Busca skill mais relevante para a query.
    
    ⚠️  Atualmente usa busca LIKE no SQLite.
        Em produção: usar Typesense para busca semântica.
    """
    if not query or not query.strip():
        return {"content": [{"type": "text", "text": "Error: query is required"}]}

    pattern = f"%{query}%"
    skills = (
        db.query(Skill)
        .filter(
            Skill.is_active == True,
            or_(
                Skill.name.ilike(pattern),
                Skill.description.ilike(pattern),
                Skill.tags_array.cast_op("", Skill.tags_array).ilike(pattern) if False else Skill.name.ilike(pattern),
            ),
        )
        .limit(5)
        .all()
    )

    # Fallback: busca por nome exato parcial
    if not skills:
        skills = (
            db.query(Skill)
            .filter(Skill.is_active == True, Skill.name.ilike(pattern))
            .limit(5)
            .all()
        )

    if not skills:
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"No skills found for query: {query!r}\nBrowse all skills at /skills",
                }
            ]
        }

    lines = []
    for s in skills[:3]:
        lines.append(f"Skill: {s.name} (slug: {s.slug})")
        lines.append(f"Tags: {', '.join(s.tags_array or [])}")
        lines.append(f"URL: /skills/{s.slug}")
        lines.append(f"Markdown: /skills/{s.slug}/raw")
        lines.append("")

    return {
        "content": [
            {
                "type": "text",
                "text": "\n".join(lines).strip(),
            }
        ]
    }


# ─────────────────────────────────────────────
# Tool: read_skill
# ─────────────────────────────────────────────

def handle_read_skill(slug: str, db: Session) -> dict:
    """Retorna conteúdo completo de uma skill."""
    skill = db.query(Skill).filter_by(slug=slug, is_active=True).first()

    if not skill:
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Skill not found: {slug!r}\nBrowse skills at /skills",
                }
            ]
        }

    # Incrementa uso
    metrics = db.query(SkillMetricTotal).filter_by(skill_slug=slug).first()
    if metrics:
        metrics.uses += 1
        db.commit()

    return {
        "content": [
            {
                "type": "text",
                "text": skill.content,
            }
        ]
    }


# ─────────────────────────────────────────────
# POST /api/mcp
# ─────────────────────────────────────────────

@router.post("/mcp")
async def mcp_endpoint(request: Request, db: Session = Depends(get_db)):
    """
    MCP Endpoint — JSON-RPC 2.0
    
    spec §3.1 — MCP Endpoint
    
    ⚠️  Rate Limiting — PENDENTE (requer Redis/Upstash)
        Por ora retorna headers informativos sem enforcement.
    
    ⚠️  API Key validation — PENDENTE (requer auth system)
        Por ora aceita qualquer key sem validação real.
    """
    t_start = time.perf_counter()
    ip = get_client_ip(request)
    ip_hash = hash_ip(ip)

    # Parse do body
    try:
        body = await request.json()
    except Exception:
        return JSONResponse(
            status_code=400,
            content=rpc_error(None, -32700, "Parse error"),
        )

    rpc_id     = body.get("id")
    method     = body.get("method", "")
    jsonrpc    = body.get("jsonrpc", "")
    params     = body.get("params", {})

    if jsonrpc != "2.0":
        return JSONResponse(
            status_code=400,
            content=rpc_error(rpc_id, -32600, "Invalid Request: jsonrpc must be '2.0'"),
        )

    # Processa método
    skill_slug = None
    query_text = None
    result     = None
    status_code = 200

    if method == "tools/list":
        result = TOOLS_LIST_RESULT

    elif method == "tools/call":
        tool_name = params.get("name", "")
        args      = params.get("arguments", {})

        if tool_name == "resolve_skill":
            query_text = args.get("query", "")
            result = handle_resolve_skill(query_text, db)

        elif tool_name == "read_skill":
            skill_slug = args.get("slug", "")
            result = handle_read_skill(skill_slug, db)

        else:
            status_code = 400
            result = rpc_error(rpc_id, -32601, f"Unknown tool: {tool_name!r}")

    else:
        status_code = 400
        result = rpc_error(rpc_id, -32601, f"Method not found: {method!r}")

    latency_ms = int((time.perf_counter() - t_start) * 1000)

    # Log da request (anonimizado — spec §1.6)
    # query NÃO é armazenado conforme política de privacidade
    try:
        log = MCPRequest(
            method=method if method in ("tools/list", "tools/call", "resolve_skill", "read_skill") else "unknown",
            skill_slug=skill_slug,
            query=None,  # ⚠️  política: não armazenar queries
            ip_hash=ip_hash,
            status_code=status_code,
            latency_ms=latency_ms,
            rate_limit_remaining=FREE_TIER_DAILY_LIMIT,  # placeholder até Redis
        )
        db.add(log)
        db.commit()
    except Exception:
        db.rollback()  # Log failure não deve derrubar a resposta

    response_body = rpc_result(rpc_id, result)
    return JSONResponse(
        status_code=status_code,
        content=response_body,
        headers={
            # Rate limit headers informativos (spec §1.4)
            # TODO: valores reais quando Redis estiver integrado
            "X-RateLimit-Limit":     str(FREE_TIER_DAILY_LIMIT),
            "X-RateLimit-Remaining": str(FREE_TIER_DAILY_LIMIT),  # placeholder
            "X-Latency-Ms":          str(latency_ms),
        },
    )
