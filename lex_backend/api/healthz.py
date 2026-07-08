"""
Health check endpoint for the Lex backend.

Usage:
  GET /healthz → returns { "status": "ok", "db": "connected" | "error", "uptime_s": N }

This module should be imported and included in the main FastAPI app.
"""

import time
from fastapi import APIRouter

router = APIRouter(tags=["health"])

_start_time = time.time()


@router.get("/healthz")
async def healthz():
    """
    Lightweight health probe for load balancers and monitoring.
    Returns 200 OK if the API process is alive.
    """
    uptime = round(time.time() - _start_time, 1)
    return {
        "status": "ok",
        "uptime_s": uptime,
        "version": "1.0.0",
    }
