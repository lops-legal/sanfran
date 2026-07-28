import React from "react";
import { LegalSkill } from "../../types";
import { Scale, Target, FileCheck2, ShieldCheck, RefreshCw, LucideIcon } from "lucide-react";

interface QualitySectionProps {
  skill: LegalSkill;
}

function RadialScore({ value, color, label }: { value: number; color: string; label: string }) {
  const circumference = 2 * Math.PI * 16; // r=16
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-14 h-14 shrink-0">
        <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
          <circle cx="18" cy="18" r="16" fill="none" stroke="var(--cafe-border)" strokeWidth="2.5" />
          <circle
            cx="18" cy="18" r="16" fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-mono font-bold text-foreground">{value}</span>
        </div>
      </div>
      <div>
        <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">{label}</span>
        <span className="text-xs text-muted">de 100 pontos</span>
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
    { key: "precisaoNormativa", label: "Precisão Normativa", hint: "Citações CPC / CDC / CLT", icon: Scale, color: "var(--cafe-primary)" },
    { key: "especificidade", label: "Especificidade Operacional", hint: "Instruções acionáveis", icon: Target, color: "var(--cafe-primary)" },
    { key: "padraoEntrega", label: "Padrão de Entrega", hint: "Estrutura de saída", icon: FileCheck2, color: "var(--cafe-accent)" },
    { key: "limitesAutonomia", label: "Limites de Autonomia de IA", hint: "Guardrails explícitos", icon: ShieldCheck, color: "var(--cafe-success)" },
    { key: "atualizacao", label: "Atualização Normativa", hint: "Súmulas e teses atuais", icon: RefreshCw, color: "var(--cafe-success)" },
  ];

export default function QualitySection({ skill }: QualitySectionProps) {
  const { qualityScore, regulatoryScore, qualityBreakdown } = skill;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
          <RadialScore value={qualityScore} color="var(--cafe-primary)" label="Score Técnico" />
        </div>
        <div className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
          <RadialScore value={regulatoryScore} color="var(--cafe-success)" label="Conformidade OAB" />
        </div>
      </div>

      <div className="space-y-2.5">
        {CRITERIA_META.map(({ key, label, hint, icon: Icon, color }) => {
          const value = qualityBreakdown[key];
          return (
            <div
              key={key}
              className="flex items-center gap-3 bg-white border border-border rounded-xl p-3.5 hover:shadow-sm transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="text-xs font-semibold text-foreground truncate">{label}</span>
                  <span className="text-xs font-mono font-bold text-foreground shrink-0">{value}/10</span>
                </div>
                <span className="text-[10px] text-muted font-mono block mb-1.5">{hint}</span>
                <div className="w-full bg-card h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-1.5 rounded-full quality-bar-animated"
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
