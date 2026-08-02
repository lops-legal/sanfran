import React, { useState, useRef, useEffect, useMemo, useTransition, useCallback } from "react";
import { LegalSkill } from "../types";
import { VERTICALS, TASK_CATEGORIES, FAQS } from "../data";
import SkillCard from "./SkillCard";
import {
  Search, X, Loader2, AlertTriangle, Inbox, Plus,
  ChevronLeft, ChevronRight, ChevronDown,
  Download, Shield, Verified, Gavel, HelpCircle, ClipboardList,
  Sparkles, TrendingUp,
} from "lucide-react";
import {
  useInfiniteSkills, useInfiniteScrollSentinel,
  SortOption,
} from "./useInfiniteSkills";
import { createSupabaseAdapter } from "../lib/supabaseAdapter";
import { useCatalogStats } from "../hooks/useCatalogStats";
import { useInView } from "../hooks/useInView";
import CreateSkillModal from "./CreateSkillModal";
import { toast } from "./Toast";
import { useAuth } from "../contexts/AuthContext";

// Import cinematic styles for paper textures & reveals
import "../styles/home-cinematic.css";

// ---------------------------------------------------------------------------
// URL Sync helpers
// ---------------------------------------------------------------------------
function readSearchParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    q: p.get("q") ?? "",
    vertical: p.get("v") ?? null,
    category: p.get("cat") ?? null,
    score: parseInt(p.get("score") ?? "0", 10),
    sort: (p.get("sort") ?? "stars") as SortOption,
  };
}

