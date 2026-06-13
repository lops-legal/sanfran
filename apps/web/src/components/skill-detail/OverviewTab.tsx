import React from 'react';
import { LegalSkill } from '../../types';

export default function OverviewTab({ skill }: { skill: LegalSkill }) {
  return (
    <div className="p-5 space-y-4">
      <h3 className="text-lg font-semibold text-white">Visão geral</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span className="text-sm font-mono text-slate-400">Organização</span>
          <p className="text-slate-200">{skill.authorOrganization}</p>
        </div>
        <div>
          <span className="text-sm font-mono text-slate-400">Autor</span>
          <a href={skill.authorProfile} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
            @{skill.ownerName}
          </a>
        </div>
        <div className="col-span-2">
          <span className="text-sm font-mono text-slate-400">Objetivo</span>
          <p className="text-slate-200">{skill.objective}</p>
        </div>
        <div className="col-span-2">
          <span className="text-sm font-mono text-slate-400">Caso de uso</span>
          <p className="text-slate-200">{skill.useCase}</p>
        </div>
        <div>
          <span className="text-sm font-mono text-slate-400">Área do Direito</span>
          <p className="text-slate-200">{skill.legalArea}</p>
        </div>
        <div>
          <span className="text-sm font-mono text-slate-400">Fluxo de trabalho</span>
          <p className="text-slate-200">{skill.workflow}</p>
        </div>
        <div>
          <span className="text-sm font-mono text-slate-400">Profissional</span>
          <p className="text-slate-200">{skill.professionalRole}</p>
        </div>
      </div>
    </div>
  );
}
