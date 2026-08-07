"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Star,
  Download,
  ShieldCheck,
  KeyRound,
  LogOut,
  Trash2,
  GitBranch,
  Mail,
  BadgeCheck,
  Plus,
  FileText,
  Loader2,
  Save,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useUserLibrary } from "../../contexts/UserLibraryContext";
import { fetchSkillsByIds } from "../../lib/interactions";
import { supabase } from "../../lib/supabase";
import { LegalSkill } from "../../lib/types";
import { SKILL_DETAIL_COLUMNS } from "../../lib/supabase-schema";
import { mapDbSkillsToLegalSkills } from "../../lib/skillMapper";
import CreateSkillModal from "../../components/CreateSkillModal";
import { toast } from "../../components/Toast";

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, role, isLoading, signOut, refreshProfile } = useAuth();
  const { starredIds, downloadedIds, refresh } = useUserLibrary();

  const [stars, setStars] = useState<LegalSkill[] | null>(null);
  const [downloads, setDownloads] = useState<LegalSkill[] | null>(null);
  const [mySkills, setMySkills] = useState<LegalSkill[] | null>(null);
  const [loadingLists, setLoadingLists] = useState(false);
  const [showCreateSkill, setShowCreateSkill] = useState(false);

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [prevProfileId, setPrevProfileId] = useState(profile?.id ?? null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [deleting, setDeleting] = useState(false);

  // Rota protegida: redireciona para a home se deslogado.
  useEffect(() => {
    if (!isLoading && !user) router.replace("/");
  }, [isLoading, user, router]);

  // Sincroniza os campos com o perfil carregado (derivação durante o render,
  // sem disparar setState dentro de effect).
  if ((profile?.id ?? null) !== prevProfileId) {
    setPrevProfileId(profile?.id ?? null);
    setDisplayName(profile?.display_name ?? "");
    setUsername(profile?.username ?? "");
  }

  const loadLists = useCallback(async () => {
    if (!user) return;
    setLoadingLists(true);
    try {
      const [starSkills, downloadSkills, own] = await Promise.all([
        fetchSkillsByIds(starredIds),
        fetchSkillsByIds(downloadedIds),
        supabase
          .from("skills")
          .select(SKILL_DETAIL_COLUMNS)
          .eq("author_id", user.id)
          .order("updated_at", { ascending: false }),
      ]);
      setStars(starSkills);
      setDownloads(downloadSkills);
      if (own.error) throw own.error;
      setMySkills(mapDbSkillsToLegalSkills(own.data));
    } catch (err) {
      console.warn("[Account] Erro ao carregar listas:", err);
      toast.error("Erro ao carregar dados", "Verifique as permissões (RLS) no Supabase.");
    } finally {
      setLoadingLists(false);
    }
  }, [user, starredIds, downloadedIds]);

  useEffect(() => {
    if (user) void loadLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, starredIds, downloadedIds]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName || null, username: username || null })
        .eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Perfil atualizado", "Suas informações foram salvas.");
    } catch (err) {
      toast.error("Erro ao salvar perfil", err instanceof Error ? err.message : "Tente novamente.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Senha inválida", "Use pelo menos 6 caracteres.");
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Senha alterada", "Sua senha foi atualizada com sucesso.");
      setNewPassword("");
    } catch (err) {
      toast.error("Erro ao alterar senha", err instanceof Error ? err.message : "Tente novamente.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Tem certeza? Essa ação é irreversível e apaga seu perfil, curtidas e downloads.")) return;
    setDeleting(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Sessão inválida.");
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Erro ao excluir conta.");
      await signOut();
      toast.success("Conta excluída", "Sentiremos sua falta!");
      router.replace("/");
    } catch (err) {
      toast.error("Erro ao excluir conta", err instanceof Error ? err.message : "Tente novamente.");
    } finally {
      setDeleting(false);
    }
  };

  const oabVerified = profile?.oab_verified ?? false;

  const sectionCard = "bg-card border border-border rounded-xl shadow-sm overflow-hidden";
  const sectionTitle =
    "text-sm font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-serif">Minha Conta</h1>
            <p className="text-sm text-muted mt-1">
              Gerencie seu perfil, curtidas, downloads e conexões.
            </p>
          </div>
          <button
            onClick={() => setShowCreateSkill(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dim transition-colors"
          >
            <Plus className="w-4 h-4" /> Nova Skill
          </button>
        </div>

        {/* Perfil */}
        <section className={sectionCard}>
          <div className="p-5 border-b border-border">
            <h2 className={sectionTitle}>
              <UserIcon className="w-4 h-4 text-primary" /> Perfil
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-9 h-9 text-primary" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">{profile?.display_name || "Sem nome definido"}</p>
                <p className="text-xs text-muted">{user?.email}</p>
                <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border bg-muted/30 text-muted border-border">
                  {oabVerified ? <BadgeCheck className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                  {oabVerified ? "OAB Verificado" : "OAB não verificado"}
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="display-name" className="block text-xs font-mono text-muted mb-1">Nome de exibição</label>
                  <input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="username" className="block text-xs font-mono text-muted mb-1">Username</label>
                  <input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
                  />
                </div>
              </div>
              <div className="text-xs text-muted">Cargo: <span className="font-semibold text-foreground">{role === "admin" ? "Administrador" : "Usuário"}</span></div>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted/30 transition-colors disabled:opacity-60"
              >
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar perfil
              </button>
            </div>
          </div>
        </section>

        {/* Curtidas */}
        <section className={sectionCard}>
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className={sectionTitle}>
              <Star className="w-4 h-4 text-amber-500" /> Curtidas
            </h2>
            <span className="text-xs font-mono text-muted">{stars?.length ?? 0}</span>
          </div>
          <div className="p-5">
            {loadingLists ? (
              <div className="flex items-center gap-2 text-sm text-muted"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</div>
            ) : stars && stars.length ? (
              <SkillLinks skills={stars} />
            ) : (
              <EmptyState icon={<Star className="w-5 h-5" />} text="Nenhuma skill curtida ainda." />
            )}
          </div>
        </section>

        {/* Downloads */}
        <section className={sectionCard}>
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className={sectionTitle}>
              <Download className="w-4 h-4 text-primary" /> Downloads
            </h2>
            <span className="text-xs font-mono text-muted">{downloads?.length ?? 0}</span>
          </div>
          <div className="p-5">
            {loadingLists ? (
              <div className="flex items-center gap-2 text-sm text-muted"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</div>
            ) : downloads && downloads.length ? (
              <SkillLinks skills={downloads} />
            ) : (
              <EmptyState icon={<Download className="w-5 h-5" />} text="Você ainda não baixou nenhuma skill." />
            )}
          </div>
        </section>

        {/* Minhas Skills */}
        <section className={sectionCard}>
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className={sectionTitle}>
              <FileText className="w-4 h-4 text-primary" /> Minhas Skills
            </h2>
            <span className="text-xs font-mono text-muted">{mySkills?.length ?? 0}</span>
          </div>
          <div className="p-5">
            {loadingLists ? (
              <div className="flex items-center gap-2 text-sm text-muted"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</div>
            ) : mySkills && mySkills.length ? (
              <SkillLinks skills={mySkills} />
            ) : (
              <EmptyState icon={<FileText className="w-5 h-5" />} text="Você ainda não publicou skills." />
            )}
          </div>
        </section>

        {/* Conexões */}
        <section className={sectionCard}>
          <div className="p-5 border-b border-border">
            <h2 className={sectionTitle}>
              <KeyRound className="w-4 h-4 text-primary" /> Conexões
            </h2>
          </div>
          <div className="p-5 space-y-3">
            <ConnectionRow
              icon={<Mail className="w-4 h-4" />}
              label="Google"
              status={isGoogleLinked(user?.app_metadata) ? "Conectado" : "Disponível"}
              connected={isGoogleLinked(user?.app_metadata)}
            />
            <ConnectionRow
              icon={<GitBranch className="w-4 h-4" />}
              label="GitHub"
              status="Em breve"
              connected={false}
              comingSoon
            />
            <ConnectionRow
              icon={<KeyRound className="w-4 h-4" />}
              label="API / MCP"
              status="Chave pendente"
              connected={false}
              comingSoon
            />
          </div>
        </section>

        {/* Segurança */}
        <section className={sectionCard}>
          <div className="p-5 border-b border-border">
            <h2 className={sectionTitle}>
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Segurança
            </h2>
          </div>
          <div className="p-5 space-y-6">
            <form onSubmit={handleChangePassword} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex-1 w-full">
                <label htmlFor="new-password" className="block text-xs font-mono text-muted mb-1">Nova senha</label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted/30 transition-colors disabled:opacity-60"
              >
                {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                Alterar senha
              </button>
            </form>

            <div className="border-t border-border pt-5">
              <button
                onClick={signOut}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted/30 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>

            <div className="border-t border-border pt-5">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-red-200 bg-red-50 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors disabled:opacity-60"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Excluir conta
              </button>
              <p className="text-xs text-muted mt-2">
                Exclui permanentemente seu perfil, curtidas, downloads e credenciais.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center text-xs text-muted">
          <Link href="/skills" className="hover:text-primary transition-colors">← Voltar para o catálogo</Link>
        </div>
      </div>

      <CreateSkillModal
        isOpen={showCreateSkill}
        onClose={() => setShowCreateSkill(false)}
        onSkillCreated={() => {
          setShowCreateSkill(false);
          void loadLists();
          void refresh();
        }}
        currentUserId={user?.id ?? ""}
      />
    </div>
  );
}

function SkillLinks({ skills }: { skills: LegalSkill[] }) {
  return (
    <ul className="divide-y divide-border">
      {skills.map((s) => (
        <li key={s.id}>
          <Link
            href={`/skills/${s.slug ?? s.id}`}
            className="flex items-center justify-between gap-3 py-2.5 text-sm hover:bg-muted/30 rounded-lg px-2 transition-colors"
          >
            <span className="truncate font-medium">{s.name}</span>
            <span className="shrink-0 text-xs font-mono text-muted flex items-center gap-2">
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{s.starsCount}</span>
              <span className="pill-tag">{s.vertical}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <div className="text-muted">{icon}</div>
      <p className="text-sm text-muted">{text}</p>
    </div>
  );
}

function isGoogleLinked(appMetadata: Record<string, unknown> | undefined): boolean {
  return appMetadata?.provider === "google";
}

function ConnectionRow({
  icon,
  label,
  status,
  connected,
  comingSoon = false,
}: {
  icon: React.ReactNode;
  label: string;
  status: string;
  connected: boolean;
  comingSoon?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-[11px] font-mono px-2.5 py-1 rounded-full border ${
            connected
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-muted/30 text-muted border-border"
          }`}
        >
          {status}
        </span>
        {comingSoon && <span className="text-[10px] font-mono text-muted">Breve</span>}
      </div>
    </div>
  );
}

