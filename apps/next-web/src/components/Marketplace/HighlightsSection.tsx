"use client";

import React, { useState } from "react";
import { LegalSkill } from "../../lib/types";
import { ChevronLeft, ChevronRight, TrendingUp, Sparkles, Verified, Download } from "lucide-react";
import { useInView } from "../../hooks/useInView";

interface HighlightItem {
  id: string;
  name: string;
  desc: string;
  vertical: string;
  downloads: number;
  score: number;
  compliance: string;
  trending: boolean;
  skill: LegalSkill;
}

interface HighlightsSectionProps {
  highlights: HighlightItem[];
  onSelectSkill: (skill: LegalSkill) => void;
}

export function HighlightsSection({ highlights, onSelectSkill }: HighlightsSectionProps) {
  const [highlightIndex, setHighlightIndex] = useState(0);
  const { ref: highlightsRef, inView: highlightsInView } = useInView<HTMLDivElement>({ threshold: 0.15 });

  const maxHighlightPages = Math.max(0, highlights.length - 3);

  const complianceStyle = (level: string) => {
    const m: Record<string, string> = {
      Total: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      Alto: "bg-amber-50 text-amber-700 border border-amber-200",
      Moderado: "bg-gray-100 text-gray-600 border border-gray-200",
    };
    return `pill-tag ${m[level] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`;
  };

  if (highlights.length === 0) return null;

  return (
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
  );
}
