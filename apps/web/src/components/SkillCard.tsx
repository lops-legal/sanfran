import React from "react";
import { LegalSkill } from "../types";
import { Star, GitFork, ShieldCheck, ArrowUpRight, Download } from "lucide-react";

interface SkillCardProps {
  skill: LegalSkill;
  onSelect: (skill: LegalSkill) => void;
  featured?: boolean;
}

function QualityBar({ score }: { score: number }) {
  const color = score >= 90 ? "bg-emerald-500" : score >= 75 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
      <span className="font-mono text-[10px] text-muted tabular-nums w-6 text-right">{score}</span>
    </div>
  );
}

function VerticalPill({ vertical }: { vertical: string }) {
  const map: Record<string, string> = {
    Trabalhista: "bg-red-500/8 text-primary-dim border-primary/15",
    LGPD: "bg-emerald-500/8 text-emerald-400 border-emerald-500/15",
    Consumidor: "bg-amber-500/8 text-amber-400 border-amber-500/15",
    Societario: "bg-blue-500/8 text-blue-400 border-blue-500/15",
    Processual: "bg-purple-500/8 text-purple-400 border-purple-500/15",
  };
  return (
    <span className={`inline-flex items-center font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${map[vertical] ?? "bg-white/5 text-muted border-white/10"}`}>
      {vertical}
    </span>
  );
}

export default function SkillCard({ skill, onSelect, featured = false }: SkillCardProps) {
  const downloadsLabel = skill.starsCount >= 1000
    ? `${(skill.starsCount / 1000).toFixed(1)}k`
    : String(skill.starsCount);

  if (featured) {
    return (
      <div
        id={`skill-card-${skill.id}`}
        onClick={() => onSelect(skill)}
        className="group cursor-pointer col-span-2 bg-card border border-border hover:border-[#3a3a40] transition-colors duration-200 p-6 flex flex-col gap-5"
      >
        {/* Featured header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted border border-border px-1.5 py-0.5">
                Em destaque
              </span>
              <VerticalPill vertical={skill.vertical} />
              {skill.complianceChecked && (
                <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 border border-emerald-500/15 bg-emerald-500/8 text-emerald-400">
                  <ShieldCheck className="w-2.5 h-2.5" /> OAB
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold text-slate-100 leading-snug mb-2 group-hover:text-foreground transition-colors">
              {skill.name}
            </h3>
            <p className="text-sm text-muted leading-relaxed line-clamp-2 font-light">
              {skill.description}
            </p>
          </div>
          <div className="shrink-0 w-8 h-8 rounded-sm bg-card-hover border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200">
            <ArrowUpRight className="w-4 h-4 text-foreground" />
          </div>
        </div>

        {/* Score bars */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-xmuted">Qualidade</span>
            </div>
            <QualityBar score={skill.qualityScore} />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-xmuted">Compliance</span>
            </div>
            <QualityBar score={skill.regulatoryScore} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-muted font-mono text-[10px]">
            <span className="text-xmuted font-mono text-[10px]">{skill.ownerAvatar} {skill.ownerName}</span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
              {skill.rating.toFixed(1)}
              <span className="text-xmuted">({skill.reviewCount})</span>
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {downloadsLabel}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skill.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="font-mono text-[9px] text-xmuted bg-card-hover border border-[#242428] px-1.5 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`skill-card-${skill.id}`}
      onClick={() => onSelect(skill)}
      className="group cursor-pointer bg-card border border-border hover:border-[#3a3a40] transition-colors duration-200 p-4 flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="font-mono text-[9px] text-xmuted">{skill.ownerAvatar} {skill.ownerName}</span>
          </div>
          <h4 className="text-sm font-semibold text-slate-200 leading-snug line-clamp-2 group-hover:text-foreground transition-colors">
            {skill.name}
          </h4>
        </div>
        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ArrowUpRight className="w-3.5 h-3.5 text-muted" />
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted leading-relaxed line-clamp-2 font-light">
        {skill.description}
      </p>

      {/* Scores */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-xmuted w-14 shrink-0">Qualidade</span>
          <QualityBar score={skill.qualityScore} />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-xmuted w-14 shrink-0">Compliance</span>
          <QualityBar score={skill.regulatoryScore} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-border">
        <div className="flex items-center gap-2.5 text-xmuted font-mono text-[10px]">
          <span className="flex items-center gap-1">
            <Star className="w-2.5 h-2.5 fill-amber-400 stroke-amber-400" />
            {skill.rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <Download className="w-2.5 h-2.5" />
            {downloadsLabel}
          </span>
          {skill.complianceChecked && (
            <span className="flex items-center gap-0.5 text-emerald-500">
              <ShieldCheck className="w-2.5 h-2.5" /> OAB
            </span>
          )}
        </div>
        <VerticalPill vertical={skill.vertical} />
      </div>
    </div>
  );
}
