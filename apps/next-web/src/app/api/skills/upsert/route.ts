import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseServer";
import { mapDbSkillToLegalSkill } from "../../../../lib/skillMapper";
import { SKILL_DETAIL_COLUMNS } from "../../../../lib/supabase-schema";

export async function POST(request: NextRequest) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 });
  }

  // 1. Validar autenticação (Token Bearer)
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const { data: { user }, error: authError } = await db.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }

  // 2. Processar payload
  try {
    const body = await request.json();
    
    // Sanitização básica: forçar author_id do usuário logado
    const skillData = {
      ...body,
      author_id: user.id,
      // Campos sensíveis que o cliente não deve sobrescrever livremente se não for admin
      // (Para simplificar, mantemos o que vem, mas em prod idealmente validaríamos contra o perfil)
    };

    const { data, error } = await db
      .from("skills")
      .upsert(skillData, { onConflict: "slug" })
      .select(SKILL_DETAIL_COLUMNS)
      .single();

    if (error) throw error;

    return NextResponse.json(mapDbSkillToLegalSkill(data));
  } catch (err: any) {
    console.error("[API Skills Upsert] Erro:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao salvar skill" },
      { status: 400 }
    );
  }
}
