"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LegalSkill } from "../lib/types";
import {
  useInfiniteSkills, useInfiniteScrollSentinel,
  SortOption,
} from "../hooks/useInfiniteSkills";
import { CatalogStats } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import CreateSkillModal from "./CreateSkillModal";
import AuthModal from "./AuthModal";
import { toast } from "./Toast";

// Novas sub-componentes refatoradas
import { MarketplaceHero } from "./Marketplace/MarketplaceHero";
import { HighlightsSection } from "./Marketplace/HighlightsSection";
import { FilterToolbar } from "./Marketplace/FilterToolbar";
import { SkillGrid } from "./Marketplace/SkillGrid";

// Import cinematic styles
import "../styles/home-cinematic.css";

interface MarketplaceProps {
  onSelectSkill?: (skill: LegalSkill) => void;
  initialStats?: CatalogStats;
  initialData?: { skills: LegalSkill[]; total: number; nextCursor: number | null };
  initialQuery?: string;
  initialSort?: string;
}

const PAGE_SIZE = 12;

export default function Marketplace({ 
  onSelectSkill, 
  initialStats, 
  initialData,
  initialQuery = "",
  initialSort = "stars"
}: MarketplaceProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const handleSelectSkill = useCallback((skill: LegalSkill) => {
    if (onSelectSkill) {
      onSelectSkill(skill);
    } else {
      router.push(`/skills/${skill.slug}`);
    }
  }, [onSelectSkill, router]);

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort as SortOption);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sincronização de URL (apenas no cliente)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams();
    if (searchInput) p.set("q", searchInput);
    if (sortBy !== "stars") p.set("sort", sortBy);
    const search = p.toString();
    window.history.replaceState(null, "", search ? `?${search}` : window.location.pathname);
  }, [searchInput, sortBy]);

  // Hook de busca infinita com suporte a dados iniciais do servidor
  const { 
    items, 
    totalCount, 
    isLoading, 
    error, 
    hasMore, 
    loadMore, 
    retry, 
    mutateItems 
  } = useInfiniteSkills({
    search: searchInput,
    sortBy,
    pageSize: PAGE_SIZE,
    initialData: initialData // Passamos os dados do servidor para evitar refetch imediato
  });

  const handleCreateSuccess = useCallback((s: LegalSkill) => {
    mutateItems(prev => [s, ...prev]);
    toast.success("Skill publicada!", `"${s.name}" aparece no topo do catálogo.`);
    setShowCreateModal(false);
  }, [mutateItems]);

  const isPreview = !user;
  const sentinelRef = useInfiniteScrollSentinel(loadMore, !isPreview && hasMore && !isLoading && !error);

  // Destaques baseados na qualidade (Memoizado)
  const highlights = useMemo(() => {
    if (!items.length) return [];
    return [...items]
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, 3)
      .map((s, i) => ({
        id: s.id,
        name: s.name,
        desc: s.description,
        vertical: s.vertical,
        downloads: s.starsCount,
        score: s.qualityScore,
        compliance: s.complianceChecked ? "Total" : s.regulatoryScore >= 80 ? "Alto" : "Moderado",
        trending: i === 0,
        skill: s,
      }));
  }, [items]);

  return (
    <div id="marketplace" className="bg-background text-foreground font-sans pb-section-gap">
      
      <MarketplaceHero 
        initialSearch={searchInput}
        onSearch={setSearchInput}
        onShowCreateModal={() => setShowCreateModal(true)}
        totalPub={initialStats?.totalPublished || 0}
      />

      <HighlightsSection 
        highlights={highlights} 
        onSelectSkill={handleSelectSkill} 
      />

      <div className="section-divider-warm" />

      <main className="max-w-[1280px] mx-auto px-margin-desktop py-section-gap">
        <FilterToolbar 
          totalCount={totalCount}
          sortBy={sortBy}
          onSortChange={setSortBy}
          isLoading={isLoading}
        />

        <SkillGrid 
          items={items}
          isLoading={isLoading}
          error={error}
          onSelectSkill={handleSelectSkill}
          onRetry={retry}
          sentinelRef={sentinelRef}
          isPreview={isPreview}
          onAuthClick={() => setIsAuthModalOpen(true)}
        />
      </main>

      <CreateSkillModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onSuccess={handleCreateSuccess}
        currentUserId={user?.id}
      />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