function pushSearchParams(params: {
  q: string; vertical: string | null; category: string | null; score: number; sort: SortOption;
}) {
  const p = new URLSearchParams();
  if (params.q) p.set("q", params.q);
  if (params.vertical) p.set("v", params.vertical);
  if (params.category) p.set("cat", params.category);
  if (params.score > 0) p.set("score", String(params.score));
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
  const [selectedVertical, setSelectedVertical] = useState<string | null>(initial.vertical);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initial.category);
  const [minScore, setMinScore] = useState<number>(initial.score);
  const [minCompliance, setMinCompliance] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>(initial.sort);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  // Scroll-reveal refs
  const { ref: heroRef, inView: heroInView } = useInView<HTMLDivElement>({ threshold: 0.1 });
  const { ref: highlightsRef, inView: highlightsInView } = useInView<HTMLDivElement>({ threshold: 0.15 });
  const { ref: faqRef, inView: faqInView } = useInView<HTMLDivElement>({ threshold: 0.1 });

  useEffect(() => {
    pushSearchParams({ q: searchInput, vertical: selectedVertical, category: selectedCategory, score: minScore, sort: sortBy });
  }, [searchInput, selectedVertical, selectedCategory, minScore, sortBy]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "/" && !(document.activeElement instanceof HTMLInputElement)) {
        e.preventDefault(); searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const adapter = useMemo(() => createSupabaseAdapter(), []);

  const { items, totalCount, isLoading, isLoadingMore, error, hasMore, loadMore, retry, mutateItems } = useInfiniteSkills({
    adapter, search: searchInput, vertical: selectedVertical, taskCategory: selectedCategory, minQualityScore: minScore, sortBy, pageSize: PAGE_SIZE,
  });

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreate = useCallback((s: LegalSkill) => {
    mutateItems(prev => [s, ...prev]);
    toast.success("Skill publicada!", `"${s.name}" aparece no topo do catálogo.`);
  }, [mutateItems]);

  const sentinelRef = useInfiniteScrollSentinel(loadMore, hasMore && !isLoading && !error);

  const activeFilters = (selectedVertical ? 1 : 0) + (selectedCategory ? 1 : 0) + (minScore > 0 ? 1 : 0) + (searchInput ? 1 : 0) + (minCompliance ? 1 : 0);

  const clearFilters = useCallback(() => {
    startTransition(() => {
      setSearchInput(""); setSelectedVertical(null); setSelectedCategory(null); setMinScore(0); setMinCompliance(null);
    });
  }, [startTransition]);

  const counts = catalogStats.verticalCounts;
  const totalPub = catalogStats.totalPublished;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const toggleFaq = (i: number) => setActiveFaq(prev => prev === i ? null : i);

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
        downloads: s.downloadsCount ?? s.starsCount,
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
      <section className="paper-texture paper-seda relative pt-[140px] pb-20 px-margin-desktop border-b border-border overflow-hidden" style={{ background: "linear-gradient(180deg, #fff8f5 0%, #F9F7F5 100%)" }}>
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
              className={`w-full pl-16 pr-20 py-5 bg-white border-2 rounded-2xl shadow-lg focus:ring-4 focus:ring-primary/10 outline-none text-sm transition-all placeholder:text-muted ${searchFocused ? "border-primary/40 shadow-primary/10" : "border-border shadow-primary/5"}`}
              placeholder="Busque por área jurídica ou tipo de tarefa..."
            />
            <div className="absolute inset-y-0 right-4 flex items-center">
              <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-[10px] font-mono text-muted bg-card border border-border rounded">/</kbd>
            </div>
          </div>

          {/* Category Chips + Create Button */}
          <div className={`flex flex-wrap justify-center items-center gap-2 transition-all duration-700 delay-[400ms] transform ${heroInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <span className="text-[11px] font-mono text-muted mr-1 self-center">Populares:</span>
            <button onClick={() => setSelectedVertical(null)}
              className={`category-chip ${!selectedVertical ? "active" : ""}`}>Todas</button>
            {VERTICALS.slice(0, 4).map(v => (
              <button key={v.id} onClick={() => setSelectedVertical(selectedVertical === v.id ? null : v.id)}
                className={`category-chip ${selectedVertical === v.id ? "active" : ""}`}>{v.name}</button>
            ))}
            <div className="hidden sm:block w-px h-6 bg-border mx-2" />
            <button
              onClick={() => {
                if (!user?.id) {
                  toast.warning("Login necessário", "Entre na sua conta para publicar uma skill.");
                  return;
                }
                setShowCreateModal(true);
              }}
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

      {/* ================== MAIN: FILTERS + GRID ================== */}
      <main className="max-w-[1280px] mx-auto px-margin-desktop flex flex-col lg:flex-row gap-stack-lg py-section-gap">

        {/* SIDEBAR */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="sticky top-[100px] p-6 bg-white rounded-2xl border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-semibold text-foreground font-serif">Filtros</h2>
                <p className="text-[10px] text-muted font-mono mt-0.5">Refine sua busca</p>
              </div>
              {activeFilters > 0 && (
                <button onClick={clearFilters} className="text-[11px] font-mono text-accent hover:text-primary transition-colors flex items-center gap-1">
                  <X className="w-3 h-3" />
                  Limpar
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Categoria */}
              <div>
                <h3 className="text-[11px] font-mono uppercase tracking-wider text-foreground mb-3 flex items-center gap-2">
                  <Gavel className="w-3.5 h-3.5 text-primary" /> Categoria
                </h3>
                <ul className="space-y-1.5">
                  {VERTICALS.map(v => {
                    const isActive = selectedVertical === v.id;
                    const count = counts[v.id] ?? 0;
                    return (
                      <li key={v.id}>
                        <button
                          onClick={() => setSelectedVertical(isActive ? null : v.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${isActive ? "bg-primary/8 text-primary font-medium" : "text-muted hover:bg-card hover:text-foreground"}`}
                        >
                          <span className="text-xs">{v.name}</span>
                          <span className={`ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-full ${isActive ? "bg-primary/15 text-primary" : "bg-card text-muted"}`}>
                            {statsLoading ? "..." : count}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="section-divider-warm" />

              {/* Tipo de Tarefa */}
              <div>
                <h3 className="text-[11px] font-mono uppercase tracking-wider text-foreground mb-3 flex items-center gap-2">
                  <ClipboardList className="w-3.5 h-3.5 text-primary" /> Tipo de Tarefa
                </h3>
                <ul className="space-y-1.5">
                  {TASK_CATEGORIES.map(cat => {
                    const isActive = selectedCategory === cat.id;
                    const count = catalogStats.taskCategoryCounts[cat.id] ?? 0;
                    return (
                      <li key={cat.id}>
                        <button
                          onClick={() => setSelectedCategory(isActive ? null : cat.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${isActive ? "bg-primary/8 text-primary font-medium" : "text-muted hover:bg-card hover:text-foreground"}`}
                        >
                          <span className="text-xs truncate">{cat.name}</span>
                          <span className={`ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-full ${isActive ? "bg-primary/15 text-primary" : "bg-card text-muted"}`}>
                            {statsLoading ? "..." : count}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="section-divider-warm" />

              {/* Quality Score */}
              <div>
                <h3 className="text-[11px] font-mono uppercase tracking-wider text-foreground mb-3 flex items-center gap-2">
                  <Verified className="w-3.5 h-3.5 text-primary" /> Quality Score
                </h3>
                <ul className="space-y-1.5">
                  {[{ label: "90%+", v: 90 }, { label: "80% - 89%", v: 80 }, { label: "70% - 79%", v: 70 }].map(opt => (
                    <li key={opt.v}>
                      <button
                        onClick={() => setMinScore(minScore === opt.v ? 0 : opt.v)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${minScore === opt.v ? "bg-primary/8 text-primary font-medium" : "text-muted hover:bg-card hover:text-foreground"}`}
                      >
                        <span className="text-xs">{opt.label}</span>
                        {minScore === opt.v && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="section-divider-warm" />

              {/* Compliance */}
              <div>
                <h3 className="text-[11px] font-mono uppercase tracking-wider text-foreground mb-3 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-primary" /> Compliance
                </h3>
                <ul className="space-y-1.5">
                  {["Total", "Alto", "Moderado"].map(l => (
                    <li key={l}>
                      <button
                        onClick={() => setMinCompliance(minCompliance === l ? null : l)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${minCompliance === l ? "bg-primary/8 text-primary font-medium" : "text-muted hover:bg-card hover:text-foreground"}`}
                      >
                        <span className="text-xs">{l}</span>
                        {minCompliance === l && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </aside>

        {/* CONTENT */}
        <section className="flex-1 min-w-0">
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
              {selectedVertical && (
                <span className="inline-flex items-center gap-1.5 border border-primary/20 bg-primary/5 text-primary text-[10px] font-mono px-3 py-1.5 rounded-full">
                  {VERTICALS.find(v => v.id === selectedVertical)?.name} <button onClick={() => setSelectedVertical(null)} className="hover:text-foreground"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 border border-primary/20 bg-primary/5 text-primary text-[10px] font-mono px-3 py-1.5 rounded-full">
                  {TASK_CATEGORIES.find(c => c.id === selectedCategory)?.name} <button onClick={() => setSelectedCategory(null)} className="hover:text-foreground"><X className="w-3 h-3" /></button>
                </span>
              )}
              {minScore > 0 && (
                <span className="inline-flex items-center gap-1.5 border border-primary/20 bg-primary/5 text-primary text-[10px] font-mono px-3 py-1.5 rounded-full">
                  Score &ge; {minScore}% <button onClick={() => setMinScore(0)} className="hover:text-foreground"><X className="w-3 h-3" /></button>
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
                {items.map(skill => <React.Fragment key={skill.id}><SkillCard skill={skill} onSelect={onSelectSkill} /></React.Fragment>)}
              </div>
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
                    Exibindo <span className="font-semibold text-foreground">{items.length}</span> de{" "}
                    <span className="font-semibold text-foreground">{totalCount}</span> skills
                  </span>
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
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* ======================== FAQ ======================== */}
      <div className="section-divider-warm" />
      <section className="paper-texture paper-reciclato py-section-gap px-margin-desktop">
        <div ref={faqRef} className="max-w-3xl mx-auto">
          <div className={`text-center mb-14 transition-all duration-700 transform ${faqInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-accent" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted">Perguntas Frequentes</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground font-serif">Manual Sanfran.md</h2>
            <p className="text-sm text-muted mt-2">Perguntas frequentes sobre nosso catálogo de skills</p>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const open = activeFaq === idx;
              return (
                <details
                  key={idx}
                  className={`faq-accordion-smooth reveal ${faqInView ? "is-visible" : ""} group bg-white rounded-2xl border border-border/30 cursor-pointer transition-all hover:shadow-sm`}
                  style={{ ["--reveal-delay" as string]: `${idx * 80}ms` } as React.CSSProperties}
                  open={open}
                >
                  <summary
                    onClick={(e) => { e.preventDefault(); toggleFaq(idx); }}
                    className="flex justify-between items-center list-none text-base font-semibold text-foreground outline-none font-serif p-7"
                  >
                    {faq.question}
                    <ChevronDown className={`faq-icon w-5 h-5 text-accent shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                  </summary>
                  <div className="px-7 pb-7 text-sm text-muted leading-relaxed border-t border-border/30 mx-7 pt-5">
                    {faq.answer}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </section>

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

      {user?.id && (
        <CreateSkillModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSkillCreated={handleCreate}
          currentUserId={user.id}
        />
      )}
    </div>
  );
}
