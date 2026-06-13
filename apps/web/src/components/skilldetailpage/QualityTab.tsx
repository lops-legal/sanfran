import React from 'react';
import { LegalSkill } from '../../types';

interface QualityTabProps {
  skill: LegalSkill;
}

export default function QualityTab({ skill }: QualityTabProps) {
  const { qualityScore, regulatoryScore, qualityBreakdown } = skill;
  return (
    <div className="space-y-4 py-2">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Qualidade</h3>
      
      {/* Score cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#121214] p-4 border border-[#1f1f24] rounded-sm">
          <span className="text-[#a0a0ab] text-[10px] font-mono block uppercase tracking-wider mb-1">Score Técnico</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-mono font-bold text-orange-400">{qualityScore}</span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
          <div className="w-full bg-slate-900 h-1 mt-2">
            <div className="bg-orange-500 h-1 transition-all" style={{ width: `${qualityScore}%` }} />
          </div>
        </div>
        <div className="bg-[#121214] p-4 border border-[#1f1f24] rounded-sm">
          <span className="text-[#a0a0ab] text-[10px] font-mono block uppercase tracking-wider mb-1">Conformidade OAB</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-mono font-bold text-emerald-400">{regulatoryScore}</span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
          <div className="w-full bg-slate-900 h-1 mt-2">
            <div className="bg-emerald-500 h-1 transition-all" style={{ width: `${regulatoryScore}%` }} />
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="border border-[#1f1f24] bg-[#121214] p-4 rounded-sm">
        <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1.5 font-bold mb-3">
          Detalhamento da Matriz de Rigor
        </h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
              <span>• Precisão Normativa (Citações CPC/CDC/CLT)</span>
              <span className="font-semibold text-slate-100">{qualityBreakdown.precisaoNormativa}/10</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5">
              <div className="bg-orange-500 h-1.5" style={{ width: `${qualityBreakdown.precisaoNormativa * 10}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
              <span>• Especificidade Operacional</span>
              <span className="font-semibold text-slate-100">{qualityBreakdown.especificidade}/10</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5">
              <div className="bg-orange-500 h-1.5" style={{ width: `${qualityBreakdown.especificidade * 10}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
              <span>• Padrão de Entrega Estruturado</span>
              <span className="font-semibold text-slate-100">{qualityBreakdown.padraoEntrega}/10</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5">
              <div className="bg-orange-500 h-1.5" style={{ width: `${qualityBreakdown.padraoEntrega * 10}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
              <span>• Limites Claros de Autonomia de IA</span>
              <span className="font-semibold text-slate-100">{qualityBreakdown.limitesAutonomia}/10</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5">
              <div className="bg-emerald-500 h-1.5" style={{ width: `${qualityBreakdown.limitesAutonomia * 10}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
              <span>• Histórico de Atualização (Súmulas Atuais)</span>
              <span className="font-semibold text-slate-100">{qualityBreakdown.atualizacao}/10</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5">
              <div className="bg-emerald-500 h-1.5" style={{ width: `${qualityBreakdown.atualizacao * 10}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
