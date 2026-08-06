"use client";

import React, { useState, useRef, useEffect, useMemo, useTransition, useCallback } from "react";
import { LegalSkill } from "../lib/types";
import SkillCard from "./SkillCard";
import {
  Search, X, Loader2, AlertTriangle, Inbox, Plus,
  ChevronLeft, ChevronRight, ChevronDown,
  Download, Verified, Lock,
  Sparkles, TrendingUp,
} from "lucide-react";
import {
  useInfiniteSkills, useInfiniteScrollSentinel,
  SortOption,
} from "../hooks/useInfiniteSkills";
import { useCatalogStats } from "../hooks/useCatalogStats";
import { useInView } from "../hooks/useInView";
import CreateSkillModal from "./CreateSkillModal";
import AuthModal from "./AuthModal";
import { toast } from "./Toast";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

// Import cinematic styles for paper textures & reveals
import "../styles/home-cinematic.css";

// ---------------------------------------------------------------------------
// URL Sync helpers
// ---------------------------------------------------------------------------
function readSearchParams() {
  if (typeof window === "undefined") {
    return { q: "", sort: "stars" as SortOption };
  }
  const p = new URLSearchParams(window.location.search);
  return {
    q: p.get("q") ?? "",
    sort: (p.get("sort") ?? "stars") as SortOption,
  };
}

function pushSearchParams(params: {
  q: string; sort: SortOption;
}) {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams();
  if (params.q) p.set("q", params.q);
  if (params.sort !== "stars") p.set("sort", params.sort);
  const search = p.toString();
  window.history.replaceState(null, "", search ? `?${search}` : window.location.pathname);
}

// ---------------------------------------------------------------------------
// Props & constants
// ---------------------------------------------------------------------------
interface MarketplaceProps { onSelectSkill: (skill: LegalSkill) => void; }

const PAGE_SIZE = 12;

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "stars", label: "Popular" },
  { id: "score", label: "Qualidade" },
  { id: "hot", label: "Em alta" },
  { id: "recent", label: "Recente" },
];

