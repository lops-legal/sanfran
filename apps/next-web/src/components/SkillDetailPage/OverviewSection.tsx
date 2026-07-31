import React from "react";
import { LegalSkill } from "../../lib/types";
import { Building2, UserRound, Target, Briefcase, Scale, Workflow, Users, LucideIcon } from "lucide-react";

interface OverviewSectionProps {
  skill: LegalSkill;
}

function Field({
  icon: Icon,
  label,
  children,
  full,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`flex gap-3 ${full ? "sm:col-span-2" : ""}`}>
      <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0">
        <span className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-0.5">{label}</span>
        <div className="text-sm text-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export default function OverviewSection({ skill }: OverviewSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field icon={Building2} label="Organização">
        {skill.authorOrganization || "Organização"}
      </Field>
      <Field icon={UserRound} label="Autor">
        <a
          href={skill.authorProfile || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-accent hover:underline transition-colors"
        >
          @{skill.ownerName}
        </a>
      </Field>
      <Field icon={Target} label="Objetivo" full>
        {skill.objective || skill.description}
      </Field>
      <Field icon={Briefcase} label="Caso de uso" full>
        {skill.useCase || "Auditar conformidade jurídica e alertar desvios regulatórios."}
      </Field>
      <Field icon={Scale} label="Área do Direito">
        {skill.legalArea || skill.vertical}
      </Field>
      <Field icon={Workflow} label="Fluxo de trabalho">
        {skill.workflow || "Revisão e triagem de documentos regulatórios."}
      </Field>
      <Field icon={Users} label="Profissional Alvo" full>
        {skill.professionalRole || "Advogados, Juristas e Analistas de Compliance"}
      </Field>
    </div>
  );
}
