import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRLS() {
  console.log("=== TESTANDO RLS COM ANON KEY ===\n");

  // Test 1: READ
  console.log("1. Tentando LER skills (SELECT)...");
  const { data: readData, error: readError } = await supabase.from("skills").select("*").limit(1);
  if (readError) {
    console.log("❌ Falha na leitura (RLS bloqueou ou erro):", readError.message);
  } else {
    console.log("✅ Leitura permitida! Encontrou", readData.length, "registros.");
  }

  // Test 2: INSERT
  console.log("\n2. Tentando INSERIR uma skill fake (INSERT)...");
  const fakeSlug = "test-rls-slug-" + Date.now();
  const { data: insertData, error: insertError } = await supabase.from("skills").insert([{
    slug: fakeSlug,
    name: "Hacked Skill",
    description: "RLS Test",
    markdown_body: "Test"
  }]).select();
  
  if (insertError) {
    console.log("❌ Falha na inserção (RLS bloqueou ou erro):", insertError.message);
  } else {
    console.log("✅ Inserção permitida! Registro criado:", insertData?.[0]?.slug);
    
    // Test 3: UPDATE (only if insert succeeded)
    console.log("\n3. Tentando ATUALIZAR a skill inserida (UPDATE)...");
    const { data: updateData, error: updateError } = await supabase.from("skills")
      .update({ name: "Updated Hacked Skill" })
      .eq("slug", fakeSlug)
      .select();
      
    if (updateError) {
      console.log("❌ Falha na atualização:", updateError.message);
    } else if (updateData && updateData.length > 0) {
      console.log("✅ Atualização permitida!");
    } else {
      console.log("❌ Atualização falhou silenciosamente (RLS pode estar bloqueando o retorno).");
    }

    // Test 4: DELETE (only if insert succeeded)
    console.log("\n4. Tentando DELETAR a skill inserida (DELETE)...");
    const { data: deleteData, error: deleteError } = await supabase.from("skills")
      .delete()
      .eq("slug", fakeSlug)
      .select();
      
    if (deleteError) {
      console.log("❌ Falha na deleção:", deleteError.message);
    } else if (deleteData && deleteData.length > 0) {
      console.log("✅ Deleção permitida! Registro apagado.");
    } else {
      console.log("❌ Deleção falhou silenciosamente (RLS pode estar bloqueando).");
    }
  }
}

testRLS();
