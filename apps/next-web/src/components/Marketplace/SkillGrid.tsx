"use client";

import React from "react";
import { LegalSkill } from "../../lib/types";
import SkillCard from "../SkillCard";
import { Inbox, AlertTriangle, Loader2 } from "lucide-react";

interface SkillGridProps {
  items: LegalSkill[];
  isLoading: boolean;
  error: any;
  onSelectSkill: (skill: LegalSkill) => void;
  onRetry: () => void;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  isPreview?: boolean;
  onAuthClick?: () => void;
}

export function SkillGrid({
  items,
  isLoading,
  error,
  onSelectSkill,
  onRetry,
  sentinelRef,
  isPreview,
  onAuthClick,
}: SkillGridProps) {
  if (error) {
    return (
      <div className="py-20 text-center bg-red-50/50 rounded-3xl border border-red-100">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-900 mb-2">Erro ao carregar catálogo</h3>
        <p className="text-red-700/70 mb-6 max-w-md mx-auto">{error.message || "Ocorreu um problema de conexão."}</p>
        <button onClick={onRetry} className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (items.length === 0 && !isLoading) {
    return (
      <div className="py-24 text-center bg-card rounded-3xl border border-dashed border-border">
        <Inbox className="w-12 h-12 text-muted/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma skill encontrada</h3>
        <p className="text-muted text-sm">Tente ajustar seus termos de busca ou filtros.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
        {items.map((skill) => (
          <SkillCard key={skill.id} skill={skill} onSelect={onSelectSkill} />
        ))}
      </div>

      {/* Infinite Scroll Sentinel */}
      <div ref={sentinelRef} className="h-20 flex items-center justify-center mt-10">
        {isLoading && <Loader2 className="w-6 h-6 animate-spin text-primary/40" />}
      </div>

      {/* Auth Overlay for Preview Mode */}
      {isPreview && items.length >= 10 && (
        <div className="absolute inset-x-0 bottom-0 h-[400px] bg-gradient-to-t from-background via-background/95 to-transparent z-20 flex flex-col items-center justify-end pb-16 px-6 text-center">
          <div className="max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-border">
            <h3 className="text-xl font-bold text-foreground mb-3 font-serif">Continue Explorando</h3>
            <p className="text-sm text-muted mb-6">
              Você viu as primeiras 10 skills. Conecte-se para acessar o catálogo completo de centenas de inteligências jurídicas.
            </p>
            <button
              onClick={onAuthClick}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dim transition-all shadow-lg shadow-primary/20"
            >
              Entrar ou Criar Conta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
