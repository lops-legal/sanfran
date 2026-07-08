"""
skills.py — Rotas de Skills (spec §3)
======================================

Endpoints implementados:
  GET  /skills                     — lista paginada com filtros (§5.1)
  GET  /skills/tags                — lista de tags com contagens (§1.2)
  GET  /skills/featured            — skills em destaque
  GET  /skills/{slug}              — detalhe completo (§5.2)
  GET  /skills/{slug}/raw          — raw markdown (§3.2)
  POST /skills/metrics/{slug}/view — incrementa contador de views (§4.2)

Cache layer (Redis/Upstash) — PENDENTE
  Quando implementado, os endpoints devem verificar:
    Key: skill:{slug}:content    TTL: 300s
    Key: skill:{slug}:metrics    TTL: 60s
    Key: skills:featured         TTL: 300s
    Key: skills:recent           TTL: 60s
    Key: skills:popular          TTL: 120s
    Key: tags:all                TTL: 3600s

Search (Typesense) — PENDENTE
  GET /skills?q=... atualmente usa FTS do SQLite.
  Quando Typesense for integrado, substituir query por client Typesense.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional, List
from datetime import datetime, timezone

from ...services.db.session import get_db
from ...services.db.models import Skill, Tag, SkillTag, SkillMetricTotal, Author

router = APIRouter()


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def skill_to_card(skill: Skill, metrics: SkillMetricTotal | None = None) -> dict:
    """Serializa skill para o formato card (lista)."""
    m = metrics or skill.metrics_total
    return {
        "slug": skill.slug,
        "name": skill.name,
        "description": skill.description[:300] + "…" if len(skill.description) > 300 else skill.description,
        "tags": skill.tags_array or [],
        "skill_modes": skill.skill_modes_array or [],
        "author": skill.author_rel.display_name if skill.author_rel else skill.author_id or "casemark",
        "version": skill.version,
        "language": skill.language,
        "license": skill.license,
        "is_featured": skill.is_featured,
        "updated_at": skill.updated_at.isoformat() if skill.updated_at else None,
        "metrics": {
            "views":     m.views     if m else 0,
            "downloads": m.downloads if m else 0,
            "uses":      m.uses      if m else 0,
        },
        "url":          f"/skills/{skill.slug}",
        "markdown_url": f"/skills/{skill.slug}/raw",
        "github": {
            "edit_url": skill.github_edit_url,
            "tree_url": skill.github_tree_url,
        },
    }


def skill_to_detail(skill: Skill) -> dict:
    """Serializa skill para o formato detalhe completo (§5.2)."""
    m = skill.metrics_total
    author = skill.author_rel
    return {
        "slug":        skill.slug,
        "name":        skill.name,
        "description": skill.description,
        "content":     skill.content,
        "tags":        skill.tags_array or [],
        "skill_modes": skill.skill_modes_array or [],
        "author": {
            "id":            author.id           if author else skill.author_id or "casemark",
            "display_name":  author.display_name if author else skill.author_id or "casemark",
            "github_handle": author.github_handle if author else None,
            "avatar_url":    author.avatar_url if author else None,
        },
        "license":    skill.license,
        "language":   skill.language,
        "version":    skill.version,
        "is_featured": skill.is_featured,
        "is_active":  skill.is_active,
        "created_at": skill.created_at.isoformat() if skill.created_at else None,
        "updated_at": skill.updated_at.isoformat() if skill.updated_at else None,
        "metrics": {
            "views":     m.views     if m else 0,
            "downloads": m.downloads if m else 0,
            "uses":      m.uses      if m else 0,
        },
        "files": skill.files_json or [],
        "github": {
            "edit_url": skill.github_edit_url,
            "tree_url": skill.github_tree_url,
        },
        "urls": {
            "page":     f"/skills/{skill.slug}",
            "markdown": f"/skills/{skill.slug}/raw",
            "download": f"/skills/{skill.slug}/download",
        },
    }


# ─────────────────────────────────────────────
# GET /skills
# ─────────────────────────────────────────────

@router.get("")
async def list_skills(
    q:       Optional[str] = Query(None, description="Busca full-text"),
    tag:     Optional[str] = Query(None, description="Filtrar por tag slug"),
    author:  Optional[str] = Query(None, description="Filtrar por author_id"),
    sort:    str           = Query("updated", description="updated | views | uses | downloads | name"),
    page:    int           = Query(1, ge=1),
    per_page: int          = Query(24, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Lista skills com filtros e paginação.
    
    spec §5.1 — Lista de Skills
    
    ⚠️  Cache Redis — PENDENTE
        Em produção: verificar `skills:search:{hash(params)}` (TTL 30s)
        antes de consultar o banco.
    
    ⚠️  Search Typesense — PENDENTE
        Quando disponível, substituir a query SQLite por client Typesense.
    """
    query = db.query(Skill).filter(Skill.is_active == True)

    # Filtro por tag
    if tag:
        query = query.join(SkillTag, SkillTag.skill_slug == Skill.slug).filter(
            SkillTag.tag_slug == tag.lower()
        )

    # Filtro por author
    if author:
        query = query.filter(Skill.author_id == author)

    # Busca full-text (SQLite LIKE — substituir por Typesense em produção)
    if q:
        pattern = f"%{q}%"
        query = query.filter(
            or_(
                Skill.name.ilike(pattern),
                Skill.description.ilike(pattern),
                Skill.content.ilike(pattern),
            )
        )

    # Total (antes de paginar)
    total = query.count()

    # Ordenação
    if sort == "views":
        query = query.outerjoin(SkillMetricTotal, SkillMetricTotal.skill_slug == Skill.slug) \
                     .order_by(SkillMetricTotal.views.desc().nulls_last())
    elif sort == "uses":
        query = query.outerjoin(SkillMetricTotal, SkillMetricTotal.skill_slug == Skill.slug) \
                     .order_by(SkillMetricTotal.uses.desc().nulls_last())
    elif sort == "downloads":
        query = query.outerjoin(SkillMetricTotal, SkillMetricTotal.skill_slug == Skill.slug) \
                     .order_by(SkillMetricTotal.downloads.desc().nulls_last())
    elif sort == "name":
        query = query.order_by(Skill.name.asc())
    else:  # "updated" (default)
        query = query.order_by(Skill.updated_at.desc())

    # Paginação
    offset = (page - 1) * per_page
    skills = query.offset(offset).limit(per_page).all()

    return {
        "skills": [skill_to_card(s) for s in skills],
        "meta": {
            "total":       total,
            "page":        page,
            "per_page":    per_page,
            "total_pages": (total + per_page - 1) // per_page,
        },
    }


