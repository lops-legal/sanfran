"use client";

import React from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { SortOption } from "../../hooks/useInfiniteSkills";

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "stars", label: "Popular" },
  { id: "score", label: "Qualidade" },
  { id: "hot", label: "Em alta" },
  { id: "recent", label: "Recente" },
];

interface FilterToolbarProps {
  totalCount: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  isLoading: boolean;
}

export function FilterToolbar({ totalCount, sortBy, onSortChange, isLoading }: FilterToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground font-serif">Todas as Skills</h2>
        <p className="text-sm text-muted mt-1">
          {isLoading ? "Buscando..." : `${totalCount} resultados encontrados`}
        </p>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none pl-4 pr-10 py-2 bg-white border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:border-primary/30 transition-all"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                Ordenar por: {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        </div>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
      </div>
    </div>
  );
}
