import React from 'react';
import { SecurityCriterion } from '../../types';
import { SECURITY_CRITERIA } from '../../constants/security';

export default function SecurityTab({ skill }: { skill: { securityCriteria?: SecurityCriterion[] } }) {
  // Use either skill's specific criteria or fallback to global list
  const criteria = skill.securityCriteria?.length ? skill.securityCriteria : SECURITY_CRITERIA;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold tracking-tight text-white mb-2">
        Segurança &amp; Vetores de Risco
      </h3>
      <ul className="space-y-2">
        {criteria.map((c) => (
          <li key={c.id} className="flex items-center justify-between p-2 border border-[#1f1f24] bg-[#0c0c0e] rounded">
            <span className="text-slate-200 font-mono text-xs">{c.description}</span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded ${c.severity === 'high' ? 'bg-red-500/10 border border-red-500/30 text-red-400' : c.severity === 'medium' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'bg-green-500/10 border border-green-500/30 text-green-400'}`}>
              {c.severity.toUpperCase()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
