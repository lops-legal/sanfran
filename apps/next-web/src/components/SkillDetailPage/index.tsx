"use client";

import React, { useState } from "react";
import Link from "next/link";
import SkillMarkdownCard from "./SkillMarkdownCard";
import { LegalSkill } from "../../lib/types";
import { useAuth } from "../../contexts/AuthContext";
import { useUserLibrary } from "../../contexts/UserLibraryContext";
import { toast } from "../Toast";
import AuthModal from "../AuthModal";
import { ReviewBadge, SKILL_TYPE_LABEL } from "../ReviewBadge";
import { ArrowLeft, Check, ClipboardCopy, Download, ExternalLink, FileText, Folder, Link2, Plug, Star } from "lucide-react";

interface SkillDetailPageProps {
  skill: LegalSkill;
  onBack: () => void;
}

function formatDate(iso: string) {
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right min-w-0">{children}</span>
    </div>
  );
}

export default function SkillDetailPage({ skill, onBack }: SkillDetailPageProps) {
  const [starring, setStarring] = useState(false);
  const [copied, setCopied] = useState<"skill" | "link" | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const { isStarred, toggleStar, recordDownload } = useUserLibrary();
  const starred = isStarred(skill.id);
  const slug = skill.slug ?? skill.id;

  const flash = (what: "skill" | "link") => {
    setCopied(what);
    setTimeout(() => setCopied(null), 1500);
  };

  const copySkill = async () => {
    try {
      await navigator.clipboard.writeText(skill.markdownContent || "");
      flash("skill");
      toast.success("Skill copiada", "Cole no início da conversa com o seu assistente e depois descreva o caso.");
    } catch {
      toast.error("Não foi possível copiar", "Selecione o texto da skill e copie manualmente.");
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/skills/${slug}.md`);
      flash("link");
    } catch {}
  };

  const download = async () => {
    if (!skill.markdownContent) return;
    const blob = new Blob([skill.markdownContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.SKILL.md`;
    a.click();
    URL.revokeObjectURL(url);
    if (user) {
      try {
        await recordDownload(skill.id);
      } catch {}
    }
  };

  const handleToggleStar = async () => {
    if (!user) return setShowAuthModal(true);
    setStarring(true);
    try {
      await toggleStar(skill.id);
    } catch (err: unknown) {
      toast.error("Erro ao salvar", err instanceof Error ? err.message : "Tente novamente.");
    } finally {
      setStarring(false);
    }
  };

  const files = skill.files?.length ? skill.files : ["SKILL.md"];

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-10 md:py-14">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        Skills
      </button>

      <header className="space-y-4 mb-10 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wide text-muted-foreground">{skill.vertical}</span>
          {skill.tags.slice(0, 4).map((t) => (
            <span key={t} className="text-xs font-mono uppercase tracking-wide text-muted-foreground">· {t}</span>
          ))}
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">{skill.name}</h1>
        <p className="text-sm text-muted-foreground">
          {skill.ownerName} · {formatDate(skill.updatedAt)}
        </p>
        <p className="text-base leading-relaxed">{skill.description}</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        {/* Conteúdo */}
        <div className="min-w-0 space-y-8">

          {skill.reviewStatus && skill.reviewStatus !== "revisada" && (
            <div className="rounded-lg border border-border bg-subtle/50 p-4 text-sm text-muted-foreground">
              <b className="text-foreground font-medium">Ainda sem revisão jurídica final.</b> Use como apoio e confira a
              fundamentação antes de usar o resultado em um caso real.
            </div>
          )}

          <section className="space-y-3">
            <h2 className="text-xs font-sans font-medium uppercase tracking-wider text-muted-foreground">O que está incluído</h2>
            <div className="rounded-lg border border-border bg-card p-4 font-mono text-sm space-y-1.5">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-muted-foreground" aria-hidden />
                {slug}/
              </div>
              {files.map((f) => (
                <div key={f} className="flex items-center gap-2 pl-6 text-muted-foreground">
                  <FileText className="w-3.5 h-3.5" aria-hidden />
                  {f}
                </div>
              ))}
            </div>
          </section>

          <SkillMarkdownCard skill={skill} />
        </div>

        {/* Painel lateral */}
        <aside className="space-y-4 order-first lg:order-none lg:sticky lg:top-24 self-start">
          <div className="rounded-lg border border-border bg-card p-5 space-y-3">
            <p className="text-sm font-medium">Usar esta skill</p>
            <button
              onClick={copySkill}
              className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {copied === "skill" ? <Check className="w-4 h-4" /> : <ClipboardCopy className="w-4 h-4" />}
              {copied === "skill" ? "Copiada" : "Copiar skill"}
            </button>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cole no início da conversa no Claude, ChatGPT, Grok ou Manus e depois descreva o caso.
            </p>
            <Link
              href="/integrate"
              className="w-full inline-flex items-center justify-center gap-2 h-9 rounded-full border border-border bg-foreground/[0.045] hover:bg-foreground/10 text-sm font-medium transition-colors"
            >
              <Plug className="w-4 h-4" />
              Conectar ao assistente
            </Link>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button onClick={download} className="inline-flex flex-col items-center gap-1 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-subtle transition-colors">
                <Download className="w-4 h-4" />
                Baixar
              </button>
              <button onClick={copyLink} className="inline-flex flex-col items-center gap-1 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-subtle transition-colors">
                {copied === "link" ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                {copied === "link" ? "Copiado" : "Link .md"}
              </button>
              <button
                onClick={handleToggleStar}
                disabled={starring}
                className="inline-flex flex-col items-center gap-1 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-subtle transition-colors disabled:opacity-50"
              >
                <Star className={`w-4 h-4 ${starred ? "fill-current text-foreground" : ""}`} />
                {starred ? "Salva" : "Salvar"}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card px-5 py-3 divide-y divide-border">
            <DetailRow label="Revisão"><ReviewBadge skill={skill} /></DetailRow>
            {skill.skillType && <DetailRow label="Tipo">{SKILL_TYPE_LABEL[skill.skillType]}</DetailRow>}
            <DetailRow label="Área">{skill.vertical}</DetailRow>
            <DetailRow label="Versão">{skill.version}</DetailRow>
            <DetailRow label="Autor">{skill.ownerName}</DetailRow>
            <DetailRow label="Atualizada">{formatDate(skill.updatedAt)}</DetailRow>
          </div>

          {skill.legalBasis && skill.legalBasis.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-5 space-y-3">
              <p className="text-sm font-medium">Base normativa</p>
              <ul className="space-y-2.5">
                {skill.legalBasis.map((b) => (
                  <li key={b.ref} className="text-sm">
                    {b.url ? (
                      <a href={b.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 hover:underline underline-offset-2">
                        {b.ref}
                        <ExternalLink className="w-3 h-3 mt-1 shrink-0 text-muted-foreground" aria-hidden />
                      </a>
                    ) : (
                      b.ref
                    )}
                    {b.checkedAt && <span className="block text-xs text-muted-foreground">Conferido em {formatDate(b.checkedAt)}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
