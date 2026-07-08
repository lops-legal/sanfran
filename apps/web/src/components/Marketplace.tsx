import React, { useState, useRef, useEffect, useMemo, useTransition, useCallback } from "react";
import { LegalSkill } from "../types";
import { VERTICALS, TASK_CATEGORIES, FAQS } from "../data";
import SkillCard from "./SkillCard";
import {
  Search, Sliders, Grid, List, HelpCircle, ChevronDown, RefreshCw, X,
  Scale, AlertTriangle, Inbox, Loader2, SlidersHorizontal, ArrowUpRight, Plus,
} from "lucide-react";
import {
  useInfiniteSkills, useInfiniteScrollSentinel,
  SortOption,
} from "./useInfiniteSkills";
import { createSupabaseAdapter } from "../lib/supabaseAdapter";
import { useCatalogStats } from "../hooks/useCatalogStats";
import CreateSkillModal from "./CreateSkillModal";
import { toast } from "./Toast";
import { useAuth } from "../contexts/AuthContext";
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
  q: string;
  vertical: string | null;
  category: string | null;
  score: number;
  sort: SortOption;
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
interface MarketplaceProps {
  onSelectSkill: (skill: LegalSkill) => void;
}

const PAGE_SIZE = 12;

const SORT_TABS: { id: SortOption; label: string }[] = [
  { id: "stars", label: "Popular" },
  { id: "score", label: "Qualidade" },
  { id: "hot", label: "Em alta" },
  { id: "recent", label: "Recente" },
];

