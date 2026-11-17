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
      <div className="py-20 text-center bg-card rounded-lg border border-border">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Erro ao carregar catálogo</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">{error.message || "Ocorreu um problema de conexão."}</p>
        <button onClick={onRetry} className="h-9 px-4 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors text-sm font-medium">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (items.length === 0 && !isLoading) {
    return (
      <div className="py-24 text-center bg-card rounded-lg border border-dashed border-border">
        <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma skill encontrada</h3>
        <p className="text-muted-foreground text-sm">Tente ajustar seus termos de busca ou filtros.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div className="max-w-md bg-card p-8 rounded-lg border border-border">
            <h3 className="text-xl font-semibold mb-3">Continue Explorando</h3>
            <p className="text-sm text-muted mb-6">
              Você viu as primeiras skills. Entre com sua conta para ver o catálogo completo.
            </p>
            <button
              onClick={onAuthClick}
              className="w-full h-10 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
            >
              Entrar ou criar conta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
