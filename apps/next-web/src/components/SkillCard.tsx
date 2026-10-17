"use client";

import React from "react";
import { ArrowUpRight, Star } from "lucide-react";
import { LegalSkill } from "../lib/types";
import { useUserLibrary } from "../contexts/UserLibraryContext";
import { ReviewBadge, SKILL_TYPE_LABEL } from "./ReviewBadge";

interface SkillCardProps {
  skill: LegalSkill;
  onSelect: (skill: LegalSkill) => void;
  featured?: boolean;
}

function formatDate(iso: string) {
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function SkillCard({ skill, onSelect, featured = false }: SkillCardProps) {
  const { isStarred } = useUserLibrary();
  const starred = isStarred(skill.id);
  const updated = formatDate(skill.updatedAt);

  return (
    <button
      type="button"
      id={`skill-card-${skill.id}`}
      onClick={() => onSelect(skill)}
      className={`group text-left flex flex-col gap-3 p-5 rounded-lg border border-border bg-card hover:border-foreground/25 transition-colors ${featured ? "sm:col-span-2" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground font-mono truncate">
          {skill.vertical}
          {skill.skillType && <> · {SKILL_TYPE_LABEL[skill.skillType]}</>}
        </span>
        <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" aria-hidden />
      </div>

      <h3 className="font-serif text-base font-medium leading-snug line-clamp-2">{skill.name}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{skill.description}</p>

      <div className="mt-auto pt-3 flex items-center justify-between gap-2 border-t border-border">
        <ReviewBadge skill={skill} />
        <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {starred && <Star className="w-3 h-3 fill-current" aria-label="Na sua biblioteca" />}
          {updated && <>Atualizada em {updated}</>}
        </span>
      </div>
    </button>
  );
}
