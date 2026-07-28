import { Router, Request, Response } from "express";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { mapDbSkillToLegalSkill, mapDbSkillsToLegalSkills } from "../src/lib/skillMapper";
import { MOCK_SKILLS } from "../src/data";
import { LegalSkill } from "../src/types";

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
let useMockFallback = false;

function getAdminClient(): SupabaseClient {
  if (useMockFallback) {
    throw new Error("Fallback para dados mock ativado.");
  }
  if (adminClient) return adminClient;

  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key || url === "https://dummy.supabase.co") {
    console.warn("[Sanfran API] Supabase não configurado. Usando dados mock.");
    useMockFallback = true;
    throw new Error("Supabase não configurado.");
  }

  adminClient = createClient(url, key);
  return adminClient;
}

// Filtros mock
function filterMockSkills(params: {
  search?: string;
  vertical?: string | null;
  taskCategory?: string | null;
  minQualityScore?: number;
  sortBy?: string;
  cursor?: number;
  pageSize?: number;
}) {
  let filtered = [...MOCK_SKILLS] as LegalSkill[];

  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (params.vertical) {
    filtered = filtered.filter((s) => s.vertical === params.vertical);
  }

  if (params.taskCategory) {
    filtered = filtered.filter((s) =>
      s.tags.some((t) => t.toLowerCase() === params.taskCategory!.toLowerCase())
    );
  }

  if (params.minQualityScore && params.minQualityScore > 0) {
    filtered = filtered.filter((s) => s.qualityScore >= params.minQualityScore!);
  }

  // Sort
  filtered.sort((a, b) => {
    switch (params.sortBy) {
      case "stars": return b.starsCount - a.starsCount;
      case "recent": return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case "score": return b.qualityScore - a.qualityScore;
      case "hot": return b.qualityScore - a.qualityScore;
      default: return b.starsCount - a.starsCount;
    }
  });

  const cursor = params.cursor ?? 0;
  const pageSize = params.pageSize ?? 12;
  const page = filtered.slice(cursor, cursor + pageSize);

  return {
    items: page,
    nextCursor: cursor + pageSize < filtered.length ? cursor + pageSize : null,
    totalCount: filtered.length,
  };
}

// Stats mock
const MOCK_STATS = {
  totalPublished: 42,
  totalOabVerified: 28,
  totalDownloads: 12450,
  verticalCounts: {
    Trabalhista: 12,
    LGPD: 8,
    Consumidor: 10,
    Societario: 7,
    Processual: 5,
  },
  taskCategoryCounts: {
    auditoria: 42,
    peticao: 28,
    compliance: 35,
    notificacao: 19,
    pesquisa: 22,
  },
};

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
    console.warn("[Sanfran API] Usando fallback mock:", message);

    // Fallback para dados mock
    const result = filterMockSkills({
      search: String(req.query.search ?? "").trim(),
      vertical: req.query.vertical ? String(req.query.vertical) : null,
      taskCategory: req.query.taskCategory ? String(req.query.taskCategory) : null,
      minQualityScore: Number(req.query.minQualityScore ?? 0),
      sortBy: String(req.query.sortBy ?? "stars"),
      cursor: req.query.cursor != null ? Number(req.query.cursor) : 0,
      pageSize: Math.min(Number(req.query.pageSize ?? 12), 50),
    });

    return res.json(result);
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
    // Fallback mock
    const skill = MOCK_SKILLS.find((s) => s.slug === req.params.slug || s.id === req.params.slug);
    if (!skill) {
      return res.status(404).json({ error: "Skill não encontrada." });
    }
    return res.json(skill);
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
      totalOabVerified: catalogRes.data?.total_oab_verified ?? 0,
      totalDownloads: catalogRes.data?.total_downloads ?? 0,
      verticalCounts,
      taskCategoryCounts,
    });
  } catch (err) {
    console.warn("[Sanfran API] Stats fallback para mock:", err);
    return res.json(MOCK_STATS);
  }
});