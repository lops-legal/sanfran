import React from "react";
import { Bot, TerminalSquare, Sparkles, LucideIcon } from "lucide-react";

interface Platform {
  key: string;
  label: string;
  color: string;
  border: string;
  icon: LucideIcon;
  text: string;
}

const PLATFORMS: Platform[] = [
  {
    key: "claude",
    label: "Claude Projects / System Prompt",
    color: "text-orange-400",
    border: "border-orange-500/20",
    icon: Bot,
    text: "Crie um novo projeto no Claude AI e, em Project Instructions, cole o conteúdo do SKILL.md. O modelo respeitará os níveis limitantes indicados.",
  },
  {
    key: "cursor",
    label: "Cursor Editor (.cursorrules)",
    color: "text-sky-400",
    border: "border-sky-500/20",
    icon: TerminalSquare,
    text: "Crie um arquivo .cursorrules na raiz do seu workspace e cole as instruções correspondentes. A IA passa a atuar como revisora em tempo real do texto factual.",
  },
  {
    key: "chatgpt",
    label: "OpenAI Custom GPT / Workspaces",
    color: "text-emerald-400",
    border: "border-emerald-500/20",
    icon: Sparkles,
    text: "No modo Configure do seu Custom GPT, adicione as instruções nas referências ou faça upload deste arquivo como documento de conhecimento para grounding forçado.",
  },
];

export default function IntegrationSection() {
  return (
    <div className="grid grid-cols-1 gap-3">
      {PLATFORMS.map(({ key, label, color, border, icon: Icon, text }) => (
        <div key={key} className={`flex gap-3 p-4 bg-[#121214] border ${border} rounded-md`}>
          <div className="w-9 h-9 rounded-md bg-[#18181c] border border-[#27272a] flex items-center justify-center shrink-0">
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div className="min-w-0">
            <span className={`font-mono text-[11px] uppercase font-bold block mb-1 ${color}`}>{label}</span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
