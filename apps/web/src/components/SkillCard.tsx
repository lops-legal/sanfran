import React from "react";
import { LegalSkill } from "../types";
import { Star, ShieldCheck, ArrowUpRight, Download, FileText, Scale, Shield, Briefcase, ShoppingBag, FileSignature } from "lucide-react";
import { useInView } from "../hooks/useInView";

interface SkillCardProps {
  skill: LegalSkill;
  onSelect: (skill: LegalSkill) => void;
  featured?: boolean;
}

// Map vertical to icon
const VERTICAL_ICON: Record<string, React.ReactNode> = {
  Trabalhista: <Briefcase className="w-5 h-5" />,
  LGPD: <Shield className="w-5 h-5" />,
  Consumidor: <ShoppingBag className="w-5 h-5" />,
  Societario: <FileSignature className="w-5 h-5" />,
  Processual: <Scale className="w-5 h-5" />,
};

// Map vertical to icon bg color
const VERTICAL_ICON_BG: Record<string, string> = {
  Trabalhista: "bg-red-50 text-red-600",
  LGPD: "bg-emerald-50 text-emerald-600",
  Consumidor: "bg-amber-50 text-amber-600",
  Societario: "bg-blue-50 text-blue-600",
  Processual: "bg-purple-50 text-purple-600",
};

// Check if skill is recent (within 30 days)
function isRecent(skill: LegalSkill): boolean {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return new Date(skill.updatedAt) > thirtyDaysAgo;
}

function QualityBar({ score, animate }: { score: number; animate?: boolean }) {
  const color = score >= 90 ? "bg-emerald-500" : score >= 75 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="quality-bar-track flex-1 h-1.5 bg-border/50 rounded-full overflow-hidden">
        <div
          className={`h-1.5 rounded-full ${color} ${animate ? "quality-bar-animated" : ""}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="font-mono text-[10px] text-muted tabular-nums w-6 text-right">{score}</span>
    </div>
  );
}

function VerticalPill({ vertical }: { vertical: string }) {
  const map: Record<string, string> = {
    Trabalhista: "bg-red-50 text-red-700 border-red-200",
    LGPD: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Consumidor: "bg-amber-50 text-amber-700 border-amber-200",
    Societario: "bg-blue-50 text-blue-700 border-blue-200",
    Processual: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <span className={`pill-tag border ${map[vertical] ?? "bg-card-hover text-muted border-border"}`}>
      {vertical}
    </span>
  );
}

export default function SkillCard({ skill, onSelect, featured = false }: SkillCardProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });
  const downloadsLabel = (skill.downloadsCount ?? skill.starsCount) >= 1000
    ? `${((skill.downloadsCount ?? skill.starsCount) / 1000).toFixed(1)}k`
    : String(skill.downloadsCount ?? skill.starsCount);

  const recent = isRecent(skill);
  const iconElement = VERTICAL_ICON[skill.vertical] ?? <FileText className="w-5 h-5" />;
  const iconBg = VERTICAL_ICON_BG[skill.vertical] ?? "bg-card-hover text-muted";

  if (featured) {
    return (
      <div
        ref={ref}
        id={`skill-card-${skill.id}`}
        onClick={() => onSelect(skill)}
        className={`marketplace-card group cursor-pointer col-span-2 p-6 flex flex-col gap-5 ${inView ? "animate-fade-in" : "opacity-0"}`}
      >
        {/* Featured header */}
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                {iconElement}
              </div>
              <div className="flex items-center gap-2">
                <VerticalPill vertical={skill.vertical} />
                {skill.complianceChecked && (
                  <span className="pill-tag bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-2.5 h-2.5" /> OAB
                  </span>
                )}
                {recent && (
                  <span className="pill-tag bg-accent/10 text-accent border border-accent/20 font-bold">Novo</span>
                )}
              </div>
            </div>
            <h3 className="text-base font-semibold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors font-serif">
              {skill.name}
            </h3>
            <p className="text-sm text-muted leading-relaxed line-clamp-2 font-light">
              {skill.description}
            </p>
          </div>
          <div className="shrink-0 w-8 h-8 rounded-lg bg-card-hover border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200">
            <ArrowUpRight className="w-4 h-4 text-foreground" />
          </div>
        </div>

        {/* Score bars */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 relative z-10">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted">Qualidade</span>
            </div>
            <QualityBar score={skill.qualityScore} animate={inView} />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted">Compliance</span>
            </div>
            <QualityBar score={skill.regulatoryScore} animate={inView} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border relative z-10">
          <div className="flex items-center gap-3 text-muted font-mono text-[10px]">
            <span className="text-muted">{skill.ownerAvatar} {skill.ownerName}</span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
              {skill.rating.toFixed(1)}
              <span className="text-muted">({skill.reviewCount})</span>
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {downloadsLabel}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skill.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="pill-tag bg-card text-muted border border-border">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Regular card (non-featured)
  return (
    <div
      ref={ref}
      id={`skill-card-${skill.id}`}
      onClick={() => onSelect(skill)}
      className={`marketplace-card group cursor-pointer p-5 flex flex-col gap-3 relative ${inView ? "animate-fade-in" : "opacity-0"}`}
    >
      {/* Novo badge */}
      {recent && (
        <div className="absolute top-3 right-3 z-10">
          <span className="pill-tag bg-accent/10 text-accent border border-accent/20 font-bold">Novo</span>
        </div>
      )}

      {/* Header: icon + vertical + quality score */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
            {iconElement}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] text-muted font-mono truncate">{skill.ownerAvatar} {skill.ownerName}</span>
            </div>
            <VerticalPill vertical={skill.vertical} />
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 bg-card border border-border rounded-full px-2.5 py-1 text-[10px] font-mono font-bold text-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ opacity: skill.qualityScore >= 90 ? 1 : skill.qualityScore >= 75 ? 0.7 : 0.4 }} />
          {skill.qualityScore}%
        </div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors font-serif relative z-10">
        {skill.name}
      </h4>

      {/* Description */}
      <p className="text-xs text-muted leading-relaxed line-clamp-2 font-light relative z-10">
        {skill.description}
      </p>

      {/* Scores compact */}
      <div className="space-y-1.5 relative z-10">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-muted w-14 shrink-0">Qualidade</span>
          <QualityBar score={skill.qualityScore} animate={inView} />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-muted w-14 shrink-0">Compliance</span>
          <QualityBar score={skill.regulatoryScore} animate={inView} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border relative z-10">
        <div className="flex items-center gap-2.5 text-muted font-mono text-[10px]">
          <span className="flex items-center gap-1">
            <Star className="w-2.5 h-2.5 fill-amber-400 stroke-amber-400" />
            {skill.rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <Download className="w-2.5 h-2.5" />
            {downloadsLabel}
          </span>
          {skill.complianceChecked && (
            <span className="flex items-center gap-0.5 text-emerald-600">
              <ShieldCheck className="w-2.5 h-2.5" /> OAB
            </span>
          )}
        </div>
        {/* Hover action button */}
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(skill); }}
            className="text-[10px] font-mono font-semibold uppercase tracking-wide text-white bg-primary hover:bg-primary-dim px-3 py-1.5 rounded-lg transition-all shadow-sm"
          >
            Ver Skill &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