const VERTICAL_ICONS: Record<string, string> = {
  Trabalhista: "briefcase",
  LGPD: "shield",
  Consumidor: "shopping-bag",
  Societario: "file-signature",
  Processual: "scale",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Marketplace({ onSelectSkill }: MarketplaceProps) {
  const initial = readSearchParams();
  const { stats: catalogStats, isLoading: statsLoading } = useCatalogStats();
  const { user } = useAuth();

  const [searchInput, setSearchInput] = useState(initial.q);
  const [sortBy, setSortBy] = useState<SortOption>(initial.sort);
  const [currentPage, setCurrentPage] = useState(1);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  // Scroll-reveal refs
  const { ref: heroRef, inView: heroInView } = useInView<HTMLDivElement>({ threshold: 0.1 });
  const { ref: highlightsRef, inView: highlightsInView } = useInView<HTMLDivElement>({ threshold: 0.15 });

  useEffect(() => {
    pushSearchParams({ q: searchInput, sort: sortBy });
  }, [searchInput, sortBy]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "/" && !(document.activeElement instanceof HTMLInputElement)) {
        e.preventDefault(); searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const { items, totalCount, isLoading, isLoadingMore, error, hasMore, loadMore, retry, mutateItems } = useInfiniteSkills({
    search: searchInput, vertical: null, taskCategory: null, minQualityScore: 0, sortBy, pageSize: PAGE_SIZE,
  });

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreate = useCallback((s: LegalSkill) => {
    mutateItems(prev => [s, ...prev]);
    toast.success("Skill publicada!", `"${s.name}" aparece no topo do catálogo.`);
  }, [mutateItems]);

  // Não-logados veem apenas um preview de 10 skills; o restante exige login.
  const isPreview = !user;
  const PREVIEW_LIMIT = 10;
  const visibleItems = isPreview ? items.slice(0, PREVIEW_LIMIT) : items;

  const sentinelRef = useInfiniteScrollSentinel(loadMore, !isPreview && hasMore && !isLoading && !error);

  const activeFilters = searchInput ? 1 : 0;

  const clearFilters = useCallback(() => {
    startTransition(() => { setSearchInput(""); });
  }, [startTransition]);

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + window.location.pathname },
    });
    if (error) console.error("Erro ao conectar com Google:", error.message);
  };

  const totalPub = catalogStats.totalPublished;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  // Derive highlights from loaded items (top 3 by quality score)
  const highlights = useMemo(() => {
    if (!items.length) return [];
    return [...items]
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, 3)
      .map((s, i) => ({
        id: s.id,
        name: s.name,
        desc: s.description,
        vertical: s.vertical,
        downloads: s.starsCount,
        score: s.qualityScore,
        compliance: s.complianceChecked ? "Total" : s.regulatoryScore >= 80 ? "Alto" : "Moderado",
        trending: i === 0,
        skill: s,
      }));
  }, [items]);

  const maxHighlightPages = Math.max(0, highlights.length - 3);

  const complianceStyle = (level: string) => {
    const m: Record<string, string> = {
      Total: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      Alto: "bg-amber-50 text-amber-700 border border-amber-200",
      Moderado: "bg-gray-100 text-gray-600 border border-gray-200",
    };
    return `pill-tag ${m[level] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`;
  };

  return (
    <div id="marketplace" className="bg-background text-foreground font-sans pb-section-gap">

      {/* ======================== HERO ======================== */}
      <section className="paper-texture paper-seda relative pt-24 md:pt-32 lg:pt-[140px] pb-20 px-margin-desktop border-b border-border overflow-hidden" style={{ background: "linear-gradient(180deg, #fff8f5 0%, #F9F7F5 100%)" }}>
        <div ref={heroRef} className="max-w-4xl mx-auto text-center flex flex-col items-center relative z-10">

          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-border shadow-sm mb-8 transition-all duration-700 transform ${heroInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            <span className="text-[11px] font-mono text-muted">
              Catálogo atualizado com <span className="font-semibold text-foreground">{statsLoading ? "..." : totalPub} skills</span>
            </span>
          </div>

          <h1 className={`text-4xl sm:text-5xl font-bold text-foreground tracking-tight leading-[1.1] mb-5 font-serif transition-all duration-700 delay-100 transform ${heroInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            Catálogo de Skills Jurídicas
          </h1>
          <p className={`text-base text-muted leading-relaxed mb-10 max-w-2xl transition-all duration-700 delay-200 transform ${heroInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            Acesse inteligência jurídica brasileira pronta para uso em seus agentes de IA. Skills validadas por especialistas para cada área do direito.
          </p>

          {/* Search */}
          <div className={`relative w-full max-w-2xl mb-8 transition-all duration-700 delay-300 transform ${heroInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <div className={`absolute inset-y-0 left-6 flex items-center pointer-events-none transition-colors duration-300 ${searchFocused ? "text-primary" : "text-muted"}`}>
              <Search className="w-5 h-5" />
            </div>
            <input
              ref={searchRef}
              value={searchInput}
              onChange={e => startTransition(() => setSearchInput(e.target.value))}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`w-full pl-16 pr-20 py-4 md:py-5 bg-white border-2 rounded-2xl shadow-lg focus:ring-4 focus:ring-primary/10 outline-none text-sm transition-all placeholder:text-muted ${searchFocused ? "border-primary/40 shadow-primary/10" : "border-border shadow-primary/5"}`}
              placeholder="Busque por área jurídica ou tipo de tarefa..."
            />
            <div className="absolute inset-y-0 right-4 flex items-center">
              <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-[10px] font-mono text-muted bg-card border border-border rounded">/</kbd>
            </div>
          </div>

          {/* Create Button */}
          <div className={`flex flex-wrap justify-center items-center gap-2 transition-all duration-700 delay-[400ms] transform ${heroInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono font-medium rounded-full bg-accent text-white hover:bg-accent-hover transition-all hover:-translate-y-0.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Publicar Skill
            </button>
          </div>
        </div>
      </section>

      {/* ==================== DESTAQUES ==================== */}
      {!isLoading && highlights.length > 0 && (
        <section className="paper-texture paper-couche py-section-gap px-margin-desktop">
          <div ref={highlightsRef} className="max-w-[1280px] mx-auto">
            <div className={`flex items-center justify-between mb-10 transition-all duration-700 transform ${highlightsInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted">Curadoria semanal</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground font-serif">Destaques da Semana</h2>
                <p className="text-sm text-muted mt-1">As skills mais relevantes para você esta semana</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setHighlightIndex(Math.max(0, highlightIndex - 1))}
                  disabled={highlightIndex === 0}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-border text-muted hover:bg-white hover:border-primary/30 hover:text-primary transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setHighlightIndex(Math.min(maxHighlightPages, highlightIndex + 1))}
                  disabled={highlightIndex >= maxHighlightPages}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-border text-muted hover:bg-white hover:border-primary/30 hover:text-primary transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {highlights.map((h, idx) => (
                <article
                  key={h.id}
                  onClick={() => onSelectSkill(h.skill)}
                  style={{ ["--reveal-delay" as string]: `${idx * 100}ms` } as React.CSSProperties}
                  className={`reveal ${highlightsInView ? "is-visible" : ""} gradient-border-card cursor-pointer p-7 flex flex-col relative overflow-hidden ${h.trending ? "ring-1 ring-accent/20" : ""}`}
                >
                  {h.trending && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-accent text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-bl-xl flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Trending
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Verified className="w-5 h-5 text-primary" />
                    </div>
                    <span className="pill-tag bg-tag-bg text-muted">{h.vertical}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 leading-tight font-serif">{h.name}</h3>
                  <p className="text-sm text-muted line-clamp-2 mb-6">{h.desc}</p>
                  <div className="mt-auto flex items-center justify-between text-muted border-t border-border pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1"><Download className="w-4 h-4" /><span className="text-[11px] font-mono">{(h.downloads / 1000).toFixed(1)}k</span></div>
                      <div className="flex items-center gap-1"><Verified className="w-4 h-4 text-accent" /><span className="text-[11px] font-mono">{h.score}%</span></div>
                    </div>
                    <span className={complianceStyle(h.compliance)}>{h.compliance}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="section-divider-warm" />

      {/* ================== MAIN: GRID ================== */}
      <main className="max-w-[1280px] mx-auto px-margin-desktop py-section-gap">

        {/* CONTENT */}
        <section>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground font-serif">Todas as Skills</h2>
              <p className="text-sm text-muted mt-0.5">
                Mostrando <span className="font-semibold text-foreground">{isLoading ? "..." : totalCount}</span> resultados
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-border/50 shadow-sm">
              <span className="text-[10px] font-mono text-muted whitespace-nowrap">Ordenar por:</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}
                className="bg-transparent border-none text-xs font-mono text-foreground focus:ring-0 p-0 pr-8 cursor-pointer appearance-none">
                {SORT_OPTIONS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Filter chips */}
          {activeFilters > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {searchInput && (
                <span className="inline-flex items-center gap-1.5 border border-primary/20 bg-primary/5 text-primary text-[10px] font-mono px-3 py-1.5 rounded-full">
                  "{searchInput}" <button onClick={() => setSearchInput("")} className="hover:text-foreground"><X className="w-3 h-3" /></button>
                </span>
              )}
              <button onClick={clearFilters} className="text-[10px] font-mono text-accent hover:text-primary transition-colors ml-1">Limpar todos</button>
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-border h-[220px] space-y-4">
                  <div className="h-4 w-1/3 rounded skeleton-shimmer" />
                  <div className="h-6 w-3/4 rounded skeleton-shimmer" />
                  <div className="h-4 w-full rounded skeleton-shimmer" />
                  <div className="h-4 w-5/6 rounded skeleton-shimmer" />
                  <div className="flex gap-2 mt-auto">
                    <div className="h-3 w-16 rounded skeleton-shimmer" />
                    <div className="h-3 w-16 rounded skeleton-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="border border-red-200 bg-red-50 p-10 text-center space-y-3 rounded-2xl">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
              <h4 className="text-lg font-semibold text-foreground font-serif">Erro ao carregar</h4>
              <p className="text-sm text-muted">{error}</p>
              <button onClick={retry} className="px-6 py-2.5 bg-primary text-white rounded-xl text-[11px] font-mono uppercase tracking-wide hover:bg-primary-dim transition-all">
                Tentar novamente
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="border border-border p-16 text-center space-y-3 rounded-2xl bg-white">
              <Inbox className="w-12 h-12 text-muted mx-auto" />
              <h4 className="text-lg font-semibold text-foreground font-serif">Nenhuma skill encontrada</h4>
              <p className="text-sm text-muted">
                {activeFilters > 0 ? "Ajuste os filtros para ampliar os resultados." : "Nenhuma skill disponível no momento."}
              </p>
              {activeFilters > 0 && (
                <button onClick={clearFilters} className="px-6 py-2.5 bg-primary text-white rounded-xl text-[11px] font-mono uppercase tracking-wide hover:bg-primary-dim transition-all">
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {visibleItems.map(skill => <React.Fragment key={skill.id}><SkillCard skill={skill} onSelect={onSelectSkill} /></React.Fragment>)}
              </div>

              {/* FOMO: não-logados veem mais cards por baixo de uma trava leve, como último componente */}
              {isPreview && totalCount > PREVIEW_LIMIT && (
                <div className="relative mt-5">
                  {/* Cards seguintes (desfocados), sugerindo que há mais por vir */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pointer-events-none select-none blur-[3px] opacity-40"
                    style={{ WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)", maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)" }}>
                    {items.slice(PREVIEW_LIMIT, PREVIEW_LIMIT + 6).map(skill => (
                      <React.Fragment key={skill.id}><SkillCard skill={skill} onSelect={() => {}} /></React.Fragment>
                    ))}
                  </div>

                  {/* Trava semi-transparente em cima dos cards */}
                  <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/60 backdrop-blur-[2px] p-6">
                    <div className="max-w-md w-full text-center">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-5">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground font-serif mb-2">
                        Você está vendo apenas {PREVIEW_LIMIT} de {totalCount} skills
                      </h3>
                      <p className="text-sm text-muted mb-6">
                        Desbloqueie o catálogo completo, salve favoritos e acompanhe downloads.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          onClick={handleGoogleSignIn}
                          className="inline-flex items-center gap-2.5 h-11 px-6 rounded-full bg-white text-foreground border border-border text-sm font-medium shadow-sm hover:bg-muted/10 transition-colors"
                        >
                          <img src="/Google__G__logo.svg.webp" alt="Google" className="w-4 h-4" />
                          Continuar com Google
                        </button>
                        <button
                          onClick={() => setIsAuthModalOpen(true)}
                          className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-dim transition-colors"
                        >
                          Criar conta com email
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={sentinelRef} className="h-px" aria-hidden />
              {isLoadingMore && (
                <div className="flex items-center justify-center gap-2 py-8">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-[11px] font-mono text-muted">Carregando mais skills...</span>
                </div>
              )}
              {!hasMore && items.length > 0 && (
                <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <span className="text-sm text-muted">
                    Exibindo <span className="font-semibold text-foreground">{visibleItems.length}</span> de{" "}
                    <span className="font-semibold text-foreground">{totalCount}</span> skills
                  </span>
                  {!isPreview && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                      className="page-btn w-10 h-10 flex items-center justify-center rounded-xl border border-border/40 text-muted hover:bg-white disabled:opacity-30">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setCurrentPage(p)}
                        className={`page-btn w-10 h-10 flex items-center justify-center rounded-xl text-[11px] font-mono transition-all ${currentPage === p ? "active" : "border border-border/40 text-muted hover:bg-white"}`}>
                        {p}
                      </button>
                    ))}
                    {totalPages > 5 && <span className="text-muted text-[11px] font-mono px-1">...</span>}
                    <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                      className="page-btn w-10 h-10 flex items-center justify-center rounded-xl border border-border/40 text-muted hover:bg-white disabled:opacity-30">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* ======================== FOOTER ======================== */}
      <footer className="w-full py-section-gap px-margin-desktop bg-[#37322F] text-[#F4F1EE]">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-3">
            <span className="text-lg font-bold tracking-tight font-serif">Sanfran.md</span>
            <p className="text-[11px] font-mono text-white/40">&copy; 2024 Sanfran.md &mdash; Inteligência Jurídica Brasileira.</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {["Termos de Uso", "Privacidade", "Contato", "Sobre"].map(l => (
              <a key={l} className="text-[11px] font-mono text-white/40 hover:text-white transition-colors" href="#">{l}</a>
            ))}
          </nav>
        </div>
      </footer>

      <CreateSkillModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSkillCreated={handleCreate} currentUserId={user?.id ?? ""} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
