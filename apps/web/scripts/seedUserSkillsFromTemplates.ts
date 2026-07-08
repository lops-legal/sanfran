// scripts/seedUserSkillsFromTemplates.ts
import { createClient } from "@supabase/supabase-js";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Diretório onde você coloca os arquivos .md que representam cada skill
const TEMPLATES_DIR = join(__dirname, "../skill_templates");

/**
 * Cria/atualiza skill para um usuário específico.
 * Usa `upsert` com conflito em (author_id, slug) para evitar duplicação.
 */
async function upsertSkillForUser(userId: string, slug: string, markdown: string) {
  const skill = {
    slug,
    name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    description: `Skill automática para o usuário ${userId}`,
    markdown_body: markdown,
    version: "1.0.0",
    is_published: true,
    is_draft: false,
    author_id: userId,
    owner_avatar: "⚖️",
    vertical: "Consumidor", // ajuste conforme necessidade
    tags: ["auto"],
    quality_score: 80,
    regulatory_score: 80,
    compliance_checked: true,
    stars_count: 0,
    downloads_count: 0,
    review_count: 0,
    rating: 0,
  } as any;

  const { error } = await supabase.from("skills").upsert(skill, { onConflict: "author_id,slug" });
  if (error) console.error(`❌ erro ao inserir skill ${slug} para ${userId}:`, error.message);
  else console.log(`✅ skill ${slug} inserida/atualizada para ${userId}`);
}

async function main() {
  // 1️⃣ Busca todos os usuários (profiles) que têm id (uuid)
  const { data: users, error: userErr } = await supabase.from("profiles").select("id");
  if (userErr) {
    console.error("❌ Erro ao buscar perfis:", userErr.message);
    return;
  }
  if (!users?.length) {
    console.warn("⚠️ Nenhum perfil encontrado.");
    return;
  }

  // 2️⃣ Lê todos os templates .md
  const files = readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith('.md'));
  if (!files.length) {
    console.warn("⚠️ Nenhum template .md encontrado em", TEMPLATES_DIR);
    return;
  }

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const markdown = readFileSync(join(TEMPLATES_DIR, file), "utf-8");
    for (const user of users as any[]) {
      await upsertSkillForUser(user.id, slug, markdown);
    }
  }

  console.log("🎉 Processo concluído.");
}

main();
