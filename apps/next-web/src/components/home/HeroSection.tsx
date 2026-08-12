import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { getCatalogStats } from "../../lib/skills-server";
import { StatCounter } from "../ui/shared/StatCounter";
import { RevealContainer } from "../ui/shared/RevealContainer";

export async function HeroSection() {
  const stats = await getCatalogStats();
  const totalPublished = stats?.totalPublished || 150;

  return (
    <section className="paper-texture paper-seda relative min-h-0 md:min-h-[70vh] flex items-center overflow-hidden bg-[#F9F7F5]">
      <div className="container max-w-7xl mx-auto px-4 py-10 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-10">

          <RevealContainer>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-[#3E2B1E] mb-6">
              Sanfran.md é o manual jurídico brasileiro<br />
              <span className="text-[#C9A84C]">do seu assistente de IA.</span>
            </h1>
          </RevealContainer>

          <RevealContainer delay={100}>
            <p className="text-lg md:text-xl text-[#8B7D6B] max-w-2xl mx-auto font-light leading-relaxed mb-6">
              Conecte o contexto jurídico brasileiro diretamente ao seu assistente (Claude, Grok, GPT..) via MCP. Reduza as alucinações e crie fluxos de trabalho seguros. Use centenas de skills com um plug.
            </p>
          </RevealContainer>

          <RevealContainer delay={200}>
            <div className="flex justify-center mb-10">
              <div className="relative bg-white border border-[#E0D8D0] shadow-sm rounded-2xl rounded-tr-none px-6 py-3 text-[#5D4432] font-medium text-[15px] sm:text-base flex items-center gap-2 animate-bubble-float">
                <span>E se cada skill jurídica coubesse num único plug-in?</span>
                <div className="absolute -top-2 right-0 w-4 h-4 bg-white border-t border-r border-[#E0D8D0] transform skew-x-12"></div>
              </div>
            </div>
          </RevealContainer>

          <RevealContainer delay={300} className="w-full max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/skills"
                className="h-14 px-8 rounded-lg bg-[#5D4432] text-white text-base font-medium hover:bg-[#4D3728] transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto justify-center"
              >
                Explorar Catálogo
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="https://sanfranmdskills.netlify.app/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="h-14 px-8 rounded-lg border-2 border-[#5D4432] text-[#5D4432] text-base font-medium hover:bg-[#F5F1EC] transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Ler Documentação
                <BookOpen className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm text-[#8B7D6B] mt-5 font-light">
              Gratuito. Seguro. Comece em segundos.
            </p>
          </RevealContainer>

          <RevealContainer delay={500} className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#8B7D6B]">
            <span>
              <strong className="text-[#3E2B1E] font-mono counter-number text-lg">
                <StatCounter end={totalPublished} />
              </strong>{" "}
              skills disponíveis
            </span>
            <span className="hidden sm:block w-px h-4 bg-[#E0D8D0]" />
            <span>Open-source</span>
            <span className="hidden sm:block w-px h-4 bg-[#E0D8D0]" />
            <span>Compliance verificado</span>
          </RevealContainer>
        </div>
      </div>
    </section>
  );
}
