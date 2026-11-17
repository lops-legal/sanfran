import { LegalSkill } from "./types";
import { getSupabaseAdmin } from "./supabaseServer";
import { SKILL_DETAIL_COLUMNS } from "./supabase-schema";
import { mapDbSkillToLegalSkill, mapDbSkillsToLegalSkills } from "./skillMapper";
import { CatalogStats, SkillQueryParams, SkillQueryResult } from "./api";
import { getRepoSkill, queryRepoSkills, repoStats, searchRepoSkills, toLegalSkill } from "./catalog";

/**
 * Funções de dados executadas no SERVIDOR (Route Handlers e Server Components).
 *
 * Fonte principal: skills versionadas no repositório (content/skills).
 * Complemento: skills cadastradas no Supabase pelo site — exceto as importadas
 * em inglês (frontmatter `language: en`), que não pertencem ao catálogo brasileiro.
 */

const STATS_COLUMNS = "vertical, compliance_checked, downloads_count, tags, is_published, is_draft";
const EXCLUDE_ENGLISH = "%language: en%";

/**
 * Sanitiza a string de busca para evitar injeção de sintaxe no filtro `.or()` do PostgREST
 * e caracteres curinga indesejados no ILIKE do PostgreSQL.
 */
function sanitizeLike(q: string): string {
  return q
    .replace(/[%,_]/g, "\\$&")
    .replace(/[()]/g, "")
    .replace(/,/g, " ")
    .trim();
}

export async function getSkillBySlug(slug: string): Promise<LegalSkill | null> {
  const local = getRepoSkill(slug);
  if (local) return toLegalSkill(local);

  const db = getSupabaseAdmin();
  if (!db) return null;
  try {
    const { data, error } = await db
      .from("skills")
      .select(SKILL_DETAIL_COLUMNS)
      .eq("slug", slug)
      .not("markdown_body", "ilike", EXCLUDE_ENGLISH)
      .maybeSingle();
    if (error) throw error;
    return data ? mapDbSkillToLegalSkill(data) : null;
  } catch (err) {
    console.warn("[Sanfran] Erro ao buscar skill no Supabase:", err);
    return null;
  }
}

export async function listSkills(params: SkillQueryParams): Promise<SkillQueryResult> {
  const pageSize = Math.max(1, Math.min(params.pageSize ?? 12, 50));
  const offset = params.cursor ?? 0;

  const repoTotal = searchRepoSkills(params.search ?? "", { area: params.vertical }).length;
  const repoPage = offset < repoTotal ? queryRepoSkills({ ...params, cursor: offset, pageSize }).skills : [];

  const db = getSupabaseAdmin();
  if (!db) {
    return { skills: repoPage, total: repoTotal, nextCursor: offset + repoPage.length < repoTotal ? offset + repoPage.length : null };
  }

  try {
    const dbOffset = Math.max(0, offset - repoTotal);
    const dbLimit = pageSize - repoPage.length;

    let query = db
      .from("skills")
      .select(SKILL_DETAIL_COLUMNS, { count: "exact" })
      .not("markdown_body", "ilike", EXCLUDE_ENGLISH)
      .not("is_published", "is", false);

    if (params.search) {
      const q = sanitizeLike(params.search);
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }
    if (params.vertical) query = query.eq("vertical", params.vertical);
    if (params.taskCategory) query = query.contains("tags", [params.taskCategory]);
    if ((params.minQualityScore ?? 0) > 0) query = query.gte("quality_score", params.minQualityScore ?? 0);

    const sortMap: Record<string, string> = { recent: "updated_at", score: "quality_score", hot: "hot_score", stars: "stars_count" };
    const sortColumn = sortMap[params.sortBy ?? "stars"] ?? "stars_count";
    query = query.order(sortColumn, { ascending: false }).order("created_at", { ascending: false });
    // range com limite 0 ainda traz 1 linha; quando a página já está cheia, só queremos a contagem.
    query = query.range(dbOffset, dbOffset + Math.max(dbLimit, 1) - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    const dbSkills = dbLimit > 0 ? mapDbSkillsToLegalSkills(data) : [];
    const total = repoTotal + (count ?? 0);
    const loaded = offset + repoPage.length + dbSkills.length;
    return { skills: [...repoPage, ...dbSkills], total, nextCursor: loaded < total ? loaded : null };
  } catch (err) {
    console.warn("[Sanfran] Erro ao listar skills no Supabase:", err);
    return { skills: repoPage, total: repoTotal, nextCursor: offset + repoPage.length < repoTotal ? offset + repoPage.length : null };
  }
}

export async function getCatalogStats(): Promise<CatalogStats> {
  const stats = repoStats();
  const db = getSupabaseAdmin();
  if (!db) return stats;

  try {
    const { data, error } = await db.from("skills").select(STATS_COLUMNS).not("markdown_body", "ilike", EXCLUDE_ENGLISH);
    if (error) throw error;

    const rows = (data ?? []) as Array<{
      vertical: string | null;
      compliance_checked: boolean | null;
      downloads_count: number | null;
      is_published: boolean | null;
      is_draft: boolean | null;
    }>;
    const published = rows.filter((r) => r.is_published !== false && r.is_draft !== true);

    for (const row of published) {
      if (row.vertical) stats.verticalCounts[row.vertical] = (stats.verticalCounts[row.vertical] ?? 0) + 1;
    }
    stats.totalPublished += published.length;
    stats.totalOabVerified += published.filter((r) => r.compliance_checked).length;
    stats.totalDownloads += published.reduce((sum, r) => sum + (r.downloads_count ?? 0), 0);
    return stats;
  } catch (err) {
    console.warn("[Sanfran] Erro ao calcular stats no Supabase:", err);
    return stats;
  }
}
