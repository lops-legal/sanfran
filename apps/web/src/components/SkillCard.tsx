import React from "react";
import { LegalSkill } from "../types";
import { Star, GitFork, Wrench, ShieldCheck, ArrowUpRight } from "lucide-react";

interface SkillCardProps {
  skill: LegalSkill;
  onSelect: (skill: LegalSkill) => void;
  key?: string | number;
}

export default function SkillCard({ skill, onSelect }: SkillCardProps) {
  // Score 1 color styling (Quality)
  const getQualityStyle = (score: number) => {
    if (score >= 90) {
      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
    }
    if (score >= 75) {
      return "bg-amber-500/10 border-amber-500/20 text-amber-400";
    }
    return "bg-red-500/10 border-red-500/20 text-red-400";
  };

  // Score 2 color styling (Regulatory Compliance)
  const getRegulatoryStyle = (score: number) => {
    if (score >= 90) {
      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
    }
    if (score >= 75) {
      return "bg-amber-500/10 border-amber-500/20 text-amber-400";
    }
    return "bg-red-500/10 border-red-500/20 text-red-400";
  };

  return (
    <div
      id={`skill-card-${skill.id}`}
      onClick={() => onSelect(skill)}
      className="group cursor-pointer p-1.5 rounded-[2rem] bg-[#0c0c0e]/80 border border-white/5 hover:border-orange-500/30 transition-all duration-500 ease-spring hover:scale-[1.015] active:scale-[0.985] flex flex-col justify-between h-[210px] w-full shadow-2xl"
    >
      {/* Inner Container: Glass incrusted into metal look */}
      <div className="bg-[#050507] border border-white/5 p-4.5 rounded-[1.7rem] h-full flex flex-col justify-between transition-all duration-500 group-hover:bg-[#08080c]">
        
        <div>
          {/* Card Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 shrink-0 flex items-center justify-center rounded-lg bg-orange-500/10 text-xs border border-orange-500/20">
                {skill.ownerAvatar}
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate">
                {skill.ownerName}
                <span className="text-slate-600 mx-1">/</span>
                <span className="text-slate-100 font-sans font-bold group-hover:text-orange-400 transition-all duration-300">
                  {skill.name}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {skill.rating > 0 && (
                <div className="flex items-center gap-0.5 text-[#facc15] font-mono text-[10px] font-semibold">
                  <Star className="w-3 h-3 fill-[#facc15] stroke-[#facc15]" />
                  <span>{skill.rating.toFixed(1)}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white/5 border border-white/10 text-slate-400 rounded-md font-mono text-[9px] leading-tight">
                <GitFork className="w-2.5 h-2.5" />
                <span>{(skill.starsCount / 1000).toFixed(1)}k</span>
              </div>
            </div>
          </div>

          {/* Card Body Description */}
          <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 overflow-hidden mt-2 mb-3 font-sans font-light group-hover:text-slate-300 transition-colors duration-300">
            {skill.description}
          </p>
        </div>

        {/* Card Footer tags and scores */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5 overflow-hidden">
            {skill.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="text-[9px] shrink-0 font-mono bg-white/5 text-slate-400 border border-white/5 px-2 py-0.5 rounded-full"
              >
                {tag.toLowerCase()}
              </span>
            ))}
            {skill.complianceChecked && (
              <span className="hidden md:flex items-center gap-0.5 text-[8px] text-emerald-400 font-mono border border-emerald-500/10 bg-emerald-500/5 px-1.5 py-0.5 rounded-full shrink-0 uppercase tracking-widest font-black">
                OAB Ok
              </span>
            )}
          </div>

          {/* Dual scores colored based on score value */}
          <div className="flex items-center gap-1.5 font-mono text-[9px] sm:text-[10px] font-semibold shrink-0">
            <div className={`border px-2 py-0.5 rounded-full flex items-center gap-1 ${getQualityStyle(skill.qualityScore)}`}>
              <Wrench className="w-2.5 h-2.5" />
              <span>Q: {skill.qualityScore}</span>
            </div>

            <div className={`border px-2 py-0.5 rounded-full flex items-center gap-1 ${getRegulatoryStyle(skill.regulatoryScore)}`}>
              <ShieldCheck className="w-2.5 h-2.5" />
              <span>C: {skill.regulatoryScore}</span>
            </div>
            
            {/* Haptic hover indicator arrow */}
            <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0 border border-white/10 shrink-0">
              <ArrowUpRight className="w-3 h-3 text-orange-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

