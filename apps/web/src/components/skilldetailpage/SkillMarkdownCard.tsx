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
    <div className="border border-border bg-[#2A2118] rounded-xl overflow-hidden shadow-lg shadow-primary/5">
      {/* Terminal chrome header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#231C12] border-b border-[#3D3226]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex items-center gap-1.5 pl-3 border-l border-[#3D3226] min-w-0">
            <FileCode2 className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="text-xs font-mono text-[#E8DDD0] font-semibold truncate">SKILL.md</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline text-[10px] font-mono text-[#8B7D6B]">{lineCount} linhas</span>
          <button
            onClick={handleCopy}
            className="cursor-pointer text-[11px] font-mono text-[#C4B5A0] hover:text-accent flex items-center gap-1.5 bg-[#1E180F] hover:bg-[#2D2519] px-2.5 py-1.5 border border-[#3D3226] rounded-lg transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copiado" : "Copiar"}</span>
          </button>
          <a
            href={`data:text/markdown;charset=utf-8,${encodeURIComponent(content)}`}
            download="SKILL.md"
            className="cursor-pointer text-[11px] font-mono text-[#C4B5A0] hover:text-accent flex items-center gap-1.5 bg-[#1E180F] hover:bg-[#2D2519] px-2.5 py-1.5 border border-[#3D3226] rounded-lg transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Baixar</span>
          </a>
        </div>
      </div>

      {/* Frontmatter meta strip */}
      {hasMeta && (
        <div className="px-5 py-4 bg-gradient-to-b from-[#C9A84C]/[0.06] to-transparent border-b border-[#3D3226]">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {frontmatter.name && (
              <span className="font-mono text-[11px] text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded">
                {frontmatter.name}
              </span>
            )}
            {frontmatter.language && (
              <span className="font-mono text-[11px] text-[#8B7D6B] bg-[#1E180F] border border-[#3D3226] px-2 py-0.5 rounded uppercase">
                {frontmatter.language}
              </span>
            )}
          </div>
          {frontmatter.description && (
            <p className="text-xs text-[#A89880] leading-relaxed italic">{frontmatter.description}</p>
          )}
        </div>
      )}

      {/* Rendered markdown body */}
      <div className="p-5 max-h-[640px] overflow-y-auto">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-[#3D3226] rounded w-1/3" />
            <div className="h-3 bg-[#3D3226] rounded w-full" />
            <div className="h-3 bg-[#3D3226] rounded w-5/6" />
            <div className="h-3 bg-[#3D3226] rounded w-2/3" />
          </div>
        ) : bodyNodes.length ? (
          bodyNodes
        ) : (
          <p className="text-xs text-[#8B7D6B] font-mono">Sem conteúdo disponível.</p>
        )}
      </div>
    </div>
  );
}
