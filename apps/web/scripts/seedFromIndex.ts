/**
 * seedFromIndex.ts
 * 
 * Reads the skills_index.json from the antigravity-awesome-skills repo
 * and bulk-inserts all skills into Supabase.
 * 
 * Usage:
 *   npx tsx scripts/seedFromIndex.ts
 * 
 * Requires .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

/** Map the `category` field from skills_index.json → our `vertical` column */
function mapCategoryToVertical(category: string): string {
  const lower = category.toLowerCase();
  if (["legal", "compliance", "gdpr"].includes(lower)) return "Consumidor";
  if (lower.includes("security") || lower.includes("pentest")) return "LGPD";
  if (lower.includes("devops") || lower.includes("deploy")) return "Societario";
  if (lower.includes("ai") || lower.includes("ml") || lower.includes("agent")) return "Processual";
  if (lower.includes("design") || lower.includes("frontend") || lower.includes("ui")) return "Trabalhista";
  // Distribute remaining categories across verticals pseudo-randomly
  const hash = lower.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const verticals = ["Trabalhista", "LGPD", "Consumidor", "Societario", "Processual"];
  return verticals[hash % verticals.length];
}

/** Generate a plausible quality_score from risk level */
function riskToQuality(risk: string): number {
  switch (risk) {
    case "safe": return 85 + Math.floor(Math.random() * 15);   // 85-99
    case "critical": return 60 + Math.floor(Math.random() * 15); // 60-74
    case "offensive": return 40 + Math.floor(Math.random() * 20); // 40-59
    case "unknown": return 65 + Math.floor(Math.random() * 20); // 65-84
    default: return 70 + Math.floor(Math.random() * 20);
  }
}

/** Generate a plausible regulatory_score */
function riskToRegulatory(risk: string): number {
  switch (risk) {
    case "safe": return 90 + Math.floor(Math.random() * 10);
    case "critical": return 50 + Math.floor(Math.random() * 20);
    case "offensive": return 30 + Math.floor(Math.random() * 20);
    default: return 70 + Math.floor(Math.random() * 20);
  }
}

/** Pick a random avatar emoji */
function randomAvatar(): string {
  const avatars = ["⚖️", "🎓", "🦊", "🏫", "🔒", "🤖", "📚", "💡", "🔬", "🛡️", "⚡", "🧠"];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface SkillIndexEntry {
  id: string;
  path: string;
  category: string;
  name: string;
  description: string;
  risk: string;
  source: string;
  date_added: string | null;
  plugin: {
    targets: Record<string, string>;
    setup: { type: string; summary: string; docs: string | null };
    reasons: string[];
  };
}

async function main() {
  // Resolve the path to skills_index.json relative to the project root
  const indexPath = path.resolve(__dirname, "../../../antigravity-awesome-skills/skills_index.json");

  if (!fs.existsSync(indexPath)) {
    console.error(`❌ File not found: ${indexPath}`);
    console.error("   Make sure the antigravity-awesome-skills repo is at the project root.");
    process.exit(1);
  }

  console.log("📂 Reading skills_index.json...");
  const raw = fs.readFileSync(indexPath, "utf-8");
  const entries: SkillIndexEntry[] = JSON.parse(raw);
  console.log(`   Found ${entries.length} skills in the index.`);

  // Build DB rows from the index entries
  const rows = entries.map((entry) => {
    const quality = riskToQuality(entry.risk);
    const regulatory = riskToRegulatory(entry.risk);
    const stars = Math.floor(Math.random() * 2500);
    const downloads = Math.floor(Math.random() * 5000);
    const reviews = Math.floor(Math.random() * 50);
    const rating = +(3.5 + Math.random() * 1.5).toFixed(1);

    // Extract tags from category + id parts
    const idParts = entry.id.split("-").filter((p) => p.length > 2);
    const tags = [...new Set([entry.category, ...idParts.slice(0, 3)])].filter(Boolean);

    return {
      slug: entry.id,
      name: entry.name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      description: entry.description || `Skill: ${entry.name}`,
      markdown_body: `# ${entry.name}\n\n${entry.description || "No description provided."}\n\n## Source\n\n${entry.source || "community"}\n\n## Risk Level\n\n${entry.risk || "unknown"}`,
      version: "1.0.0",
      is_published: true,
      is_draft: false,
      owner_avatar: randomAvatar(),
      vertical: mapCategoryToVertical(entry.category),
      tags,
      legal_area: entry.category,
      quality_score: quality,
      regulatory_score: regulatory,
      compliance_checked: entry.risk === "safe",
      stars_count: stars,
      downloads_count: downloads,
      review_count: reviews,
      rating,
      hot_score: Math.floor(stars * 0.4 + downloads * 0.3 + quality * 2),
      published_at: entry.date_added ? new Date(entry.date_added).toISOString() : new Date().toISOString(),
    };
  });

  // Insert in batches of 50 to avoid timeout
  const BATCH_SIZE = 50;
  let success = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("skills")
      .upsert(batch, { onConflict: "slug" });

    if (error) {
      console.error(`❌ Batch ${i / BATCH_SIZE + 1} failed:`, error.message);
      failed += batch.length;
    } else {
      success += batch.length;
      const pct = ((i + batch.length) / rows.length * 100).toFixed(0);
      process.stdout.write(`\r   ✅ ${success} inserted, ${failed} failed (${pct}%)`);
    }
  }

  console.log(`\n\n🎉 Seeding complete: ${success} skills inserted, ${failed} failed.`);
  if (failed > 0) {
    console.log("\n❌ Seeding failed because of RLS policies. Please ensure you have run the policies from 'supabase_setup.sql' and 'supabase_indexes_and_audit.sql' in the Supabase SQL Editor first!");
  }
  console.log("\n⚠️  Run the following in the Supabase SQL Editor to refresh stats:");
  console.log("    REFRESH MATERIALIZED VIEW catalog_stats;");
  console.log("    REFRESH MATERIALIZED VIEW vertical_stats;");
  console.log("    REFRESH MATERIALIZED VIEW task_category_stats;");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
