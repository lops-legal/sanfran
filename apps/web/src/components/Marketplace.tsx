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
  const [sortBy, setSortBy] = useState<"stars" | "recent" | "score">("stars");
  const [visibleCount, setVisibleCount] = useState<number>(3);
  const [loadingMore, setLoadingMore] = useState(false);
  
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
        <div className="absolute bottom-0 left-10 w-4 h-4 text-red-600/20 font-mono text-xs select-none">
          + FACULDADE_DIREITO_USP_1827_SANFRAN_MD
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Textual Intro and Interactive Search (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Proposta de valor / Pre-heading */}
              <div className="flex items-center gap-2">
                <span className="h-[2px] w-6 bg-red-600 inline-block" />
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
              <div className="mt-6 max-w-xl relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Search className="w-5 h-5" />
                </div>
                
                <input
                  ref={searchInputRef}
                  type="text"
                  id="marketplace-search-input"
                  className="w-full bg-[#121215]/90 border-2 border-slate-800 focus:border-red-500 focus:outline-none pl-11 pr-14 py-3 text-xs sm:text-sm text-slate-200 font-sans tracking-wide transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por áreas jurídicas (ex: multa rescisória, CLT, LGPD, CDC)..."
                />
                
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="hidden sm:inline-block font-mono text-[9px] text-slate-500 bg-[#16161a] border border-slate-800 px-1.5 py-0.5 rounded leading-none uppercase">
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

            {/* Right Column: Premium Brutalist Collage Card (5 Cols) portraying the Noble Hall / image_0 */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative border-4 border-[#212126] bg-[#0e0e11] p-1.5 shadow-2xl scale-[0.98] hover:scale-100 transition-all duration-500">
                
                {/* Decorative retro red technical labels overlay */}
                <div className="absolute -top-3.5 -left-3 capitalize font-mono text-[9px] bg-red-600 border border-red-500 px-2.5 py-0.5 text-white font-extrabold z-20 shadow-md">
                  Aula Magna • USP Direito
                </div>

                <div className="absolute top-2 right-2 font-mono text-[8px] text-red-500 bg-black/60 px-1.5 py-0.5 border border-red-500/30 z-20">
                  L.S.F. NOBLE_HALL // 1827
                </div>

                {/* Main USP noble building interior photo */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/90">
                  <img
                    src="/image_0.png"
                    alt="Salão Nobre das Arcadas de São Francisco"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-80 filter brightness-90 saturate-50 hover:saturate-100 hover:brightness-100 transition duration-700"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/30 to-transparent p-3 flex justify-between items-end">
                    <div className="space-y-0.5">
                      <span className="font-mono text-[9px] text-[#22c55e] block font-semibold">● SECURE_AI_TEMPLATES</span>
                      <span className="font-mono text-[8px] text-slate-400 block tracking-tighter">SÃO PAULO, BRASIL</span>
                    </div>
                    <span className="text-[10px] font-mono text-red-500 font-black">USP_ARCADAS</span>
                  </div>
                </div>

                {/* Tech specifications table look under the photo inside the frame */}
                <div className="mt-2.5 p-2 bg-[#141417] border border-[#202025] grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="border-r border-slate-800/60 pr-2">
                    <span className="text-slate-500 block text-[8px] uppercase">Rigor Legal</span>
                    <span className="text-slate-200">100% Hermenêutica Brasileira</span>
                  </div>
                  <div className="pl-1">
                    <span className="text-slate-500 block text-[8px] uppercase">Base de Conhecimento</span>
                    <span className="text-slate-200">Súmulas STJ / CPC / CLT</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

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

      {/* SECTION 4 & 5: Ecosystem Steps Narrative in 3 Steps */}
      <div className="max-w-7xl mx-auto py-6 px-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#0c0c0e] border border-[#232328] p-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-mono text-xs font-bold flex items-center justify-center">1</span>
              <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-200">Mapeie sua área de rigor</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Navegue pelas verticais normativas para entender quais competências e limiares regulatórios estão mapeados para os agentes.
            </p>
          </div>

          <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-800 md:pt-0 md:pl-6 pt-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-mono text-xs font-bold flex items-center justify-center">2</span>
              <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-200">Acompanhe criadores ativos</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Conheça perfis acadêmicos e centros acadêmicos (como XI de Agosto, Garra-Aberta) parceiros homologados que assinam os arquivos SKILL.md.
            </p>
          </div>

          <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-800 md:pt-0 md:pl-6 pt-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-mono text-xs font-bold flex items-center justify-center">3</span>
              <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-200">Audite os dual scores</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Utilize o Quality Score (parâmetros de prompt) de 0 a 100 e o score de conformidade regulatória para garantir transações corporativas seguras.
            </p>
          </div>

        </div>
      </div>

      {/* SECTION 5.5: Centro de Tradição, Idealismo e Rigor Técnico (Garra Aberta & Álvares de Azevedo /image_2) */}
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-gradient-to-br from-[#09090b] to-[#0d0d10] border-2 border-slate-800 hover:border-red-500/40 transition-all duration-500 p-6 md:p-8 relative overflow-hidden group">
          
          {/* Subtle background gridding effect */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#141417_1px,transparent_1px),linear-gradient(to_bottom,#141417_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />
          
          {/* Top layout status tag */}
          <div className="absolute top-0 right-10 w-3 h-10 bg-red-650 opacity-40 group-hover:bg-red-500 transition-colors pointer-events-none hidden md:block" />
          <div className="absolute top-4 right-4 font-mono text-[9px] text-slate-600 select-none hidden md:block">
            REF: XI_DE_AGOSTO_1831_1852
          </div>

          {/* Left Side: Álvares de Azevedo Statue image representation (/image_2.png) */}
          <div className="lg:col-span-4 flex justify-center items-center">
            <div className="relative border-2 border-[#202025] bg-black p-1.5 w-full max-w-[280px] shadow-lg group-hover:border-red-500/50 transition-all duration-500">
              
              {/* Retro top tag of the frame */}
              <div className="absolute -top-3 left-2 font-mono text-[8px] bg-red-650 text-white font-black px-2 py-0.5 tracking-widest uppercase">
                / GARRA ABERTA /
              </div>

              {/* Main Statue Image displaying /image_2.png */}
              <div className="aspect-[3/4.5] overflow-hidden bg-[#101012] relative">
                <img 
                  src="/image_2.png" 
                  alt="Álvares de Azevedo - Símbolo das Arcadas" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-90 filter grayscale contrast-125 saturate-50 group-hover:scale-[1.03] group-hover:grayscale-0 transition-all duration-700"
                />
                
                {/* Tech scan dots overlay on image corner */}
                <div className="absolute bottom-2 left-2 z-10 bg-black/75 px-1.5 py-0.5 border border-slate-800 text-[8px] font-mono text-slate-400">
                  ESTÁTUA_ALVARES_DE_AZEVEDO
                </div>
              </div>

              {/* Technical description at the footer of the image frame */}
              <div className="mt-2 text-center text-slate-500 font-mono text-[9px] leading-tight">
                MONUMENTO NO LARGO DE SÃO FRANCISCO
              </div>
            </div>
          </div>

          {/* Right Side: Narrative about Romantic Idealism, Liberty & Rigorous Legal Prompt Coding */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-4 md:pl-4">
            <div className="space-y-3">
              <span className="inline-block font-mono text-[9px] text-[#e11d48] font-bold border border-[#e11d48]/40 px-2 py-0.5 uppercase tracking-widest">
                MEMÓRIA E DOUTRINA
              </span>
              
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight uppercase font-sans">
                O Idealismo das Arcadas na <span className="text-red-500 font-black">Era Algorítmica</span>
              </h3>
              
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans font-light">
                Fundada em 1827 por Carta de Lei Imperial, a lendária Academia de Direito de São Francisco (USP) formou as mentes que desenharam a República brasileira, as lutas de libertação de ideias e as garantias fundamentais escritas na constituição. 
              </p>
              
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans font-light">
                O arquivo <code className="text-red-400 font-mono text-xs">SKILL.md</code> representa essa exata tradição de rigor intelectual levada para o universo dos LLMs. Aqui não fazemos meras instruções informais de texto: traduzimos a intenção, a hermenêutica estrita e a poesia de liberdade do poeta acadêmico <strong className="text-slate-200">Álvares de Azevedo (1831-1852)</strong> em parâmetros absolutos e limiares de autonomia para máquinas inteligentes.
              </p>
            </div>

            {/* Brutalist features matrix boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-900 font-mono text-[10px]">
              <div className="p-2 bg-[#121215] border border-[#202025]">
                <span className="text-slate-500 block uppercase text-[8px]">Símbolo Cultuado</span>
                <span className="text-red-400 font-semibold uppercase">Álvares de Azevedo</span>
              </div>
              <div className="p-2 bg-[#121215] border border-[#202025]">
                <span className="text-slate-500 block uppercase text-[8px]">Selo Acadêmico</span>
                <span className="text-slate-200 font-semibold uppercase">XI de Agosto</span>
              </div>
              <div className="p-2 bg-[#121215] border border-[#202025] col-span-2 sm:col-span-1">
                <span className="text-slate-500 block uppercase text-[8px]">Atitude Intelectual</span>
                <span className="text-emerald-400 font-semibold uppercase">Anti-Alucinação Estrita</span>
              </div>
            </div>

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
                className="w-full filter accent-red-600 h-1 bg-slate-900 rounded-lg cursor-pointer"
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

          {/* New Sidebar Card: Chronos / Temporalidade /image_1 */}
          <div className="border border-[#232328] bg-[#09090b]/90 p-3.5 space-y-3 relative overflow-hidden group">
            <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#ef4444] flex items-center gap-1">
                ⌛ TEMPORALIDADE DA LEI
              </span>
              <span className="font-mono text-[8px] text-slate-500">UTC-3</span>
            </div>

            {/* Facade clock and red ornament picture */}
            <div className="aspect-[4/3] w-full bg-[#121215] overflow-hidden border border-[#212126] relative">
              <img 
                src="/image_1.png" 
                alt="Relógio Histórico da São Francisco" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-80 filter brightness-95 grayscale saturate-50 group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-2">
                <span className="text-[8px] font-mono text-slate-300 block">COMPLIANCE TIMESTAMPS</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed font-sans font-light">
              Nas Arcadas do Largo de São Francisco, o histórico relógio nos ensina que o rigor da lei caminha com o tempo. Nossas skills são auditadas e atualizadas dinamicamente em tempo real.
            </p>

            <div className="flex justify-between items-center text-[8px] font-mono text-slate-600 pt-1 border-t border-slate-900">
              <span>SÃO PAULO / BR</span>
              <span>ESTABILIZADO</span>
            </div>
          </div>

        </div>

        {/* RIGHT SKILLS CATALOG GRID (9 columns) */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* List parameters bar and view toggle */}
          <div className="border border-[#232328] bg-[#0c0c0e] p-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-slate-500">Mostrando {Math.min(visibleCount, sortedSkills.length)} de {sortedSkills.length} resultados</span>
              
              {/* Reset/Clean active badges indicators query tag */}
              {(selectedVertical || selectedCategory || searchQuery || minQualityScore > 0) && (
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="w-1 h-3 bg-red-600" />
                  <span className="text-[10px] text-red-400 uppercase font-bold">Filtros ativos</span>
                </div>
              )}
            </div>

            {/* Selector sorter and list mode toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-slate-500">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#141417] text-slate-300 border border-slate-800 focus:outline-none focus:border-red-500 text-xs py-1 px-2 font-mono"
                >
                  <option value="stars">Popularidade (★)</option>
                  <option value="recent">Adicionados recentemente</option>
                  <option value="score">Quality Score 최고</option>
                </select>
              </div>

              {/* Grid / List Toggler visually */}
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
