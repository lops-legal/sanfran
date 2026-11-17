import { BadgeCheck, CircleDashed, PencilLine } from "lucide-react";
import type { LegalSkill } from "../lib/types";

const MAP = {
  revisada: { label: "Revisada", icon: BadgeCheck, cls: "text-verified border-verified/30" },
  "em-revisao": { label: "Em revisão", icon: CircleDashed, cls: "text-muted-foreground border-border" },
  rascunho: { label: "Rascunho", icon: PencilLine, cls: "text-muted-foreground border-border" },
} as const;

/** Selo de revisão jurídica. Só "Revisada" usa cor — e só quando há revisor identificado. */
export function ReviewBadge({ skill }: { skill: Pick<LegalSkill, "reviewStatus" | "complianceChecked"> }) {
  const status = skill.reviewStatus ?? (skill.complianceChecked ? "revisada" : "em-revisao");
  const { label, icon: Icon, cls } = MAP[status];
  return (
    <span className={`inline-flex items-center gap-1 h-5 px-2 rounded-full border text-[11px] font-medium ${cls}`}>
      <Icon className="w-3 h-3" aria-hidden />
      {label}
    </span>
  );
}

export const SKILL_TYPE_LABEL: Record<string, string> = {
  motor: "Cálculo/validação",
  execucao: "Execução",
  conhecimento: "Consulta",
};
