import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseServer";

export const dynamic = "force-dynamic";

/**
 * Exclusão de conta — nunca confia no `userId` vindo do body.
 * Valida a sessão via Bearer token com `supabase.auth.getUser()`.
 */
export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 500 });
  }

  try {
    const { data, error } = await db.auth.getUser(token);
    if (error || !data.user) {
      return NextResponse.json({ error: "Sessão inválida ou expirada." }, { status: 401 });
    }

    const userId = data.user.id;

    // Remove o perfil (se existir) e depois o usuário de auth.
    await db.from("profiles").delete().eq("id", userId);
    const { error: deleteError } = await db.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Sanfran] Erro ao excluir conta:", err);
    return NextResponse.json({ error: "Erro ao excluir a conta." }, { status: 500 });
  }
}
