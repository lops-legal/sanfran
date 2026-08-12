import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseServer";

export async function POST(request: NextRequest) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 });

  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const token = authHeader.split(" ")[1];
  
  // 1. Validar se o solicitante é ADMIN
  const { data: { user }, error: authError } = await db.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });

  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Acesso restrito a administradores" }, { status: 403 });
  }

  // 2. Executar alteração
  try {
    const { profileId, newRole } = await request.json();
    
    if (!profileId || !["user", "admin"].includes(newRole)) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }

    // Impedir que o admin remova o próprio acesso admin por acidente (opcional, mas recomendado)
    if (profileId === user.id && newRole !== "admin") {
      return NextResponse.json({ error: "Não é possível remover seu próprio cargo de admin" }, { status: 400 });
    }

    const { error } = await db
      .from("profiles")
      .update({ role: newRole })
      .eq("id", profileId);

    if (error) throw error;

    return NextResponse.json({ success: true, profileId, role: newRole });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erro ao atualizar cargo" }, { status: 400 });
  }
}
