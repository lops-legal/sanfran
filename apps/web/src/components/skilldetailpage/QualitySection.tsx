import React from "react";
import { LegalSkill } from "../../types";
import { Scale, Target, FileCheck2, ShieldCheck, RefreshCw, LucideIcon } from "lucide-react";

interface QualitySectionProps {
  skill: LegalSkill;
}

function RadialScore({ value, color, label }: { value: number; color: string; label: string }) {
  const deg = Math.max(0, Math.min(100, value)) * 3.6;
  return (
    <div className="flex items-center gap-4">
      <div
        className="relative w-16 h-16 rounded-full shrink-0"
        style={{ background: `conic-gradient(${color} ${deg}deg, #1a1a1e 0deg)` }}
      >
        <div className="absolute inset-[3px] rounded-full bg-[#121214] flex items-center justify-center">
          <span className="text-sm font-mono font-bold text-slate-100">{value}</span>
        </div>
      </div>
      <div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">{label}</span>
        <span className="text-xs text-slate-400 font-sans">de 100 pontos</span>
      </div>
    </div>
  );
}

const CRITERIA_META: Array<{
  key: "precisaoNormativa" | "especificidade" | "padraoEntrega" | "limitesAutonomia" | "atualizacao";
  label: string;
  hint: string;
  icon: LucideIcon;
  color: string;
}> = [
    { key: "precisaoNormativa", label: "Precisão Normativa", hint: "Citações CPC / CDC / CLT", icon: Scale, color: "#fb923c" },
    { key: "especificidade", label: "Especificidade Operacional", hint: "Instruções acionáveis", icon: Target, color: "#fb923c" },
    { key: "padraoEntrega", label: "Padrão de Entrega", hint: "Estrutura de saída", icon: FileCheck2, color: "#fb923c" },
    { key: "limitesAutonomia", label: "Limites de Autonomia de IA", hint: "Guardrails explícitos", icon: ShieldCheck, color: "#34d399" },
    { key: "atualizacao", label: "Atualização Normativa", hint: "Súmulas e teses atuais", icon: RefreshCw, color: "#34d399" },
  ];

export default function QualitySection({ skill }: QualitySectionProps) {
  const { qualityScore, regulatoryScore, qualityBreakdown } = skill;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#121214] border border-[#1f1f24] rounded-md p-4">
          <RadialScore value={qualityScore} color="#fb923c" label="Score Técnico" />
        </div>
        <div className="bg-[#121214] border border-[#1f1f24] rounded-md p-4">
          <RadialScore value={regulatoryScore} color="#34d399" label="Conformidade OAB" />
        </div>
      </div>

      <div className="space-y-3">
        {CRITERIA_META.map(({ key, label, hint, icon: Icon, color }) => {
          const value = qualityBreakdown[key];
          return (
            <div
              key={key}
              className="flex items-center gap-3 bg-[#121214] border border-[#1f1f24] rounded-md p-3 hover:border-[#2b2b32] transition-colors"
            >
              <div className="w-8 h-8 rounded-md bg-[#18181c] border border-[#27272a] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="text-xs font-semibold text-slate-200 font-sans truncate">{label}</span>
                  <span className="text-xs font-mono font-bold text-slate-100 shrink-0">{value}/10</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono block mb-1.5">{hint}</span>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${value * 10}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
