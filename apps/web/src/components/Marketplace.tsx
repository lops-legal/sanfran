import React, { useState, useRef, useEffect } from "react";
import { LegalSkill, VerticalCategory, TaskCategory, FaqItem } from "../types";
import { VERTICALS, TASK_CATEGORIES, FAQS } from "../data";
import SkillCard from "./SkillCard";
import { 
  Search, GitFork, Sliders, Grid, List, HelpCircle, 
  ExternalLink, ChevronDown, Check, RefreshCw, X, Shield, Scale, Map
} from "lucide-react";

interface MarketplaceProps {
  skillsList: LegalSkill[];
  onSelectSkill: (skill: LegalSkill) => void;
  onNavigateToLex: () => void;
}

export default function Marketplace({ skillsList, onSelectSkill, onNavigateToLex }: MarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVertical, setSelectedVertical] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minQualityScore, setMinQualityScore] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"stars" | "recent" | "score" | "hot">("stars");
  const [visibleCount, setVisibleCount] = useState<number>(3);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Reset visible count when any filter changes
  useEffect(() => {
    setVisibleCount(3);
  }, [searchQuery, selectedVertical, selectedCategory, minQualityScore, sortBy]);

  // Accordion active FAQ tracking
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when '/' keyboard shortcut is triggered
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter & sort logic
  const filteredSkills = skillsList.filter((skill) => {
    const matchesSearch = 
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesVertical = selectedVertical ? skill.vertical === selectedVertical : true;
    
    // In our simplified logic, we map categories to search or tag matching
    const matchesCategory = selectedCategory 
      ? skill.tags.some(t => t.toLowerCase() === selectedCategory.toLowerCase()) || 
        skill.description.toLowerCase().includes(selectedCategory.toLowerCase())
      : true;

    const matchesScore = skill.qualityScore >= minQualityScore;

    return matchesSearch && matchesVertical && matchesCategory && matchesScore;
  });

  const sortedSkills = [...filteredSkills].sort((a, b) => {
    if (sortBy === "stars") return b.starsCount - a.starsCount;
    if (sortBy === "recent") return b.updatedAt.localeCompare(a.updatedAt);
    if (sortBy === "hot") return (b as any).hotScore ? (b as any).hotScore - (a as any).hotScore : b.qualityScore - a.qualityScore;
    return b.qualityScore - a.qualityScore;
  });

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 3);
      setLoadingMore(false);
    }, 800);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedVertical(null);
    setSelectedCategory(null);
    setMinQualityScore(0);
  };

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div id="sanfran-marketplace-root" className="text-[#eaeaea] font-sans pb-16 animate-fade-in">
      
      {/* SECTION 2: Hero Section designed with Largo de São Francisco Architecture Details */}
      <div className="relative border-b border-[#232328] bg-[#09090b] pt-12 pb-14 px-4 overflow-hidden">
        {/* Absolute stylized red/black visual blocks inspired by uploaded references */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full bg-red-600/5 filter blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Textual Intro and Interactive Search (Full width) */}
            <div className="lg:col-span-12 space-y-6">
              {/* Proposta de valor / Pre-heading */}
              <div className="flex items-center gap-2">
                <span className="h-[2px] w-6 bg-red-650 inline-block" />
                <span className="font-mono text-[10px] sm:text-xs text-red-500 font-extrabold uppercase tracking-widest text-shadow-glow">
                  ARCADA ACADÊMICA: AGENTSKILLS.IO COMPLIANT
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none uppercase max-w-4xl text-shadow-title font-sans">
                Skills Jurídicas de <span className="text-red-500 font-black">Alta Precisão</span> para Agentes de IA
              </h2>
              
              <p className="max-w-2xl text-slate-400 text-xs sm:text-sm md:text-md leading-relaxed font-sans font-light">
                Crie, audite e conecte diretivas estruturadas em <code className="text-orange-400 font-mono text-xs">SKILL.md</code> em conformidade com o CDC, CLT e LGPD do Direito Brasileiro. Menos alucinação, mais segurança processual nas Arcadas.
              </p>

              {/* Interactive Core Search Bar */}
              <div className="mt-6 max-w-xl relative flex items-center bg-[#09090b]/80 border border-white/10 rounded-full focus-within:border-red-500/80 focus-within:shadow-[0_0_20px_rgba(239,68,68,0.15)] transition-all duration-500 ease-spring px-4 py-2">
                <Search className="w-4.5 h-4.5 text-slate-500 mr-3 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  id="marketplace-search-input"
                  className="w-full bg-transparent focus:outline-none text-xs sm:text-sm text-slate-200 font-sans tracking-wide"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por áreas jurídicas (ex: multa rescisória, CLT, LGPD, CDC)..."
                />
                <div className="hidden sm:flex items-center ml-2 shrink-0">
                  <span className="font-mono text-[9px] text-slate-500 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full leading-none uppercase">
                    Atalho /
                  </span>
                </div>
              </div>

              {/* Statistics catalog indicators */}
              <div className="flex flex-wrap gap-4 sm:gap-6 font-mono text-[11px] text-slate-500">
                <span>Ativos públicos: <span className="text-white font-semibold">{skillsList.length}</span></span>
                <span>•</span>
                <span>Auditados OAB: <span className="text-emerald-400 font-semibold">{skillsList.filter(s => s.complianceChecked).length}</span></span>
                <span>•</span>
                <span>Download global: <span className="text-white font-semibold">124k+</span></span>
              </div>

              {/* Integration compatibility row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 border-t border-[#1a1a20]/60 text-slate-500 font-mono text-[10px] uppercase">
                <span>Interoperável com:</span>
                <div className="flex gap-3 text-slate-300">
                  <span className="hover:text-white transition">ChatGPT</span>
                  <span className="text-slate-600">•</span>
                  <span className="hover:text-white transition">Claude Projects</span>
                  <span className="text-slate-500">•</span>
                  <span className="hover:text-white transition">Cursor rules</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* CTA para criar sua própria Skill */}
      <section className="mt-8 p-6 bg-[#101012] border border-slate-800 rounded-lg text-center">
        <h2 className="text-xl font-bold text-orange-500 mb-2">Crie e publique suas próprias habilidades com nosso Agente Lex gratuitamente</h2>
        <p className="text-sm text-slate-300 mb-4">Personalize o agente de IA para o seu trabalho jurídico usando o Lex.</p>
        <button onClick={onNavigateToLex} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-500 transition">Ir para o Atelier Lex AI</button>
      </section>
      {/* SECTION 3: Navegação por área do Direito (VerticalGrid) */}
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between border-b border-[#232328] pb-3 mb-6">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Scale className="w-4 h-4 text-red-500" />
            Navegar por verticais jurídicas
          </h3>
          {selectedVertical && (
            <button
              onClick={() => setSelectedVertical(null)}
              className="font-mono text-[10px] text-red-500 hover:text-red-400 underline flex items-center gap-1 uppercase"
            >
              Exibir todas
            </button>
          )}
        </div>

        {/* 5-Columns/Grid for legal vertical selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {VERTICALS.map((vertical) => {
            const isActive = selectedVertical === vertical.id;
            return (
              <div
                key={vertical.id}
                id={`vertical-card-${vertical.id}`}
                onClick={() => setSelectedVertical(isActive ? null : vertical.id)}
                className={`cursor-pointer ring-offset-black transition-all duration-300 p-5 border flex flex-col justify-between h-[150px] relative hover:scale-[1.01] ${vertical.accentClass} ${
                  isActive 
                    ? "bg-red-950/15 border-red-500 scale-[1.01]" 
                    : "bg-[#101012] border-slate-800"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wide">
                      {vertical.count} Skills
                    </span>
                    <span className="text-sm">🏛️</span>
                  </div>
                  <h4 className="font-bold text-sm tracking-tight text-white group-hover:text-red-400">
                    {vertical.name}
                  </h4>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500 font-sans mt-2 line-clamp-3">
                  {vertical.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* COMPONENTE: Habilidades por Plataforma (Inspired by agentskill.sh) */}
      <div className="max-w-7xl mx-auto px-4 py-8 border-t border-white/5">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-orange-500">💻</span>
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
            Habilidades por plataforma
          </h3>
        </div>

        {/* Grid Principal das 3 Maiores (Claude Code, TessAI, Manus) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          
          {/* Claude Code (Maior) */}
          <div className="bg-[#0c0c0e] border border-white/5 p-5 rounded-2xl flex items-center gap-4 hover:border-orange-500/30 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
              🤖
            </div>
            <div>
              <h4 className="font-sans font-bold text-sm text-white">Código Claude</h4>
              <p className="font-mono text-[10px] text-slate-500">Antrópico · Recomendado</p>
            </div>
          </div>

          {/* TessAI (Maior) */}
          <div className="bg-[#0c0c0e] border border-white/5 p-5 rounded-2xl flex items-center gap-4 hover:border-orange-500/30 transition-all group">
            <img 
              src="/logo_tessai.jpg" 
              alt="TessAI Logo" 
              className="w-14 h-14 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
            />
            <div>
              <h4 className="font-sans font-bold text-sm text-white">TessAI</h4>
              <p className="font-mono text-[10px] text-slate-500">Inteligência Artificial Ativa</p>
            </div>
          </div>

          {/* Manus (Maior) */}
          <div className="bg-[#0c0c0e] border border-white/5 p-5 rounded-2xl flex items-center gap-4 hover:border-orange-500/30 transition-all group">
            <img 
              src="/logo_manus.png" 
              alt="Manus Logo" 
              className="w-14 h-14 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
            />
            <div>
              <h4 className="font-sans font-bold text-sm text-white">Manus</h4>
              <p className="font-mono text-[10px] text-slate-500">Agentes Autónomos</p>
            </div>
          </div>

        </div>

        {/* Fileiras de Outras Plataformas (Menores) */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* OpenAI / ChatGPT */}
          <div className="bg-[#0c0c0e] border border-white/5 px-4 py-2.5 rounded-xl flex items-center gap-2.5 hover:border-white/10 transition-all">
            <span className="text-sm">🧠</span>
            <span className="font-sans text-[11px] text-slate-300">ChatGPT</span>
          </div>

          {/* OpenClaw */}
          <div className="bg-[#0c0c0e] border border-white/5 px-4 py-2.5 rounded-xl flex items-center gap-2.5 hover:border-white/10 transition-all">
            <span className="text-sm">🦀</span>
            <span className="font-sans text-[11px] text-slate-300">OpenClaw</span>
          </div>

          {/* Outra Logo Encomendada */}
          <div className="bg-[#0c0c0e] border border-white/5 px-4 py-2.5 rounded-xl flex items-center gap-2.5 hover:border-white/10 transition-all">
            <img 
              src="/logo_other.png" 
              alt="Plataforma Integrada" 
              className="w-4 h-4 rounded object-cover"
            />
            <span className="font-sans text-[11px] text-slate-300">AutoDev</span>
          </div>

          {/* Gemini */}
          <div className="bg-[#0c0c0e] border border-white/5 px-4 py-2.5 rounded-xl flex items-center gap-2.5 hover:border-white/10 transition-all">
            <span className="text-sm">✨</span>
            <span className="font-sans text-[11px] text-slate-300">Gemini</span>
          </div>

          {/* Llama */}
          <div className="bg-[#0c0c0e] border border-white/5 px-4 py-2.5 rounded-xl flex items-center gap-2.5 hover:border-white/10 transition-all">
            <span className="text-sm">🦙</span>
            <span className="font-sans text-[11px] text-slate-300">LlamaIndex</span>
          </div>

        </div>
      </div>

      {/* SECTION 6: Feed de skills com scroll infinito e Filtros Sticky */}
      <div className="max-w-7xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPACT FILTER CONTROLS (3 columns) */}
        <div className="lg:col-span-3 space-y-4 lg:sticky top-4">
          <div className="border border-[#232328] bg-[#0d0d0f] p-4 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-red-500" />
                Refinar Pesquisa
              </span>
              <button
                onClick={handleClearFilters}
                className="text-[10px] uppercase font-mono text-red-500 hover:text-red-400 font-semibold"
              >
                Limpar
              </button>
            </div>

            {/* Quality Score limit slider */}
            <div>
              <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider mb-2">
                Quality Score Mínimo: {minQualityScore} pts
              </label>
              <input
                type="range"
                className="w-full filter accent-red-650 h-1 bg-slate-900 rounded-lg cursor-pointer"
                min="0"
                max="95"
                step="5"
                value={minQualityScore}
                onChange={(e) => setMinQualityScore(parseInt(e.target.value))}
              />
              <div className="flex justify-between font-mono text-[9px] text-slate-500 mt-1">
                <span>0</span>
                <span>50</span>
                <span>95</span>
              </div>
            </div>

            {/* Task category checkboxes list equivalent */}
            <div>
              <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider mb-3">
                Classificar por tarefa:
              </label>
              <div className="space-y-1.5">
                {TASK_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(isActive ? null : cat.id)}
                      className={`w-full text-left px-2.5 py-1.5 font-mono text-xs border transition-all flex justify-between items-center cursor-pointer ${
                        isActive
                          ? "bg-red-500/10 border-red-500 text-white"
                          : "bg-[#121215] border-transparent text-slate-400 hover:bg-slate-900"
                      }`}
                    >
                      <span className="truncate">• {cat.name}</span>
                      <span className="text-[10px] text-slate-600">{cat.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick action buttons block */}
            <div className="pt-2 border-t border-slate-900">
              <button
                id="btn-goto-generator"
                onClick={onNavigateToLex}
                className="w-full cursor-pointer text-xs font-mono font-semibold uppercase bg-red-600 hover:bg-red-500 text-white py-2.5 text-center flex items-center justify-center gap-1.5"
              >
                🦊 Desejo criar com Lex
              </button>
              <p className="text-[10px] text-slate-500 mt-2 text-center leading-relaxed">
                Tem uma minuta ou documento? Gere um <code className="text-orange-400">SKILL.md</code> customizado no chat.
              </p>
            </div>

          </div>
        </div>

        {/* RIGHT SKILLS CATALOG GRID (9 columns) */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* List parameters bar and view toggle */}
          <div className="border border-[#232328] bg-[#0c0c0e] p-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 font-mono text-xs">

              
              {/* Reset/Clean active badges indicators query tag */}
              {(selectedVertical || selectedCategory || searchQuery || minQualityScore > 0) && (
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="w-1 h-3 bg-red-650" />
                  <span className="text-[10px] text-red-400 uppercase font-bold">Filtros ativos</span>
                </div>
              )}
              {/* Show count of results after filters */}
              <span className="text-slate-400 text-xs ml-2">{filteredSkills.length} skill(s) encontradas</span>
            </div>

            {/* Selector sorter tabs (Principal, Tendências, Quente, Mais recente) */}
            <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
              <button
                onClick={() => setSortBy("stars")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  sortBy === "stars"
                    ? "bg-white/10 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🏆 Principal
              </button>
              <button
                onClick={() => setSortBy("score")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  sortBy === "score"
                    ? "bg-white/10 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📈 Tendências
              </button>
              <button
                onClick={() => setSortBy("hot")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  sortBy === "hot"
                    ? "bg-white/10 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🔥 Quente
              </button>
              <button
                onClick={() => setSortBy("recent")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  sortBy === "recent"
                    ? "bg-white/10 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🕒 Mais recente
              </button>
            </div>

            {/* Grid / List Toggler visually */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex border border-slate-800 rounded bg-[#121214] p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1 cursor-pointer transition ${viewMode === "grid" ? "bg-slate-800 text-white" : "text-slate-500"}`}
                  title="Modo Grid"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1 cursor-pointer transition ${viewMode === "list" ? "bg-slate-800 text-white" : "text-slate-500"}`}
                  title="Modo Lista"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* SKELETON OR BLANK CASE RENDERING */}
          {sortedSkills.length === 0 ? (
            <div className="border border-dashed border-slate-800 p-12 text-center bg-[#0d0d0f] space-y-3">
              <X className="w-10 h-10 text-red-500 mx-auto opacity-70" />
              <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">Nenhuma skill jurídica localizada</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Tente reajustar seus valores de Quality Score ou remova a especificação de palavra-chave para recuperar a consulta das Arcadas.
              </p>
              <button
                onClick={handleClearFilters}
                className="border border-slate-800 hover:border-red-500 bg-[#121214] text-xs font-mono text-slate-300 px-4 py-2 mt-2 uppercase transition-all"
              >
                Limpar todos os filtros
              </button>
            </div>
          ) : (
            /* Skills output with viewmode integration */
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
              {sortedSkills.slice(0, visibleCount).map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onSelect={onSelectSkill}
                />
              ))}
            </div>
          )}

          {/* SCROLL SKELETON LOADERS CONTROLLER & INCREMENTAL TRIGGER */}
          {visibleCount < sortedSkills.length && (
            <div className="pt-4 text-center">
              <button
                id="btn-increment-infinite-scroll"
                disabled={loadingMore}
                onClick={handleLoadMore}
                className="cursor-pointer border border-[#27272a] hover:border-red-500 bg-[#0c0c0e] hover:bg-[#141416] text-xs font-mono text-slate-300 font-semibold px-8 py-3 uppercase tracking-wider transition-all disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <RefreshCw className="w-4.5 h-4.5 animate-spin text-red-500" />
                    Buscando próximas skills...
                  </>
                ) : (
                  "Carregar mais catalogados"
                )}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* SECTION 7: FAQ Pedagógico de Perguntas Frequentes colapsável (FAQAccordion) */}
      <div className="max-w-4xl mx-auto py-12 px-4 border-t border-[#1b1b1f] mt-12">
        <div className="text-center mb-8">
          <HelpCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-white tracking-tight uppercase">Manual Pedagógico Sanfran.md</h3>
          <p className="text-xs text-slate-400 mt-1">Esclareça suas principais dúvidas sobre o uso e a licença aberta das Skills</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="border border-[#232328] bg-[#0c0c0f] p-4 transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-tight duration-150 focus:outline-none focus:text-red-400"
                >
                  <span>• {faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? "rotate-180 text-red-500" : ""}`} />
                </button>
                {isOpen && (
                  <p className="mt-3 text-xs sm:text-[13px] leading-relaxed text-slate-400 pl-3 border-l-2 border-l-red-600 font-sans font-light animate-fade-in whitespace-pre-wrap select-text">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
