"""
Input validation middleware for the Lex Backend FastAPI routes.

Provides request validators and rate-limit-style guards.
Import and apply as dependencies on individual routes.
"""

from fastapi import Request, HTTPException
from functools import wraps

MAX_BODY_BYTES = 2 * 1024 * 1024  # 2MB hard limit for any POST body


async def validate_body_size(request: Request):
    """
    FastAPI dependency that rejects requests with bodies larger than MAX_BODY_BYTES.
    Use: @router.post("/foo", dependencies=[Depends(validate_body_size)])
    """
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_BODY_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"O corpo da requisição excede o limite de {MAX_BODY_BYTES // (1024*1024)}MB.",
        )


def validate_required_fields(*fields: str):
    """
    Returns a dependency that checks the parsed JSON body contains all required fields.
    Usage:
        @router.post("/skill", dependencies=[Depends(validate_required_fields("name", "description"))])
    """
    async def _check(request: Request):
        try:
            body = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="JSON inválido.")
        missing = [f for f in fields if f not in body or not body[f]]
        if missing:
            raise HTTPException(
                status_code=422,
                detail=f"Campos obrigatórios ausentes: {', '.join(missing)}",
            )
    return _check


def validate_slug(slug: str) -> str:
    """Validate a URL slug parameter."""
    if not slug or len(slug) > 200:
        raise HTTPException(status_code=400, detail="Slug inválido.")
    if not all(c.isalnum() or c in "-_" for c in slug):
        raise HTTPException(status_code=400, detail="Slug contém caracteres inválidos.")
    return slug
