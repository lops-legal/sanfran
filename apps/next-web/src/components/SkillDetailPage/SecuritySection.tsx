import React from "react";
import { SecurityCriterion } from "../../lib/types";
import { SECURITY_CRITERIA } from "../../constants/security";
import { ShieldAlert, ShieldQuestion, ShieldCheck, LucideIcon } from "lucide-react";

interface SecuritySectionProps {
  skill: {
    securityCriteria?: SecurityCriterion[];
  };
}

type Severity = "high" | "medium" | "low";

const SEVERITY_ORDER: Severity[] = ["high", "medium", "low"];

const SEVERITY_META: Record<
  Severity,
  { label: string; textColor: string; bg: string; border: string; barColor: string; icon: LucideIcon }
> = {
  high: { label: "Alto Risco", textColor: "text-red-700", bg: "bg-red-50", border: "border-red-200", barColor: "bg-red-400", icon: ShieldAlert },
  medium: {
    label: "Risco Médio",
    textColor: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    barColor: "bg-amber-400",
    icon: ShieldQuestion,
  },
  low: {
    label: "Baixo Risco",
    textColor: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    barColor: "bg-emerald-400",
    icon: ShieldCheck,
  },
};

export default function SecuritySection({ skill }: SecuritySectionProps) {
  const criteria = skill.securityCriteria?.length ? skill.securityCriteria : SECURITY_CRITERIA;

  const groups: Record<Severity, SecurityCriterion[]> = { high: [], medium: [], low: [] };
  criteria.forEach((c) => {
    const sev = (c.severity as Severity) in groups ? (c.severity as Severity) : "low";
    groups[sev].push(c);
  });

  return (
    <div className="space-y-5">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {SEVERITY_ORDER.map((sev) => {
          const count = groups[sev].length;
          if (!count) return null;
          const meta = SEVERITY_META[sev];
          const Icon = meta.icon;
          return (
            <span
              key={sev}
              className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-3 py-1.5 rounded-full border ${meta.bg} ${meta.border} ${meta.textColor}`}
            >
              <Icon className="w-3 h-3" />
              {count} {meta.label}
            </span>
          );
        })}
      </div>

      {/* Grouped list */}
      <div className="space-y-5">
        {SEVERITY_ORDER.map((sev) => {
          const items = groups[sev];
          if (!items.length) return null;
          const meta = SEVERITY_META[sev];
          return (
            <div key={sev}>
              <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${meta.textColor} block mb-2.5`}>
                {meta.label}
              </span>
              <div className="space-y-2">
                {items.map((c) => (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between gap-3 p-3.5 border rounded-xl bg-white hover:shadow-sm transition-all border-l-[3px] ${meta.border}`}
                    style={{ borderLeftColor: meta.barColor.includes("red") ? "#f87171" : meta.barColor.includes("amber") ? "#fbbf24" : "#34d399" }}
                  >
                    <span className="text-foreground text-xs leading-relaxed">{c.description}</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${meta.bg} ${meta.border} ${meta.textColor}`}
                    >
                      {c.severity.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
