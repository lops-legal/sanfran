import React, { useMemo, useState } from "react";
import { Copy, Check, Download, FileCode2 } from "lucide-react";
import { LegalSkill } from "../../types";
import { parseSkillMarkdown } from "./markdownRenderer";

interface SkillMarkdownCardProps {
  skill: LegalSkill;
  loading?: boolean;
}

export default function SkillMarkdownCard({ skill, loading }: SkillMarkdownCardProps) {
  const [copied, setCopied] = useState(false);
  const content = skill.markdownContent || "";

  const { frontmatter, bodyNodes } = useMemo(() => parseSkillMarkdown(content), [content]);
  const lineCount = content ? content.split("\n").length : 0;
  const hasMeta = Boolean(frontmatter.name || frontmatter.language || frontmatter.description);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-[#242429] bg-[#0a0a0c] rounded-md overflow-hidden shadow-[0_0_0_1px_rgba(249,115,22,0.05),0_24px_70px_-30px_rgba(0,0,0,0.85)]">
      {/* Terminal chrome header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#111114] border-b border-[#242429]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex items-center gap-1.5 pl-3 border-l border-[#242429] min-w-0">
            <FileCode2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="text-xs font-mono text-slate-200 font-semibold truncate">SKILL.md</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline text-[10px] font-mono text-slate-600">{lineCount} linhas</span>
          <button
            onClick={handleCopy}
            className="cursor-pointer text-[11px] font-mono text-slate-300 hover:text-accent flex items-center gap-1.5 bg-[#18181c] hover:bg-[#1e1e23] px-2.5 py-1.5 border border-[#27272a] rounded transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copiado" : "Copiar"}</span>
          </button>
          <a
            href={`data:text/markdown;charset=utf-8,${encodeURIComponent(content)}`}
            download="SKILL.md"
            className="cursor-pointer text-[11px] font-mono text-slate-300 hover:text-accent flex items-center gap-1.5 bg-[#18181c] hover:bg-[#1e1e23] px-2.5 py-1.5 border border-[#27272a] rounded transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Baixar</span>
          </a>
        </div>
      </div>

      {/* Frontmatter meta strip */}
      {hasMeta && (
        <div className="px-5 py-4 bg-gradient-to-b from-orange-500/[0.05] to-transparent border-b border-[#1f1f24]">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {frontmatter.name && (
              <span className="font-mono text-[11px] text-orange-400 bg-orange-500/10 border border-orange-500/25 px-2 py-0.5 rounded">
                {frontmatter.name}
              </span>
            )}
            {frontmatter.language && (
              <span className="font-mono text-[11px] text-slate-400 bg-[#141417] border border-[#27272a] px-2 py-0.5 rounded uppercase">
                {frontmatter.language}
              </span>
            )}
          </div>
          {frontmatter.description && (
            <p className="text-xs text-slate-400 leading-relaxed font-sans italic">{frontmatter.description}</p>
          )}
        </div>
      )}

      {/* Rendered markdown body */}
      <div className="p-5 max-h-[640px] overflow-y-auto">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-[#1a1a1e] rounded w-1/3" />
            <div className="h-3 bg-[#1a1a1e] rounded w-full" />
            <div className="h-3 bg-[#1a1a1e] rounded w-5/6" />
            <div className="h-3 bg-[#1a1a1e] rounded w-2/3" />
          </div>
        ) : bodyNodes.length ? (
          bodyNodes
        ) : (
          <p className="text-xs text-slate-500 font-mono">Sem conteúdo disponível.</p>
        )}
      </div>
    </div>
  );
}
