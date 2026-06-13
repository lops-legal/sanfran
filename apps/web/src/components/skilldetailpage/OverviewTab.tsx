import React from 'react';
import { LegalSkill } from '../../types';

interface OverviewTabProps {
  skill: LegalSkill;
}

export default function OverviewTab({ skill }: OverviewTabProps) {
  return (
    <div className="space-y-4 py-2">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Visão Geral</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#121214] p-4 border border-[#1f1f24] rounded-sm">
        <div>
          <span className="text-xs font-mono text-slate-500 block uppercase">Organização</span>
          <p className="text-slate-200 text-sm mt-0.5">{skill.authorOrganization || "Lex AI Labs"}</p>
        </div>
        <div>
          <span className="text-xs font-mono text-slate-500 block uppercase">Autor</span>
          <a 
            href={skill.authorProfile || "#"} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-orange-400 hover:text-orange-350 hover:underline text-sm inline-block mt-0.5"
          >
            @{skill.ownerName}
          </a>
        </div>
        <div className="col-span-2">
          <span className="text-xs font-mono text-slate-500 block uppercase">Objetivo</span>
          <p className="text-slate-200 text-sm mt-0.5 leading-relaxed">{skill.objective || skill.description}</p>
        </div>
        <div className="col-span-2">
          <span className="text-xs font-mono text-slate-500 block uppercase">Caso de uso</span>
          <p className="text-slate-200 text-sm mt-0.5 leading-relaxed">{skill.useCase || "Auditar conformidade jurídica e alertar desvios regulatórios."}</p>
        </div>
        <div>
          <span className="text-xs font-mono text-slate-500 block uppercase">Área do Direito</span>
          <p className="text-slate-200 text-sm mt-0.5">{skill.legalArea || skill.vertical}</p>
        </div>
        <div>
          <span className="text-xs font-mono text-slate-500 block uppercase">Fluxo de trabalho</span>
          <p className="text-slate-200 text-sm mt-0.5">{skill.workflow || "Revisão e triagem de documentos regulatórios."}</p>
        </div>
        <div>
          <span className="text-xs font-mono text-slate-500 block uppercase">Profissional Alvo</span>
          <p className="text-slate-200 text-sm mt-0.5">{skill.professionalRole || "Advogados, Juristas e Analistas de Compliance"}</p>
        </div>
      </div>
    </div>
  );
}
