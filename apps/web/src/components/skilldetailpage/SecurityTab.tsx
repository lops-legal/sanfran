import React from 'react';
import { SecurityCriterion } from '../../types';
import { SECURITY_CRITERIA } from '../../constants/security';

interface SecurityTabProps {
  skill: {
    securityCriteria?: SecurityCriterion[];
  };
}

export default function SecurityTab({ skill }: SecurityTabProps) {
  const criteria = skill.securityCriteria?.length ? skill.securityCriteria : SECURITY_CRITERIA;

  return (
    <div className="space-y-4 py-2">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
        Segurança &amp; Vetores de Risco
      </h3>
      <div className="bg-[#121214] p-4 border border-[#1f1f24] rounded-sm space-y-2 max-h-[300px] overflow-y-auto font-sans">
        {criteria.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-2.5 border border-[#1f1f24] bg-[#0c0c0e] hover:border-[#2b2b32] transition-colors rounded-sm">
            <span className="text-slate-300 font-mono text-xs">{c.description}</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm border ${
              c.severity === 'high' 
                ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                : c.severity === 'medium' 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                  : 'bg-green-500/10 border-green-500/30 text-green-400'
            }`}>
              {c.severity.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