# ─────────────────────────────────────────────
# GET /skills/tags
# ─────────────────────────────────────────────

@router.get("/tags")
async def list_tags(db: Session = Depends(get_db)):
    """
    Lista todas as tags com contagem de skills.
    
    spec §1.2 — Tag / Área
    
    ⚠️  Cache Redis — PENDENTE
        Em produção: verificar `tags:all` (TTL 3600s)
    """
    # Contagem via JOIN
    results = (
        db.query(Tag, func.count(SkillTag.skill_slug).label("skill_count"))
        .outerjoin(SkillTag, SkillTag.tag_slug == Tag.slug)
        .group_by(Tag.slug)
        .order_by(func.count(SkillTag.skill_slug).desc())
        .all()
    )

    return {
        "tags": [
            {
                "slug":        tag.slug,
                "label":       tag.label,
                "skill_count": count,
                "is_featured": tag.is_featured,
            }
            for tag, count in results
        ]
    }


# ─────────────────────────────────────────────
# GET /skills/featured
# ─────────────────────────────────────────────

@router.get("/featured")
async def list_featured_skills(db: Session = Depends(get_db)):
    """
    Retorna skills em destaque.
    
    ⚠️  Cache Redis — PENDENTE
        Em produção: verificar `skills:featured` (TTL 300s)
    """
    skills = (
        db.query(Skill)
        .filter(Skill.is_featured == True, Skill.is_active == True)
        .order_by(Skill.updated_at.desc())
        .limit(12)
        .all()
    )
    return {"skills": [skill_to_card(s) for s in skills]}


# ─────────────────────────────────────────────
# GET /skills/{slug}
# ─────────────────────────────────────────────

@router.get("/{slug}")
async def get_skill(slug: str, db: Session = Depends(get_db)):
    """
    Detalhe completo de uma skill.
    
    spec §5.2 — Skill Individual (Detail)
    
    ⚠️  Cache Redis — PENDENTE
        Em produção: verificar `skill:{slug}:content` (TTL 300s)
    """
    skill = db.query(Skill).filter_by(slug=slug, is_active=True).first()
    if not skill:
        raise HTTPException(status_code=404, detail=f"Skill '{slug}' não encontrada.")
    return skill_to_detail(skill)


# ─────────────────────────────────────────────
# GET /skills/{slug}/raw
# ─────────────────────────────────────────────

@router.get("/{slug}/raw", response_class=PlainTextResponse)
async def get_skill_raw(slug: str, db: Session = Depends(get_db)):
    """
    Raw markdown da skill (SKILL.md completo com frontmatter).
    
    spec §3.2 — Direct Markdown URLs
    
    Interface primária para AIs consumirem skills — sem autenticação.
    Cache-Control: public, s-maxage=300, stale-while-revalidate=600
    """
    from fastapi import Response
    skill = db.query(Skill).filter_by(slug=slug, is_active=True).first()
    if not skill:
        raise HTTPException(status_code=404, detail=f"Skill '{slug}' não encontrada.")
    
    return PlainTextResponse(
        content=skill.content,
        headers={
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
            "Content-Type": "text/markdown; charset=utf-8",
        },
    )


# ─────────────────────────────────────────────
# POST /skills/metrics/{slug}/view
# ─────────────────────────────────────────────

@router.post("/metrics/{slug}/view")
async def track_view(slug: str, db: Session = Depends(get_db)):
    """
    Incrementa o contador de views de uma skill.
    
    spec §4.2 — Contabilização de Métricas
    
    ⚠️  Buffer Redis — PENDENTE
        Em produção:
          INCR skill:{slug}:views_buffer no Redis
          Worker periódico faz flush para skill_metrics_total a cada 1min
        
        Atualmente: incremento direto no banco (aceita latência de escrita).
    """
    metrics = db.query(SkillMetricTotal).filter_by(skill_slug=slug).first()
    if not metrics:
        # Verifica se skill existe
        skill = db.query(Skill).filter_by(slug=slug).first()
        if not skill:
            raise HTTPException(status_code=404, detail=f"Skill '{slug}' não encontrada.")
        metrics = SkillMetricTotal(skill_slug=slug, views=1, downloads=0, uses=0)
        db.add(metrics)
    else:
        metrics.views += 1
        metrics.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    return {"ok": True, "views": metrics.views}
