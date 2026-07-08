import React from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useCatalogStats } from "../hooks/useCatalogStats";

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState("");
  const { stats, isLoading: statsLoading } = useCatalogStats();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      navigate(`/skills?q=${encodeURIComponent(query)}`);
    } else {
      navigate("/skills");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section — Task 20: traduzido para português; Task 21: py-12 md:py-24 (menos padding em mobile) */}
      <section className="relative py-12 md:py-24 overflow-hidden">
        {/* Task 22: gradiente mais visível */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-background pointer-events-none" />
        <div className="container max-w-7xl mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-sm text-accent">
              <span className="font-semibold text-xs uppercase tracking-wider">
                {statsLoading ? "Carregando skills…" : `${stats.totalPublished}+ skills jurídicas disponíveis`}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground font-serif leading-tight">
              Skills jurídicas para seus agentes de IA.
            </h1>
            
            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto font-light">
              Encontre e use skills jurídicas em segundos. Pesquise templates prontos para contratos, litígios, pesquisa e muito mais.
            </p>
            
            <div className="w-full max-w-2xl mx-auto space-y-3 mt-8">
              <p className="text-sm font-medium text-foreground text-left">Qual tarefa jurídica você precisa resolver?</p>
              <form onSubmit={handleSearch} className="relative flex items-center group">
                <Search className="absolute left-4 w-5 h-5 text-xmuted group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Ex: multa rescisória, CLT, LGPD, CDC..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-14 pl-12 pr-28 rounded-xl border border-border bg-card text-foreground placeholder:text-xmuted shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                />
                <button
                  type="submit"
                  className="absolute right-2 h-10 px-5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dim transition-colors"
                >
                  Buscar
                </button>
              </form>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm mt-8">
              <a href="#como-funciona" className="text-muted hover:text-accent transition-colors">Como funciona &rarr;</a>
              <button onClick={() => navigate("/skills")} className="text-muted hover:text-accent transition-colors">Ver todas as skills &rarr;</button>
            </div>
            <p className="text-xs text-xmuted mt-4">Compatível com Claude, ChatGPT, Gemini e qualquer assistente de IA</p>
          </div>
        </div>
      </section>

      {/* How it Works Section — Task 20: traduzido */}
      <section id="como-funciona" className="py-16 md:py-24 bg-card/50">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4 font-serif">Como Funciona</h2>
            <p className="text-muted max-w-2xl mx-auto">Três passos simples para usar skills jurídicas de IA com qualquer assistente.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
            <div className="hidden md:block absolute top-8 left-[16.6%] right-[16.6%] h-px border-t border-dashed border-border" />
            
            {[
              { num: 1, title: "Encontre", desc: "Busque ou navegue pela nossa biblioteca de skills de IA escritas por especialistas jurídicos." },
              { num: 2, title: "Copie", desc: "Copie o conteúdo ou o link da skill. Ele funciona como um prompt que qualquer IA consegue ler." },
              { num: 3, title: "Use", desc: "Cole no Claude, ChatGPT, Gemini ou qualquer IA. Adicione os detalhes do seu caso e execute." },
            ].map((step) => (
              <div key={step.num} className="relative text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border border-border bg-card flex items-center justify-center text-xl font-mono text-accent mb-4 relative z-10">
                  {step.num}
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full">
                  <span className="text-[10px] uppercase tracking-widest text-xmuted font-medium">Passo {step.num}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Skills — Task 20: traduzido */}
      <section className="py-16 md:py-24">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold mb-4 font-serif">Skills em Destaque</h2>
          <p className="text-muted max-w-2xl mx-auto mb-8">Explore nossa biblioteca de skills jurídicas com inteligência artificial.</p>
          <button onClick={() => navigate("/skills")} className="h-10 px-6 rounded-full border border-border hover:bg-card transition-colors text-sm font-medium">
            Ver Todas as Skills
          </button>
        </div>
      </section>
    </div>
  );
}
