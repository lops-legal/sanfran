import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { useCatalogStats } from "../../hooks/useCatalogStats";
import { useInView } from "../../hooks/useInView";
import { useCountUp } from "../../hooks/useCountUp";

export function HeroSection() {
    const navigate = useNavigate();
    const { stats, isLoading: statsLoading } = useCatalogStats();
    const { ref: revealRef, inView } = useInView<HTMLDivElement>({ threshold: 0.1 });
    const { ref: countRef, count: totalCount } = useCountUp({
        end: stats?.totalPublished || 150,
        duration: 2500,
    });

    return (
        <section className="paper-texture paper-seda relative min-h-0 md:min-h-[70vh] flex items-center overflow-hidden bg-[#F9F7F5]">
            <div className="container max-w-7xl mx-auto px-4 py-10 md:py-20">
                <div ref={revealRef} className="max-w-4xl mx-auto text-center space-y-6 md:space-y-10">

                    <div className={`transition-all duration-1000 transform ${inView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-[#3E2B1E] mb-6">
                            Sanfran.md é o manual jurídico brasileiro<br />
                            <span className="text-[#C9A84C]">do seu assistente de IA.</span>
                        </h1>
                    </div>

                    <p className={`text-lg md:text-xl text-[#8B7D6B] max-w-2xl mx-auto font-light leading-relaxed mb-6 transition-all duration-1000 delay-100 transform ${inView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                        Conecte o contexto jurídico brasileiro diretamente ao seu assistente (Claude, Grok, GPT..) via MCP. Reduza as alucinações e crie fluxos de trabalho seguros. Use centenas de skills com um plug.
                    </p>

                    <div className={`flex justify-center mb-10 transition-all duration-1000 delay-200 transform ${inView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                        <div className="relative bg-white border border-[#E0D8D0] shadow-sm rounded-2xl rounded-tr-none px-6 py-3 text-[#5D4432] font-medium text-[15px] sm:text-base flex items-center gap-2 animate-bubble-float">
                            <span>E se cada skill jurídica coubesse num único plug-in?</span>
                            {/* Balãozinho tail */}
                            <div className="absolute -top-2 right-0 w-4 h-4 bg-white border-t border-r border-[#E0D8D0] transform skew-x-12"></div>
                        </div>
                    </div>

                    <div className={`w-full max-w-xl mx-auto transition-all duration-1000 delay-300 transform ${inView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate("/skills")}
                                className="h-14 px-8 rounded-lg bg-[#5D4432] text-white text-base font-medium hover:bg-[#4D3728] transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto justify-center"
                            >
                                Explorar Catálogo
                                <ArrowRight className="w-5 h-5" />
                            </button>
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
                    </div>

                    <div className={`flex flex-wrap items-center justify-center gap-6 text-sm text-[#8B7D6B] transition-all duration-1000 delay-500 transform ${inView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                        <span>
                            <strong className="text-[#3E2B1E] font-mono counter-number text-lg" ref={countRef}>
                                {statsLoading ? "..." : totalCount}
                            </strong>{" "}
                            skills disponíveis
                        </span>
                        <span className="hidden sm:block w-px h-4 bg-[#E0D8D0]" />
                        <span>Open-source</span>
                        <span className="hidden sm:block w-px h-4 bg-[#E0D8D0]" />
                        <span>Compliance verificado</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
