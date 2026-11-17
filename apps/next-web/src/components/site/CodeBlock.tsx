"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="rounded-lg border border-white/10 bg-neutral-950 text-neutral-200 overflow-hidden text-left">
      <div className="flex items-center justify-between px-4 h-9 border-b border-white/10">
        <span className="text-xs font-mono text-neutral-400">{label}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-100 transition-colors"
          aria-label="Copiar código"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <pre className="p-4 text-[13px] leading-relaxed font-mono overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}
