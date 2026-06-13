import React, { useState } from "react";
import { LegalSkill } from "./types";
import { MOCK_SKILLS } from "./data";
import Marketplace from "./components/Marketplace";
import LexBot from "./components/LexBot";
import SkillDetailPage from "./components/skilldetailpage";
import SettingsModal from "./components/SettingsModal";
import ConsentBanner from "./components/ConsentBanner";
import { Scale, MessageSquare, BookOpen, User, ShieldCheck, HelpCircle, Settings } from "lucide-react";

export default function App() {
  const [skills, setSkills] = useState<LegalSkill[]>(MOCK_SKILLS);
  const [currentView, setCurrentView] = useState<"marketplace" | "lex" | "detail">("marketplace");
  const [selectedSkill, setSelectedSkill] = useState<LegalSkill | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState("PT-BR");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSelectSkill = (skill: LegalSkill) => {
    setSelectedSkill(skill);
    setCurrentView("detail");
  };

  const handlePublishSkill = (newSkill: LegalSkill) => {
    setSkills((prev) => [newSkill, ...prev]);
    setSelectedSkill(newSkill);
    setCurrentView("detail");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#050505] text-[#eaeaea] font-sans antialiased selection:bg-orange-500 selection:text-white">

      {/* 1. CABEÇALHO (Header) - Visual Ethereal Glass */}
      <header className="sticky top-0 z-50 w-full bg-[#050505]/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* Logo Section */}
          <div
            onClick={() => setCurrentView("marketplace")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(249,115,22,0.1)] transition-all duration-300 group-hover:scale-105">
              ⚖️
            </div>
            <div>
              <h1 className="font-sans font-black text-sm tracking-wide text-white uppercase flex items-center gap-1.5">
                Sanfran<span className="text-orange-500">.md</span>
              </h1>
              <span className="text-[9px] font-mono text-slate-500 block leading-none">
                SKILLS MP FOR BRAZILIAN LAW
              </span>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-full font-mono text-xs">
            <button
              onClick={() => setCurrentView("marketplace")}
              className={`px-4 py-1.5 rounded-full transition-all duration-300 ${currentView === "marketplace" || currentView === "detail"
                  ? "bg-orange-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
                }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => setCurrentView("lex")}
              className={`px-4 py-1.5 rounded-full transition-all duration-300 ${currentView === "lex"
                  ? "bg-orange-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
                }`}
            >
              Atelier Lex AI
            </button>
          </nav>

          {/* Right Accessories (Language, Clerk/Auth, etc) */}
          <div className="flex items-center gap-3">

            {/* Language Selector */}
            <select
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="bg-white/5 border border-white/10 text-slate-300 font-mono text-[10px] py-1 px-2 rounded-md outline-none cursor-pointer hover:bg-white/10"
            >
              <option value="PT-BR" className="bg-[#0c0c0e]">PT-BR</option>
              <option value="EN-US" className="bg-[#0c0c0e]">EN-US</option>
            </select>

            {/* Configurações Button (Substituindo Dr. Lucas) */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-mono text-[10px] rounded-lg transition-all"
            >
              <Settings className="w-3.5 h-3.5 text-orange-500" />
              <span>Configurações</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. BODY CONTENT SECTION */}
      <main className={`flex-1 w-full bg-[#050505] relative ${currentView === "lex" ? "overflow-hidden flex flex-col" : "overflow-hidden"}`}>
        {/* Render pages depending on currentView */}
        {currentView === "marketplace" && (
          <div className="animate-fade-up-heavy">
            <Marketplace
              skillsList={skills}
              onSelectSkill={handleSelectSkill}
              onNavigateToLex={() => setCurrentView("lex")}
            />

          </div>
        )}

        {currentView === "lex" && (
          <div className="animate-fade-up-heavy h-full">
            <LexBot onPublishSkill={handlePublishSkill} />
          </div>
        )}

        {currentView === "detail" && selectedSkill && (
          <div className="animate-fade-up-heavy">
            <SkillDetailPage
              skill={selectedSkill}
              onBack={() => setCurrentView("marketplace")}
            />
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      {/* Consent Banner */}
      <ConsentBanner />

    </div>
  );
}