// Vertical accent colors (minimal, no glow)
const VERTICAL_ACCENT: Record<string, { dot: string; border: string; text: string }> = {
  Trabalhista: { dot: "bg-red-500", border: "border-primary", text: "text-primary-dim" },
  LGPD: { dot: "bg-emerald-500", border: "border-emerald-500", text: "text-emerald-400" },
  Consumidor: { dot: "bg-amber-500", border: "border-amber-500", text: "text-amber-400" },
  Societario: { dot: "bg-blue-500", border: "border-blue-500", text: "text-blue-400" },
  Processual: { dot: "bg-purple-500", border: "border-purple-500", text: "text-purple-400" },
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
  const [minQualityScore, setMinQualityScore] = useState<number>(initial.score);
  const [sortBy, setSortBy] = useState<SortOption>(initial.sort);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(false); // mobile
  const [isScrolled, setIsScrolled] = useState(false); // for sticky filter bar

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  // Sync URL on filter change
  useEffect(() => {
    pushSearchParams({ q: searchInput, vertical: selectedVertical, category: selectedCategory, score: minQualityScore, sort: sortBy });
  }, [searchInput, selectedVertical, selectedCategory, minQualityScore, sortBy]);

  // Sticky header trigger
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // '/' shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (e.key === "/" && !(active instanceof HTMLInputElement) && !(active instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const adapter = useMemo(() => createSupabaseAdapter(), []);

  const { items, totalCount, isLoading, isLoadingMore, error, hasMore, loadMore, retry, mutateItems } = useInfiniteSkills({
    adapter,
    search: searchInput,
    vertical: selectedVertical,
    taskCategory: selectedCategory,
    minQualityScore,
    sortBy,
    pageSize: PAGE_SIZE,
  });

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleOptimisticCreate = useCallback((newSkill: LegalSkill) => {
    // Instantly prepend the new skill into the visible list
    mutateItems((prev) => [newSkill, ...prev]);
    toast.success("Skill publicada!", `"${newSkill.name}" aparece no topo do catálogo.`);
  }, [mutateItems]);

  const sentinelRef = useInfiniteScrollSentinel(loadMore, hasMore && !isLoading && !error);

  const activeFilterCount =
    (selectedVertical ? 1 : 0) + (selectedCategory ? 1 : 0) + (minQualityScore > 0 ? 1 : 0) + (searchInput ? 1 : 0);

  const handleClearFilters = useCallback(() => {
    startTransition(() => {
      setSearchInput("");
      setSelectedVertical(null);
      setSelectedCategory(null);
      setMinQualityScore(0);
    });
  }, [startTransition]);

  const verticalCounts = catalogStats.verticalCounts;
  const totalCatalog = catalogStats.totalPublished;
  const totalOabVerified = catalogStats.totalOabVerified; // total de skills revisadas contra OWASP Agentic Skills Top 10

  const toggleFaq = (idx: number) => setActiveFaq((prev) => (prev === idx ? null : idx));

  // Bento: first result gets featured (spans 2 cols) when in grid mode with enough items
  const featuredSkill = viewMode === "grid" && items.length >= 3 ? items[0] : null;
  const remainingItems = featuredSkill ? items.slice(1) : items;

  return (
    <div id="sanfran-marketplace-root" className="text-foreground font-sans pb-24">

      {/* ============================================================ */}
      {/* STICKY COMPACT FILTER BAR — appears when user scrolls past hero */}
      {/* ============================================================ */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border transition-all duration-300 ${
          isScrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-muted shrink-0">
            <Scale className="w-3.5 h-3.5 text-primary" />
            <span className="text-foreground font-semibold">Sanfran.md</span>
          </div>
          <div className="flex-1 flex items-center gap-2 border border-border bg-card px-3 py-1.5 max-w-md">
            <Search className="w-3.5 h-3.5 text-muted shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => startTransition(() => setSearchInput(e.target.value))}
              placeholder="Buscar skills..."
              className="w-full bg-transparent text-xs text-slate-200 placeholder:text-xmuted focus:outline-none"
            />
          </div>
          <div className="hidden md:flex items-center gap-1">
            {SORT_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSortBy(tab.id)}
                className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors ${
                  sortBy === tab.id ? "text-foreground bg-[#232328]" : "text-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {activeFilterCount > 0 && (
            <button onClick={handleClearFilters} className="shrink-0 text-[10px] font-mono text-primary-dim hover:text-red-300 uppercase tracking-wide">
              Limpar ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* HERO — editorial, editorial, editorial                        */}
      {/* ============================================================ */}
      <div className="border-b border-border bg-background px-4 pt-14 pb-12">
        <div className="max-w-7xl mx-auto">

          

          {/* Two-column hero layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-end">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight leading-[1.08] mb-5">
                Skills jurídicas<br />
                <span className="text-muted font-normal">para agentes de IA</span>
              </h1>
              <p className="text-sm text-muted leading-relaxed max-w-xl mb-8 font-light">
                Para todo problema do seu dia a dia jurídico, existe uma skill que pode tornar o seu agente de IA um especialista jurídico brasileiro. Mais contexto, menos alucinação.
              </p>

              {/* Search */}
              <div className="flex items-center gap-2 border border-border bg-card px-4 py-3 max-w-xl focus-within:border-[#3a3a3e] transition-colors">
                {isLoading && searchInput ? (
                  <Loader2 className="w-4 h-4 text-muted shrink-0 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 text-muted shrink-0" />
                )}
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => startTransition(() => setSearchInput(e.target.value))}
                  placeholder="ex: multa rescisória, CLT, LGPD, CDC..."
                  className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-xmuted focus:outline-none"
                />
                {searchInput ? (
                  <button onClick={() => setSearchInput("")} className="text-xmuted hover:text-muted transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline font-mono text-[9px] text-xmuted border border-border px-1.5 py-0.5 rounded">
                    /
                  </kbd>
                )}
              </div>
            </div>

            {/* Stats panel — right column */}
            <div className="border border-border bg-card divide-y divide-[#1e1e22]">
              {[
                { label: "Skills no catálogo", value: statsLoading ? "—" : totalCatalog, color: "text-foreground" },
                { label: "OWASP Agentic Top 10", value: statsLoading ? "—" : totalOabVerified, color: "text-emerald-400" },
                { label: "Resultado filtrado", value: isLoading ? "—" : totalCount, color: "text-foreground" },
              ].map(({ label, value, color }) => (
                <div key={label} className="px-5 py-3 flex items-center justify-between">
                  <span className="text-xs text-muted font-mono">{label}</span>
                  <span className={`font-mono text-sm font-bold tabular-nums ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* VERTICALS ROW                                                 */}
      {/* ============================================================ */}
      <div className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 py-0 flex items-center gap-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedVertical(null)}
            className={`shrink-0 flex items-center gap-2 px-4 py-4 font-mono text-xs uppercase tracking-wide transition-colors border-b-2 -mb-px ${
              !selectedVertical
                ? "border-primary text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            Todas
            <span className="text-xmuted">{statsLoading ? "…" : totalCatalog}</span>
          </button>
          {VERTICALS.map((v) => {
            const accent = VERTICAL_ACCENT[v.id];
            const isActive = selectedVertical === v.id;
            const count = verticalCounts[v.id] ?? 0;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVertical(isActive ? null : v.id)}
                className={`shrink-0 flex items-center gap-2 px-4 py-4 font-mono text-xs uppercase tracking-wide transition-colors border-b-2 -mb-px ${
                  isActive
                    ? `${accent?.border ?? "border-primary"} ${accent?.text ?? "text-primary-dim"}`
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {isActive && accent && <span className={`w-1.5 h-1.5 rounded-full ${accent.dot} shrink-0`} />}
                {v.name}
                <span className="text-xmuted">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* CATALOG: SIDEBAR + RESULTS                                    */}
      {/* ============================================================ */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 items-start">

        {/* ---------- SIDEBAR ---------- */}
        <div className="lg:sticky lg:top-14 space-y-px">

          {/* Mobile toggle */}
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className="lg:hidden w-full flex items-center justify-between border border-border bg-card px-4 py-3 text-xs font-mono uppercase text-foreground mb-2"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filtros
            </span>
            {activeFilterCount > 0 && (
              <span className="bg-primary text-foreground rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className={`${filterOpen ? "block" : "hidden lg:block"} space-y-px`}>

            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border border-border bg-card">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted flex items-center gap-1.5">
                <Sliders className="w-3 h-3" /> Filtros
              </span>
              {activeFilterCount > 0 && (
                <button onClick={handleClearFilters} className="font-mono text-[10px] text-primary hover:text-primary-dim uppercase">
                  Limpar
                </button>
              )}
            </div>

            {/* Task category */}
            <div className="border border-border bg-card py-1">
              <div className="px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-xmuted border-b border-border">
                Tipo de tarefa
              </div>
              {TASK_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                const categoryCount = catalogStats.taskCategoryCounts[cat.id] ?? 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(isActive ? null : cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 font-mono text-xs transition-colors ${
                      isActive
                        ? "text-foreground bg-card-hover border-l-2 border-primary"
                        : "text-muted hover:text-foreground hover:bg-card border-l-2 border-transparent"
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="text-[10px] text-xmuted tabular-nums">
                      {statsLoading ? "…" : categoryCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quality score */}
            <div className="border border-border bg-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-widest text-xmuted">Quality score mín.</span>
                <span className="font-mono text-[10px] text-muted tabular-nums">{minQualityScore}</span>
              </div>
              <input
                type="range"
                className="w-full accent-red-600 h-[2px] bg-[#2a2a2e] rounded cursor-pointer"
                min="0" max="95" step="5"
                value={minQualityScore}
                onChange={(e) => setMinQualityScore(parseInt(e.target.value, 10))}
              />
              <div className="flex justify-between font-mono text-[9px] text-xmuted">
                <span>0</span><span>50</span><span>95</span>
              </div>
            </div>

            {/* CTA */}
          </div>
        </div>

        {/* ---------- RESULTS ---------- */}
        <div className="space-y-4 min-w-0">

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {searchInput && <FilterChip label={`"${searchInput}"`} onRemove={() => setSearchInput("")} />}
              {selectedVertical && (
                <FilterChip
                  label={VERTICALS.find((v) => v.id === selectedVertical)?.name ?? selectedVertical}
                  onRemove={() => setSelectedVertical(null)}
                />
              )}
              {selectedCategory && (
                <FilterChip
                  label={TASK_CATEGORIES.find((c) => c.id === selectedCategory)?.name ?? selectedCategory}
                  onRemove={() => setSelectedCategory(null)}
                />
              )}
              {minQualityScore > 0 && <FilterChip label={`Score ≥ ${minQualityScore}`} onRemove={() => setMinQualityScore(0)} />}
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 flex-wrap border-b border-border pb-3">
            <div className="flex items-center gap-1">
              {SORT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSortBy(tab.id)}
                  className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide transition-colors ${
                    sortBy === tab.id
                      ? "text-foreground bg-card-hover border border-border"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-xmuted tabular-nums">
                {isLoading ? "…" : `${totalCount} skill${totalCount !== 1 ? "s" : ""}`}
              </span>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-dim text-foreground text-[10px] font-mono uppercase tracking-wide transition-colors"
              >
                <Plus className="w-3 h-3" />
                Nova Skill
              </button>
              <div className="flex border border-border">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 transition-colors ${viewMode === "grid" ? "bg-card-hover text-foreground" : "text-xmuted hover:text-muted"}`}
                  title="Grade"
                >
                  <Grid className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 transition-colors ${viewMode === "list" ? "bg-card-hover text-foreground" : "text-xmuted hover:text-muted"}`}
                  title="Lista"
                >
                  <List className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Result states */}
          {isLoading ? (
            <SkillGridSkeleton viewMode={viewMode} />
          ) : error ? (
            <ErrorState message={error} onRetry={retry} />
          ) : items.length === 0 ? (
            activeFilterCount > 0 ? (
              <EmptyFilteredState onClear={handleClearFilters} />
            ) : (
              <EmptyCatalogState />
            )
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border">
                  {featuredSkill && (
                    <SkillCard skill={featuredSkill} onSelect={onSelectSkill} featured />
                  )}
                  {remainingItems.map((skill) => (
                    <React.Fragment key={skill.id}>
                      <SkillCard skill={skill} onSelect={onSelectSkill} />
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-[#1a1a1e] border border-border">
                  {items.map((skill) => (
                    <React.Fragment key={skill.id}>
                      <SkillCard skill={skill} onSelect={onSelectSkill} />
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-px" aria-hidden />

              {isLoadingMore && (
                <div className="flex items-center justify-center gap-2 py-6 text-xs font-mono text-xmuted">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Carregando…
                </div>
              )}

              {!hasMore && items.length > 0 && (
                <p className="text-center text-[10px] font-mono text-xmuted uppercase tracking-widest py-6">
                  {items.length} de {totalCount} skills
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* CTA BANNER                                                    */}
      {/* ============================================================ */}
      
              {/* ============================================================ */}
      {/* FAQ                                                           */}
      {/* ============================================================ */}
      <div className="border-t border-border">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="w-4 h-4 text-xmuted" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-xmuted">Perguntas Frequentes</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-10">Manual Sanfran.md</h2>

          <div className="divide-y divide-[#1a1a1e]">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx}>
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between gap-4 py-4 text-left group"
                  >
                    <span className={`text-sm font-medium transition-colors ${isOpen ? "text-foreground" : "text-foreground group-hover:text-foreground"}`}>
                      {faq.question}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""}`} />
                  </button>
                  {isOpen && (
                    <p className="pb-5 text-sm text-muted leading-relaxed font-light pl-0 border-l-0">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Skill Modal with optimistic updates */}
      <CreateSkillModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSkillCreated={handleOptimisticCreate}
        currentUserId={user?.id ?? ""}
      />

    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-border bg-card text-muted text-[11px] font-mono px-2.5 py-1">
      {label}
      <button onClick={onRemove} aria-label={`Remover filtro ${label}`} className="hover:text-foreground transition-colors">
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

function SkillGridSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  const count = viewMode === "grid" ? 6 : 4;
  const className = viewMode === "grid"
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-card-hover"
    : "divide-y divide-[#1a1a1e] border border-border";
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card p-4 h-[200px] animate-pulse space-y-3">
          <div className="h-2 w-1/4 bg-card-hover rounded" />
          <div className="h-4 w-3/4 bg-card-hover rounded" />
          <div className="h-3 w-full bg-card-hover rounded" />
          <div className="h-3 w-5/6 bg-card-hover rounded" />
          <div className="mt-4 space-y-2">
            <div className="h-1 w-full bg-card-hover rounded" />
            <div className="h-1 w-full bg-card-hover rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="border border-[#2a1a1a] bg-[#100d0d] p-10 text-center space-y-3">
      <AlertTriangle className="w-8 h-8 text-red-700 mx-auto" />
      <h4 className="text-sm font-semibold text-slate-200">Erro ao carregar</h4>
      <p className="text-xs text-muted max-w-sm mx-auto">{message}</p>
      <button onClick={onRetry} className="inline-flex items-center gap-2 border border-border bg-card text-xs font-mono text-foreground px-4 py-2 hover:text-foreground transition-colors">
        <RefreshCw className="w-3 h-3" /> Tentar novamente
      </button>
    </div>
  );
}

function EmptyFilteredState({ onClear }: { onClear: () => void }) {
  return (
    <div className="border border-border p-10 text-center space-y-3">
      <X className="w-8 h-8 text-xmuted mx-auto" />
      <h4 className="text-sm font-semibold text-foreground">Nenhuma skill encontrada</h4>
      <p className="text-xs text-xmuted max-w-sm mx-auto">
        Ajuste o score mínimo ou remova algum filtro para ampliar os resultados.
      </p>
      <button onClick={onClear} className="inline-flex items-center gap-2 border border-border bg-card text-xs font-mono text-muted px-4 py-2 hover:text-foreground transition-colors">
        Limpar filtros
      </button>
    </div>
  );
}

function EmptyCatalogState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="border border-border p-10 text-center space-y-3">
      <Inbox className="w-8 h-8 text-xmuted mx-auto" />
      <h4 className="text-sm font-semibold text-foreground">Catálogo vazio</h4>
      <p className="text-xs text-xmuted max-w-sm mx-auto">
        Seja o primeiro a publicar uma skill jurídica.
      </p>
      <button onClick={onCreate} className="inline-flex items-center gap-2 border border-border bg-card text-xs font-mono text-muted px-4 py-2 hover:text-foreground transition-colors">
        Criar Skill
      </button>
    </div>
  );
}