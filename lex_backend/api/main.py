import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load .env from lex_backend/ directory (two levels up from this file: api/main.py -> api/ -> lex_backend/)
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)

# Import routes using relative import to work when lex_backend is a package
from .routes import interview, skill, test, qa, chat
from .routes import skills_catalog, mcp
from .healthz import router as healthz_router

app = FastAPI(title="Lex Backend", version="0.1.0")

# CORS padrão (ajuste conforme necessidade)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# incluir routers
app.include_router(interview.router, prefix="/interview", tags=["Interview"])
app.include_router(skill.router, prefix="/skill", tags=["Skill"])
app.include_router(test.router, prefix="/skill", tags=["Skill Test"])
app.include_router(qa.router, prefix="/skill", tags=["Skill QA"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])

# Catálogo de skills (spec §3)
app.include_router(skills_catalog.router, prefix="/skills", tags=["Skills Catalog"])

# MCP endpoint JSON-RPC 2.0 (spec §3.1)
app.include_router(mcp.router, prefix="/api", tags=["MCP"])

app.include_router(healthz_router)

# raiz simples

# incluir router de sessões
from .routes import session
app.include_router(session.router, prefix="/session", tags=["Session"])

@app.get("/")
async def root():
    return {"message": "Lex Backend is up"}
