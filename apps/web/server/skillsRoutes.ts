import { Router, Request, Response } from "express";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { mapDbSkillToLegalSkill, mapDbSkillsToLegalSkills } from "../src/lib/skillMapper";

const CARD_COLUMNS = `
  id, slug, name, description, version,
  author_id, author_org, owner_avatar, vertical, tags, legal_area,
  quality_score, regulatory_score, compliance_checked,
  stars_count, downloads_count, review_count, rating, hot_score,
  updated_at, published_at
`;

const DETAIL_COLUMNS = `
  id, slug, name, description, version, markdown_body,
  author_id, author_org, owner_avatar, vertical, tags, legal_area,
  quality_score, regulatory_score, compliance_checked, quality_breakdown,
  stars_count, downloads_count, review_count, rating, hot_score,
  regulatory_issues, security_criteria_hits,
  playground_system_prompt, playground_test_input, playground_expected_output,
  objective, use_case, workflow, professional_role,
  updated_at, published_at, created_at
`;

let adminClient: SupabaseClient | null = null;

function getAdminClient(): SupabaseClient {
  if (adminClient) return adminClient;

  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Configure VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_KEY em apps/web/.env");
  }

  adminClient = createClient(url, key);
  return adminClient;
}

async function ensurePublishedSkills(client: SupabaseClient) {
  const { count, error } = await client
    .from("skills")
    .select("*", { count: "exact", head: true })
    .eq("is_published", false);

  if (error || !count) return;

  console.log(`[Sanfran API] Publicando ${count} skills não publicadas…`);
  await client
    .from("skills")
    .update({
      is_published: true,
      is_draft: false,
      published_at: new Date().toISOString(),
    })
    .eq("is_published", false);
}

export const skillsRouter = Router();

skillsRouter.get("/skills", async (req: Request, res: Response) => {
  try {
    const client = getAdminClient();
    await ensurePublishedSkills(client);

    const search = String(req.query.search ?? "").trim();
    const vertical = req.query.vertical ? String(req.query.vertical) : null;
    const taskCategory = req.query.taskCategory ? String(req.query.taskCategory) : null;
    const minQualityScore = Number(req.query.minQualityScore ?? 0);
    const sortBy = String(req.query.sortBy ?? "stars");
    const cursor = req.query.cursor != null ? Number(req.query.cursor) : 0;
    const pageSize = Math.min(Number(req.query.pageSize ?? 12), 50);

    let query = client
      .from("skills")
      .select(CARD_COLUMNS, { count: "exact" })
      .eq("is_published", true);

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (vertical) {
      query = query.eq("vertical", vertical);
    }

    if (taskCategory) {
      const tc = taskCategory;
      const capitalized = tc.charAt(0).toUpperCase() + tc.slice(1);
      query = query.or(
        `task_category_ids.cs.{${tc}},tags.ov.{${tc},${tc.toLowerCase()},${tc.toUpperCase()},${capitalized}}`
      );
    }

    if (minQualityScore > 0) {
      query = query.gte("quality_score", minQualityScore);
    }

    const sortColumn: Record<string, string> = {
      stars: "stars_count",
      recent: "published_at",
      score: "quality_score",
      hot: "hot_score",
    };
    query = query.order(sortColumn[sortBy] ?? "stars_count", { ascending: false });

    const from = Number.isFinite(cursor) ? cursor : 0;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) {
      console.error("[Sanfran API] skills list error:", error);
      return res.status(502).json({ error: error.message });
    }

    return res.json({
      items: mapDbSkillsToLegalSkills(data),
      nextCursor: (data?.length ?? 0) === pageSize ? to + 1 : null,
      totalCount: count ?? 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao carregar skills.";
    console.error("[Sanfran API]", message);
    return res.status(500).json({ error: message });
  }
});

skillsRouter.get("/skills/:slug", async (req: Request, res: Response) => {
  try {
    const client = getAdminClient();
    await ensurePublishedSkills(client);

    const { data, error } = await client
      .from("skills")
      .select(DETAIL_COLUMNS)
      .eq("slug", req.params.slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) {
      return res.status(502).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: "Skill não encontrada." });
    }

    return res.json(mapDbSkillToLegalSkill(data));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao carregar skill.";
    return res.status(500).json({ error: message });
  }
});

skillsRouter.get("/catalog/stats", async (_req: Request, res: Response) => {
  try {
    const client = getAdminClient();
    await ensurePublishedSkills(client);

    const [catalogRes, verticalRes, taskRes, totalRes] = await Promise.all([
      client.from("catalog_stats").select("total_published, total_oab_verified, total_downloads").maybeSingle(),
      client.from("vertical_stats").select("id, skill_count"),
      client.from("task_category_stats").select("id, skill_count"),
      client.from("skills").select("*", { count: "exact", head: true }).eq("is_published", true),
    ]);

    const verticalCounts: Record<string, number> = {};
    for (const row of verticalRes.data ?? []) {
      verticalCounts[row.id] = row.skill_count ?? 0;
    }

    const taskCategoryCounts: Record<string, number> = {};
    for (const row of taskRes.data ?? []) {
      taskCategoryCounts[row.id] = row.skill_count ?? 0;
    }

    const totalPublished = catalogRes.data?.total_published ?? totalRes.count ?? 0;

    return res.json({
      totalPublished,
      totalOabVerified: catalogRes.data?.total_oab_verified ?? 0, // skills revisadas contra OWASP Agentic Skills Top 10
      totalDownloads: catalogRes.data?.total_downloads ?? 0,
      verticalCounts,
      taskCategoryCounts,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao carregar estatísticas.";
    return res.status(500).json({ error: message });
  }
});
