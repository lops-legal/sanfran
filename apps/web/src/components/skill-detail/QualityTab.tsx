import React from 'react';
import { LegalSkill } from '../../types';

export default function QualityTab({ skill }: { skill: LegalSkill }) {
  const { qualityScore, regulatoryScore, qualityBreakdown } = skill;
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold tracking-tight text-white mb-2">Qualidade</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#121214] p-4 border border-[#1f1f24] rounded">
          <span className="text-slate-500 text-[10px] font-mono block uppercase mb-1">Score Técnico</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-orange-400">{qualityScore}</span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
          <div className="w-full bg-slate-900 h-1 mt-2">
            <div className="bg-orange-500 h-1 transition-all" style={{ width: `${qualityScore}%` }} />
          </div>
        </div>
        <div className="bg-[#121214] p-4 border border-[#1f1f24] rounded">
          <span className="text-slate-500 text-[10px] font-mono block uppercase mb-1">Score de Conformidade</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-emerald-400">{regulatoryScore}</span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
          <div className="w-full bg-slate-900 h-1 mt-2">
            <div className="bg-emerald-500 h-1 transition-all" style={{ width: `${regulatoryScore}%` }} />
          </div>
        </div>
      </div>
      {/* Breakdown */}
      <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-1">Detalhamento da Matriz de Qualidade</h4>
      <ul className="space-y-2">
        {Object.entries(qualityBreakdown).map(([key, value]) => (
          <li key={key} className="flex justify-between items-center text-slate-200 text-sm">
            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-400">{value}/10</span>
              <div className="w-24 bg-[#1b1b1f] h-1.5 rounded">
                <div className="bg-orange-500 h-1.5" style={{ width: `${value * 10}%` }} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
