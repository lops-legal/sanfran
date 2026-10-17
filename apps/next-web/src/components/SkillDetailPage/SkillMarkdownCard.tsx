import React, { useMemo, useState } from "react";
import { Copy, Check, Download, FileCode2 } from "lucide-react";
import { LegalSkill } from "../../lib/types";
import { parseSkillMarkdown } from "./markdownRenderer";

interface SkillMarkdownCardProps {
  skill: LegalSkill;
  loading?: boolean;
}

export default function SkillMarkdownCard({ skill, loading }: SkillMarkdownCardProps) {
  const [copied, setCopied] = useState(false);
  const content = skill.markdownContent || "";

  const { bodyNodes } = useMemo(() => parseSkillMarkdown(content), [content]);
  const lineCount = content ? content.split("\n").length : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-border bg-card rounded-lg overflow-hidden">
      {/* Terminal chrome header */}
      <div className="flex items-center justify-between gap-3 px-4 h-11 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <FileCode2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs font-mono font-medium truncate">SKILL.md</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline text-[10px] font-mono text-muted-foreground">{lineCount} linhas</span>
          <button
            onClick={handleCopy}
            className="cursor-pointer text-[11px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1.5 hover:bg-subtle px-2.5 h-7 border border-border rounded-full transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-verified" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copiado" : "Copiar"}</span>
          </button>
          <a
            href={`data:text/markdown;charset=utf-8,${encodeURIComponent(content)}`}
            download="SKILL.md"
            className="cursor-pointer text-[11px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1.5 hover:bg-subtle px-2.5 h-7 border border-border rounded-full transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Baixar</span>
          </a>
        </div>
      </div>


      {/* Rendered markdown body */}
      <div className="p-6 md:p-8">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-subtle rounded w-1/3" />
            <div className="h-3 bg-subtle rounded w-full" />
            <div className="h-3 bg-subtle rounded w-5/6" />
            <div className="h-3 bg-subtle rounded w-2/3" />
          </div>
        ) : bodyNodes.length ? (
          bodyNodes
        ) : (
          <p className="text-xs text-muted-foreground font-mono">Sem conteúdo disponível.</p>
        )}
      </div>
    </div>
  );
}
