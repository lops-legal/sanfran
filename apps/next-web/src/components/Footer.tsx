import Link from "next/link";
import { Scale } from "lucide-react";
import { SLACK_URL, GITHUB_URL } from "../lib/site";

const COLUMNS = [
  {
    title: "Produto",
    links: [
      { label: "Skills", href: "/skills" },
      { label: "Conectar ao assistente", href: "/integrate" },
      { label: "Como funciona", href: "/docs" },
    ],
  },
  {
    title: "Comunidade",
    links: [
      { label: "Slack", href: SLACK_URL, external: true },
      { label: "GitHub", href: GITHUB_URL, external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 sm:grid-cols-[1fr_auto_auto] sm:gap-16">
        <div className="space-y-3 max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2">
            <Scale className="w-5 h-5" aria-hidden />
            <span className="font-serif text-lg font-semibold">
              sanfran<span className="text-muted-foreground">.md</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Skills jurídicas para o Direito brasileiro, abertas e verificáveis. Ferramenta de apoio: não substitui a análise de um advogado.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title} className="space-y-3">
            <p className="text-sm font-medium">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  {"external" in l ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <p className="max-w-6xl mx-auto px-4 py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} sanfran.md · Código aberto (MIT)
        </p>
      </div>
    </footer>
  );
}
