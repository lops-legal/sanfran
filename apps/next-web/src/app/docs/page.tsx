import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Wrench, ArrowLeft, FileText, Terminal, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Documentação | sanfran.md",
  description: "A documentação completa do sanfran.md está sendo elaborada. Em breve você terá acesso a guias, referências de API e tutoriais.",
};

export default function DocsPage() {
  const sections = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Guias de Uso",
      description: "Como criar, publicar e usar skills jurídicas com agentes de IA.",
    },
    {
      icon: <Terminal className="w-5 h-5" />,
      title: "Referência da API",
      description: "Endpoints REST para busca, filtragem e gerenciamento de skills.",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Critérios de Segurança",
      description: "Como avaliamos skills com base no OWASP Agentic Top 10.",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Formato Markdown",
      description: "Especificação do formato .md utilizado para descrever skills jurídicas.",
    },
  ];

  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-20">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Icon */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-semibold uppercase tracking-widest mb-6">
          <Wrench className="w-3 h-3" />
          Em Desenvolvimento
        </span>

        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 leading-tight">
          Documentação
        </h1>

        <p className="text-lg text-muted leading-relaxed mb-10">
          Estamos elaborando a documentação completa do sanfran.md — desde guias para criação de skills até a referência técnica da nossa API.
        </p>

        {/* Planned sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12 text-left">
          {sections.map((section) => (
            <div
              key={section.title}
              className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/50"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                {section.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">{section.title}</p>
                <p className="text-xs text-muted leading-relaxed">{section.description}</p>
              </div>
            </div>
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
