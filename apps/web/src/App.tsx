import React, { useState } from "react";
import { LegalSkill } from "./types";
import { MOCK_SKILLS } from "./data";
import Marketplace from "./components/Marketplace";
import LexBot from "./components/LexBot";
import SkillDetailPage from "./components/SkillDetailPage";
import SkillCard from "./components/SkillCard";
import { 
  Building2, BookMarked, MessageSquare, Compass, 
  Settings, HelpCircle, Code, Award, CheckCircle2,
  ExternalLink, FileText, ChevronRight, Bookmark,
  Heart, Landmark, Info
} from "lucide-react";

export default function App() {
  const [skills, setSkills] = useState<LegalSkill[]>(MOCK_SKILLS);
  const [selectedSkill, setSelectedSkill] = useState<LegalSkill | null>(null);
  const [activeTab, setActiveTab] = useState<"marketplace" | "lex" | "favorites" | "docs">("marketplace");
  const [favoriteIds, setFavoriteIds] = useState<string[]>(["validador-peticao-cdc", "validador-politicas-lgpd"]);
  const [oabCredential, setOabCredential] = useState<string>("SP-384.219");

  const handleSelectSkill = (skill: LegalSkill) => {
    setSelectedSkill(skill);
  };

  const handleBackToCatalog = () => {
    setSelectedSkill(null);
  };

  // Callback to insert a dynamically designed skill created by Lex into the marketplace
  const handlePublishNewSkill = (newSkill: LegalSkill) => {
    setSkills(prev => [newSkill, ...prev]);
    // Optionally switch to marketplace to show it has been listed immediately!
    setActiveTab("marketplace");
    setSelectedSkill(null);
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#070708] text-[#eaeaea] font-sans">
      
      {/* GLOBAL HEADER PART 1: Top Navigation Arcades Bar */}
      <header className="border-b border-[#1b1b22] bg-[#09090b] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-[64px]">
          
          {/* Logo Brand USP Largo de Sao Francisco Academico Style */}
          <div 
            onClick={() => {
              setSelectedSkill(null);
              setActiveTab("marketplace");
            }} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-red-600 flex items-center justify-center font-mono font-black text-white text-md border border-red-500 rounded-sm">
              S𐌽
            </div>
            <div>
              <h1 className="text-md sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
                SANFRAN.MD
                <span className="hidden leading-none sm:inline-block font-mono text-[9px] text-[#dc2626] border border-[#dc2626]/30 px-1 hover:bg-[#dc2626]/10 py-0.5 font-bold uppercase tracking-wider">
                  USP Direito
                </span>
              </h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-wide mt-0.5">
                Plataforma de IA & Core SKILL.md
              </p>
            </div>
          </div>

          {/* Core Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 font-mono text-xs">
            {/* Marketplace Link */}
            <button
              id="navigation-marketplace-tab"
              onClick={() => {
                setActiveTab("marketplace");
                setSelectedSkill(null);
              }}
              className={`px-3.5 py-2 cursor-pointer transition uppercase tracking-wide border-b-2 font-bold ${
                activeTab === "marketplace" && !selectedSkill
                  ? "border-red-500 text-white bg-slate-900/40"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-red-500" />
                Marketplace (Catálogo)
              </span>
            </button>

            {/* Lex Generator Link */}
            <button
              id="navigation-lex-tab"
              onClick={() => {
                setActiveTab("lex");
                setSelectedSkill(null);
              }}
              className={`px-3.5 py-2 cursor-pointer transition uppercase tracking-wide border-b-2 font-bold ${
                activeTab === "lex"
                  ? "border-red-500 text-white bg-slate-900/40"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-orange-400 animate-pulse" />
                Atelier Lex (Atendimento/Criador)
              </span>
            </button>

            {/* Minha Organização Link */}
            <button
              id="navigation-favorites-tab"
              onClick={() => {
                setActiveTab("favorites");
                setSelectedSkill(null);
              }}
              className={`px-3.5 py-2 cursor-pointer transition uppercase tracking-wide border-b-2 font-bold ${
                activeTab === "favorites"
                  ? "border-red-500 text-white bg-slate-900/40"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Minha Organização
              </span>
            </button>

            {/* Documentação Link */}
            <button
              id="navigation-docs-tab"
              onClick={() => {
                setActiveTab("docs");
                setSelectedSkill(null);
              }}
              className={`px-3.5 py-2 cursor-pointer transition uppercase tracking-wide border-b-2 font-bold ${
                activeTab === "docs"
                  ? "border-red-500 text-white bg-slate-900/40"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <BookMarked className="w-4 h-4 text-purple-400" />
                Estudo & Spec
              </span>
            </button>
          </nav>

          {/* Right Header Controls buttons */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#141416] border border-slate-800 rounded font-mono text-[10px] text-slate-400 focus-within:border-emerald-500">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>OAB:</span>
              <input 
                type="text" 
                value={oabCredential}
                onChange={(e) => setOabCredential(e.target.value)}
                className="bg-transparent text-slate-200 max-w-[80px] focus:outline-none font-bold"
                placeholder="SP-000000"
              />
            </div>
            
            <button
              onClick={() => {
                setActiveTab("lex");
                setSelectedSkill(null);
              }}
              className="cursor-pointer bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-mono text-xs px-4 py-2 uppercase font-extrabold transition-all shrink-0"
            >
              Criador de Skills Jurídicas
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE TAB BAR NAVIGATION */}
      <div className="md:hidden bg-[#0a0a0c] border-b border-[#202025] grid grid-cols-4 font-mono text-[9px] text-center uppercase tracking-tighter">
        <button
          onClick={() => {
            setActiveTab("marketplace");
            setSelectedSkill(null);
          }}
          className={`py-3 flex flex-col items-center gap-0.5 border-b-2 ${
            activeTab === "marketplace" && !selectedSkill ? "border-red-500 text-white font-bold" : "border-transparent text-slate-500"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Market</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("lex");
            setSelectedSkill(null);
          }}
          className={`py-3 flex flex-col items-center gap-0.5 border-b-2 ${
            activeTab === "lex" ? "border-red-500 text-white font-bold" : "border-transparent text-slate-500"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Atelier</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("favorites");
            setSelectedSkill(null);
          }}
          className={`py-3 flex flex-col items-center gap-0.5 border-b-2 ${
            activeTab === "favorites" ? "border-red-500 text-white font-bold" : "border-transparent text-slate-500"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Org</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("docs");
            setSelectedSkill(null);
          }}
          className={`py-3 flex flex-col items-center gap-0.5 border-b-2 ${
            activeTab === "docs" ? "border-red-500 text-white font-bold" : "border-transparent text-slate-500"
          }`}
        >
          <BookMarked className="w-4 h-4" />
          <span>Spec</span>
        </button>
      </div>

      {/* CORE FRAME CONTENT WRAPPER */}
      <main className="flex-grow select-text">
        {selectedSkill ? (
          /* View Details card */
          <SkillDetailPage
            skill={selectedSkill}
            onBack={handleBackToCatalog}
          />
        ) : (
          /* Switched main layout screens */
          <div>
            {/* Screen 1: Marketplace Directory */}
            {activeTab === "marketplace" && (
              <Marketplace
                skillsList={skills}
                onSelectSkill={handleSelectSkill}
                onNavigateToLex={() => setActiveTab("lex")}
              />
            )}

            {/* Screen 2: Lex Bot Creator workspace */}
            {activeTab === "lex" && (
              <LexBot
                onPublishSkill={handlePublishNewSkill}
              />
            )}

            {/* Screen 3: Minha Organização Dashboard */}
            {activeTab === "favorites" && (
              <div className="max-w-7xl mx-auto py-10 px-4 animate-fade-in space-y-8 select-text">
                <div className="border border-[#26262a] bg-[#101012] p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-[4px] h-full bg-emerald-500" />
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase">
                    Painel da Organização: L.C. Advocacia
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
                    Gerencie suas skills privadas, instâncias homologadas do tribunal, monitoramento de consumo de API tokenizada e o seu portfólio de favoritos.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-[#141416] p-4 border border-slate-900">
                      <span className="text-slate-500 text-[9px] font-mono block uppercase">OAB Vinculada</span>
                      <span className="text-white text-md font-mono font-bold mt-1 block">{oabCredential || "Não vinculada"}</span>
                    </div>
                    <div className="bg-[#141416] p-4 border border-slate-900">
                      <span className="text-slate-500 text-[9px] font-mono block uppercase">Skills Favoritas</span>
                      <span className="text-white text-md font-mono font-bold mt-1 block">{favoriteIds.length} salvas</span>
                    </div>
                    <div className="bg-[#141416] p-4 border border-slate-900">
                      <span className="text-slate-500 text-[9px] font-mono block uppercase">Consumo Mensal</span>
                      <span className="text-emerald-400 text-md font-mono font-bold mt-1 block">8.541 tokens / ok</span>
                    </div>
                    <div className="bg-[#141416] p-4 border border-slate-900">
                      <span className="text-slate-500 text-[9px] font-mono block uppercase">Licença Ativa</span>
                      <span className="text-white text-md font-mono font-bold mt-1 block">Membro USP</span>
                    </div>
                  </div>
                </div>

                {/* Starred items listing */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-900 pb-2">
                    <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                    Skills Favoritas e Favoritadas ({favoriteIds.length})
                  </h3>

                  {favoriteIds.length === 0 ? (
                    <div className="border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500 font-mono">
                      Nenhuma skill marcada com coração na organização no momento.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {skills.filter(s => favoriteIds.includes(s.id)).map(skill => (
                        <div key={skill.id} className="relative">
                          {/* Close favorite trigger tag */}
                          <button
                            onClick={() => toggleFavorite(skill.id)}
                            className="absolute top-2.5 right-24 z-20 text-[10px] bg-red-950/20 hover:bg-red-500/20 text-red-400 border border-slate-800 font-mono px-2 py-0.5 uppercase cursor-pointer transition-all"
                          >
                            Remover
                          </button>
                          <SkillCard
                            skill={skill}
                            onSelect={handleSelectSkill}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Compliance Check Credentials Info block */}
                <div className="bg-[#131110] border border-emerald-950/30 p-4 text-xs text-slate-400 rounded-sm">
                  <span className="text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-wider block mb-1">
                    ✓ Compliance OAB e Provimento Federal
                  </span>
                  As diretrizes criadas em Sanfran.md operam estritamente no formato de automação administrativa de apoio de bastidor ao advogado constituído, respeitando integralmente as diretrizes do Provimento nº 205/2021 de publicidade e inteligência jurídica.
                </div>
              </div>
            )}

            {/* Screen 4: Estudo e Spec (Documentação / SKILL.md Spec) */}
            {activeTab === "docs" && (
              <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in space-y-6 select-text">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase flex items-center gap-2">
                    <Code className="w-5 h-5 text-purple-400" />
                    O Padrão SKILL.md (Especificação Técnica)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    Entenda o manifesto de diretivas abertas que governa a interoperabilidade dos nossos agentes de IA jurídica brasileiras.
                  </p>
                </div>

                {/* Specification card text list */}
                <div className="space-y-6 text-xs sm:text-[13px] leading-relaxed text-slate-300 font-sans font-light">
                  <div className="bg-[#0b0b0d] p-5 border border-slate-900 space-y-3">
                    <h3 className="text-sm font-semibold text-white tracking-tight">progressive disclosure: O Segredo do Controle</h3>
                    <p>
                      Muitos prompts jurídicos falham porque tentam impor centenas de regras simultâneas à IA, gerando saturação de tokens e lapsos graves de raciocínio. A estrutura recomendada de **3 níveis de complexidade** resolve isso com transparência e fluidez de resposta.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#0e0e11] p-4 border border-slate-900">
                      <span className="font-mono text-[10px] text-orange-400 block uppercase font-bold">Nível 1: Caso Padrão</span>
                      <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                        Mapeia as rotas clássicas do processo. Lista os requisitos lógicos indispensáveis e as leis que em hipótese alguma podem ser omitidas pelas premissas fundamentais de entrada.
                      </p>
                    </div>

                    <div className="bg-[#0e0e11] p-4 border border-slate-900">
                      <span className="font-mono text-[10px] text-orange-400 block uppercase font-bold">Nível 2: Limiar de Risco</span>
                      <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                        Lida com a redação capciosa e as controvérsias ocultas (como multas leoninas ocultas em termos de privacidade ou subordinação PJ oculta na CLT).
                      </p>
                    </div>

                    <div className="bg-[#0e0e11] p-4 border border-slate-900">
                      <span className="font-mono text-[10px] text-orange-400 block uppercase font-bold">Nível 3: Bloqueio de Escopo</span>
                      <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                        Determina o limite definitivo! A IA recusa a tomada de decisão em casos em que haja concorrência de jurisprudência ou exigência de perícia médico-legista humana obrigatória.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-white tracking-tight">Modelo Manifesto SKILL.md recomendável:</h3>
                    
                    <div className="bg-[#09090b] border border-[#1e1e24] p-4 font-mono text-xs text-slate-400 overflow-x-auto whitespace-pre rounded shadow-inner">
{`# Nome da Skill Jurídica
## 1. Goal (Objetivo central do robô)
Defina o papel exato do revisor.

## 2. Context & Core Norms (Normas Federais aplicáveis)
* CLT Artigo X...
* Código de Defesa do Consumidor Artigo Y...

## 3. Execution Levels (Os 3 Níveis recomendados)
### Level 1: Standard Case (Entradas ordinárias)
### Level 2: Exceptional Handling (Erros e cláusulas leoninas)
### Level 3: Hard Boundaries & Grounding (Onde a IA deve travar)

## 4. Test Cases & Expected Formats (Casos de teste JSON/Markdown)
### Input Case
### Output Diagnostic`}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CLOCK / DYNAMIC CONTEXT STATUS BOTTOM BAR */}
      <footer className="border-t border-[#1b1b22] bg-[#09090b] text-[11px] font-mono text-slate-500 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>© 2026 Sanfran.md • Iniciativa Acadêmica Open-Source</span>
            <span className="text-slate-700">|</span>
            <span className="hover:underline hover:text-red-500 cursor-pointer flex items-center gap-1">
              Arcadas Largo de São Francisco
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Certificado OAB: <span className="text-emerald-400 font-bold">SP-384.219 (Ativo)</span></span>
            <div className="w-[1px] h-3 bg-slate-800" />
            <span>Padrão 3 Níveis compliant</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
