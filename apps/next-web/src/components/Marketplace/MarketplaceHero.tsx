"use client";

import React from "react";
import { Plus } from "lucide-react";
import { SearchInput } from "./SearchInput";

interface MarketplaceHeroProps {
  initialSearch: string;
  onSearch: (q: string) => void;
  onShowCreateModal: () => void;
  totalPub: number;
}

export function MarketplaceHero({ initialSearch, onSearch, onShowCreateModal, totalPub }: MarketplaceHeroProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 text-center flex flex-col items-center gap-6">
        {totalPub > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-sm text-muted-foreground">
            {totalPub} skills no catálogo
          </div>
        )}
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Skills jurídicas</h1>
        <p className="text-lg text-muted-foreground max-w-2xl text-pretty">
          Procedimentos prontos para o Direito brasileiro. Abra uma skill para ler, copiar e colar no seu assistente — ou
          conecte o Claude, o ChatGPT ou o Manus e deixe que ele escolha.
        </p>
        <div className="w-full max-w-2xl">
          <SearchInput initialValue={initialSearch} onSearch={onSearch} />
        </div>
        <button
          onClick={onShowCreateModal}
          className="inline-flex items-center gap-1.5 h-9 px-4 text-sm font-medium rounded-full border border-border bg-foreground/[0.045] hover:bg-foreground/10 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Propor uma skill
        </button>
      </div>
    </section>
  );
}
