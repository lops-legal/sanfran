"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Campo de "copiar endereço", pensado para quem não é técnico. */
export function CopyField({ value, label = "Copiar" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-background pl-4 pr-1 h-10">
      <code className="flex-1 min-w-0 truncate font-mono text-[13px]">{value}</code>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shrink-0"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? "Copiado" : label}
      </button>
    </div>
  );
}
