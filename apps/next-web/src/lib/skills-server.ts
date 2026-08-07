import { LegalSkill } from "./types";
import { MOCK_SKILLS } from "./data";
import { getSupabaseAdmin } from "./supabaseServer";
import { SKILL_DETAIL_COLUMNS } from "./supabase-schema";
import { mapDbSkillToLegalSkill, mapDbSkillsToLegalSkills } from "./skillMapper";
import {
  CatalogStats,
  FALLBACK_STATS,
  SkillQueryParams,
  SkillQueryResult,
  queryMockSkills,
} from "./api";

/**
 * Funções de dados executadas no SERVIDOR (Route Handlers e Server
 * Components). Consultam o Supabase com a service role e caem no fallback
 * mock apenas quando o banco não está configurado ou dá erro real.
 */

const STATS_COLUMNS = "vertical, compliance_checked, downloads_count, tags, is_published, is_draft";

function sanitizeLike(q: string): string {
  // Evita quebrar a sintaxe do filtro `.or()` do PostgREST
  return q.replace(/,/g, " ").replace(/%/g, " ").replace(/_/g, " ");
}

export async function getSkillBySlug(slug: string): Promise<LegalSkill | null> {
  const db = getSupabaseAdmin();
  if (!db) return MOCK_SKILLS.find((s) => s.slug === slug || s.id === slug) ?? null;

  try {
    const { data, error } = await db
      .from("skills")
      .select(SKILL_DETAIL_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return mapDbSkillToLegalSkill(data);
  } catch (err) {
    console.warn("[Sanfran] Erro ao buscar skill no Supabase, usando mock:", err);
    return MOCK_SKILLS.find((s) => s.slug === slug || s.id === slug) ?? null;
  }
}

export async function listSkills(params: SkillQueryParams): Promise<SkillQueryResult> {
  const db = getSupabaseAdmin();
  if (!db) return queryMockSkills(params);

  try {
    let query = db.from("skills").select(SKILL_DETAIL_COLUMNS, { count: "exact" });

    if (params.search) {
      const q = sanitizeLike(params.search);
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }
    if (params.vertical) query = query.eq("vertical", params.vertical);
    if (params.taskCategory) query = query.contains("tags", [params.taskCategory]);
    if ((params.minQualityScore ?? 0) > 0) query = query.gte("quality_score", params.minQualityScore ?? 0);

    const sortMap: Record<string, string> = {
      recent: "updated_at",
      score: "quality_score",
      hot: "hot_score",
      stars: "stars_count",
    };
    const sortColumn = sortMap[params.sortBy ?? "stars"] ?? "stars_count";
    query = query.order(sortColumn, { ascending: false }).order("created_at", { ascending: false });

    const offset = params.cursor ?? 0;
    const pageSize = Math.max(1, Math.min(params.pageSize ?? 12, 50));
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    const total = count ?? data?.length ?? 0;
    const loaded = data?.length ?? 0;
    const nextCursor = offset + loaded < total ? offset + loaded : null;

    return { skills: mapDbSkillsToLegalSkills(data), nextCursor, total };
  } catch (err) {
    console.warn("[Sanfran] Erro ao listar skills no Supabase, usando mock:", err);
    return queryMockSkills(params);
  }
}

export async function getCatalogStats(): Promise<CatalogStats> {
  const db = getSupabaseAdmin();
  if (!db) return FALLBACK_STATS;

  try {
    const { data, error } = await db.from("skills").select(STATS_COLUMNS);
    if (error) throw error;

    const rows = (data ?? []) as Array<{
      vertical: string | null;
      compliance_checked: boolean | null;
      downloads_count: number | null;
      tags: string[] | null;
      is_published: boolean | null;
      is_draft: boolean | null;
    }>;

    const published = rows.filter((r) => r.is_published !== false && r.is_draft !== true);

    const verticalCounts: Record<string, number> = {};
    const taskCategoryCounts: Record<string, number> = {};

    for (const row of published) {
      if (row.vertical) verticalCounts[row.vertical] = (verticalCounts[row.vertical] ?? 0) + 1;
      for (const tag of row.tags ?? []) {
        taskCategoryCounts[tag] = (taskCategoryCounts[tag] ?? 0) + 1;
      }
    }

    return {
      totalPublished: published.length,
      totalOabVerified: published.filter((r) => r.compliance_checked).length,
      totalDownloads: published.reduce((sum, r) => sum + (r.downloads_count ?? 0), 0),
      verticalCounts,
      taskCategoryCounts,
    };
  } catch (err) {
    console.warn("[Sanfran] Erro ao calcular stats no Supabase, usando fallback:", err);
    return FALLBACK_STATS;
  }
}
