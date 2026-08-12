"use client";

import React from "react";
import { Plus } from "lucide-react";
import { SearchInput } from "./SearchInput";
import { RevealContainer } from "../ui/shared/RevealContainer";

interface MarketplaceHeroProps {
  initialSearch: string;
  onSearch: (q: string) => void;
  onShowCreateModal: () => void;
  totalPub: number;
}

export function MarketplaceHero({ initialSearch, onSearch, onShowCreateModal, totalPub }: MarketplaceHeroProps) {
  return (
    <section className="paper-texture paper-seda relative pt-24 md:pt-32 lg:pt-[140px] pb-20 px-margin-desktop border-b border-border overflow-hidden" style={{ background: "linear-gradient(180deg, #fff8f5 0%, #F9F7F5 100%)" }}>
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center relative z-10">
        
        <RevealContainer>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-border shadow-sm mb-8 transition-all">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            <span className="text-[11px] font-mono text-muted">
              Catálogo atualizado com <span className="font-semibold text-foreground">{totalPub} skills</span>
            </span>
          </div>
        </RevealContainer>

        <RevealContainer delay={100}>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight leading-[1.1] mb-5 font-serif">
            Catálogo de Skills Jurídicas
          </h1>
        </RevealContainer>

        <RevealContainer delay={200}>
          <p className="text-base text-muted leading-relaxed mb-10 max-w-2xl">
            Acesse inteligência jurídica brasileira pronta para uso em seus agentes de IA. Skills validadas por especialistas para cada área do direito.
          </p>
        </RevealContainer>

        <RevealContainer delay={300} className="w-full max-w-2xl">
          <SearchInput initialValue={initialSearch} onSearch={onSearch} />
        </RevealContainer>

        <RevealContainer delay={400}>
          <div className="flex flex-wrap justify-center items-center gap-2">
            <button
              onClick={onShowCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono font-medium rounded-full bg-accent text-white hover:bg-accent-hover transition-all hover:-translate-y-0.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Publicar Skill
            </button>
          </div>
        </RevealContainer>
      </div>
    </section>
  );
}
