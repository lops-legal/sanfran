import React from "react";
import { Bot, TerminalSquare, Sparkles, LucideIcon } from "lucide-react";

interface Platform {
  key: string;
  label: string;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  icon: LucideIcon;
  text: string;
}

const PLATFORMS: Platform[] = [
  {
    key: "claude",
    label: "Claude Projects / System Prompt",
    iconBg: "bg-primary/8",
    iconColor: "text-primary",
    borderColor: "border-primary/15",
    icon: Bot,
    text: "Crie um novo projeto no Claude AI e, em Project Instructions, cole o conteúdo do SKILL.md. O modelo respeitará os níveis limitantes indicados.",
  },
  {
    key: "cursor",
    label: "Cursor Editor (.cursorrules)",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
    icon: TerminalSquare,
    text: "Crie um arquivo .cursorrules na raiz do seu workspace e cole as instruções correspondentes. A IA passa a atuar como revisora em tempo real do texto factual.",
  },
  {
    key: "chatgpt",
    label: "OpenAI Custom GPT / Workspaces",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-200",
    icon: Sparkles,
    text: "No modo Configure do seu Custom GPT, adicione as instruções nas referências ou faça upload deste arquivo como documento de conhecimento para grounding forçado.",
  },
];

export default function IntegrationSection() {
  return (
    <div className="grid grid-cols-1 gap-3">
      {PLATFORMS.map(({ key, label, iconBg, iconColor, borderColor, icon: Icon, text }) => (
        <div key={key} className={`flex gap-3.5 p-4 bg-white border ${borderColor} rounded-xl hover:shadow-sm transition-all group`}>
          <div className={`w-10 h-10 rounded-lg ${iconBg} border ${borderColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
            <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
          </div>
          <div className="min-w-0">
            <span className={`font-mono text-[11px] uppercase font-bold block mb-1 ${iconColor}`}>{label}</span>
            <p className="text-xs text-muted leading-relaxed">{text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
