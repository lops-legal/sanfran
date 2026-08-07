import { supabase } from "./supabase";
import { LegalSkill } from "./types";
import { SKILL_DETAIL_COLUMNS } from "./supabase-schema";
import { mapDbSkillsToLegalSkills } from "./skillMapper";

/**
 * Interações por usuário (curtir / baixar).
 * Todas as chamadas passam pelo anon client + RLS: o usuário só acessa
 * as próprias linhas de skill_stars / skill_downloads.
 * O incremento do contador é feito via RPC (security definer).
 */

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Você precisa estar logado para essa ação.");
  return data.user.id;
}

export async function fetchMyStars(): Promise<string[]> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("skill_stars")
    .select("skill_id")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row) => row.skill_id);
}

export async function fetchMyDownloads(): Promise<string[]> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("skill_downloads")
    .select("skill_id")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row) => row.skill_id);
}

/** Alterna a estrela e retorna o novo estado (true = curtida). */
export async function starToggle(skillId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("toggle_star", { p_skill_id: skillId });
  if (error) throw error;
  return Boolean(data);
}

export async function recordDownload(skillId: string): Promise<void> {
  const { error } = await supabase.rpc("record_download", { p_skill_id: skillId });
  if (error) throw error;
}

export async function fetchSkillsByIds(ids: string[]): Promise<LegalSkill[]> {
  if (!ids.length) return [];
  const { data, error } = await supabase.from("skills").select(SKILL_DETAIL_COLUMNS).in("id", ids);
  if (error) throw error;
  return mapDbSkillsToLegalSkills(data);
}
