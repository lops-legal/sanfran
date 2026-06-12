import React from "react";
import { LegalSkill } from "../types";
import { Star, GitFork, Wrench, ShieldCheck, Check } from "lucide-react";

interface SkillCardProps {
  skill: LegalSkill;
  onSelect: (skill: LegalSkill) => void;
  key?: any;
}

export default function SkillCard({ skill, onSelect }: SkillCardProps) {
  // Score 1 color styling (Quality)
  const getQualityStyle = (score: number) => {
    if (score >= 90) {
      return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
    }
    if (score >= 75) {
      return "bg-amber-500/10 border-amber-500/30 text-amber-400";
    }
    return "bg-red-500/10 border-red-500/30 text-red-500";
  };

  // Score 2 color styling (Regulatory Compliance)
  const getRegulatoryStyle = (score: number) => {
    if (score >= 90) {
      return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
    }
    if (score >= 75) {
      return "bg-amber-500/10 border-amber-500/30 text-amber-500";
    }
    return "bg-red-500/10 border-red-500/30 text-red-500";
  };

  return (
    <div
      id={`skill-card-${skill.id}`}
      onClick={() => onSelect(skill)}
      className="group relative cursor-pointer bg-[#141416] hover:bg-[#1a1a1f] border border-[#27272a] hover:border-orange-500 transition-all duration-300 p-5 rounded-none flex flex-col justify-between h-[190px] w-full"
    >
      {/* Visual highlight accent line in hover representing neon brutalism */}
      <div className="absolute top-0 left-0 w-0 h-[2px] bg-orange-500 group-hover:w-full transition-all duration-300" />
      
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 shrink-0 flex items-center justify-center rounded bg-[#1e1e24] text-sm border border-slate-800">
              {skill.ownerAvatar}
            </div>
            <div className="text-xs text-slate-500 font-mono truncate">
              {skill.ownerName}
              <span className="text-slate-600 block sm:inline sm:mx-1">/</span>
              <span className="text-slate-100 font-sans font-semibold group-hover:text-orange-400 transition-all">
                {skill.name}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            {skill.rating > 0 && (
              <div className="flex items-center gap-0.5 text-[#facc15] font-mono text-[11px] font-semibold">
                <Star className="w-3.5 h-3.5 fill-[#facc15] stroke-[#facc15]" />
                <span>{skill.rating.toFixed(1)}</span>
                <span className="text-slate-600 text-[10px] font-normal">({skill.reviewCount})</span>
              </div>
            )}
            
            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-[#1b1b1f] border border-[#2c2c35] text-slate-400 rounded-md font-mono text-[10px] leading-tight">
              <GitFork className="w-3 h-3" />
              <span>{(skill.starsCount / 1000).toFixed(1)}k</span>
            </div>
          </div>
        </div>

        {/* Card Body Description */}
        <p className="text-slate-400 text-xs sm:text-[13px] leading-relaxed line-clamp-2 overflow-hidden mt-1 mb-4 font-sans font-light">
          {skill.description}
        </p>
      </div>

      {/* Card Footer tags and scores */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-900">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {skill.tags.slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] shrink-0 font-mono bg-[#1e1e24] text-slate-300 border border-[#2e2e38] px-2 py-0.5 rounded-sm"
            >
              {tag.toLowerCase()}
            </span>
          ))}
          {skill.complianceChecked && (
            <span className="hidden md:flex items-center gap-0.5 text-[9px] text-[#22c55e] font-mono border border-[#22c55e]/20 bg-[#22c55e]/5 px-1.5 py-0.5 rounded-sm shrink-0 uppercase tracking-widest font-black">
              OAB Ok
            </span>
          )}
        </div>

        {/* Dual scores colored based on score value */}
        <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs font-semibold shrink-0">
          <div className={`border px-1.5 py-0.5 rounded-ms flex items-center gap-1 ${getQualityStyle(skill.qualityScore)}`}>
            <Wrench className="w-3 h-3" />
            <span>Q: {skill.qualityScore}</span>
          </div>

          <div className={`border px-1.5 py-0.5 rounded-ms flex items-center gap-1 ${getRegulatoryStyle(skill.regulatoryScore)}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>C: {skill.regulatoryScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
