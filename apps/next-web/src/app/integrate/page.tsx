import type { Metadata } from "next";
import Link from "next/link";
import { Scale, Wrench, ArrowLeft, Zap, Code2, Plug } from "lucide-react";

export const metadata: Metadata = {
  title: "Integração MCP | sanfran.md",
  description: "A integração via Model Context Protocol (MCP) está em desenvolvimento. Em breve você poderá conectar seus agentes de IA ao catálogo jurídico do sanfran.md.",
};

export default function IntegratePage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-20">
      {/* Background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Icon cluster */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20">
            <Plug className="w-7 h-7 text-primary" />
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Code2 className="w-5 h-5 text-blue-500" />
          </div>
        </div>

        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-semibold uppercase tracking-widest mb-6">
          <Wrench className="w-3 h-3" />
          Em Desenvolvimento
        </span>

        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 leading-tight">
          Integração MCP
        </h1>

        <p className="text-lg text-muted leading-relaxed mb-4">
          Estamos construindo a integração via{" "}
          <strong className="text-foreground">Model Context Protocol (MCP)</strong>{" "}
          para que você possa conectar seus agentes de IA diretamente ao catálogo jurídico do sanfran.md.
        </p>

        <p className="text-base text-muted leading-relaxed mb-10">
          Em breve será possível adicionar skills diretamente ao Claude, ChatGPT, Cursor e outros clientes MCP com um clique.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {["Claude", "Cursor", "Continue.dev", "OpenAI Agents", "Langchain"].map((tool) => (
            <span
              key={tool}
              className="px-3 py-1.5 rounded-full bg-card border border-border text-sm text-muted"
            >
              {tool}
            </span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o início
          </Link>
          <a
            href="https://sanfranmd.slack.com/join/shared_invite/zt-44ys5kr75-li43f~B2o4TGQLsDwqc0rQ#/shared-invite/email"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted/10 transition-colors"
          >
            Acompanhar no Slack
          </a>
        </div>
      </div>
    </main>
  );
}
