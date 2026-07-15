/**
 * Marca todas as skills como publicadas no Supabase.
 * Necessário para que o frontend (anon key + RLS) consiga ler os dados.
 *
 * Uso:
 *   cd apps/web
 *   node publish_all_skills.js
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Configure VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_KEY em apps/web/.env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { count, error: countError } = await supabase
    .from("skills")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("❌ Erro ao contar skills:", countError.message, countError.details, countError.hint);
    process.exit(1);
  }

  console.log(`📦 Total de skills no banco: ${count ?? 0}`);

  const { data, error } = await supabase
    .from("skills")
    .update({
      is_published: true,
      is_draft: false,
      published_at: new Date().toISOString(),
    })
    .eq("is_published", false)
    .select("id");

  if (error) {
    console.error("❌ Erro ao publicar skills:", error.message);
    process.exit(1);
  }

  const publishedNow = data?.length ?? 0;
  console.log(`✅ ${publishedNow} skills marcadas como publicadas.`);

  const { count: publishedCount, error: publishedError } = await supabase
    .from("skills")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  if (publishedError) {
    console.error("⚠️  Não foi possível confirmar total publicado:", publishedError.message);
  } else {
    console.log(`📊 Skills publicadas agora: ${publishedCount ?? 0}`);
  }

  console.log("\nℹ️  Se as views materializadas existirem, rode no SQL Editor:");
  console.log("   REFRESH MATERIALIZED VIEW catalog_stats;");
  console.log("   REFRESH MATERIALIZED VIEW vertical_stats;");
  console.log("   REFRESH MATERIALIZED VIEW task_category_stats;");
}

main().catch((err) => {
  console.error("💥 Erro fatal:", err.message);
  process.exit(1);
});
