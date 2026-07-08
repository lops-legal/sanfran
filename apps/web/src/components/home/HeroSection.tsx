import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { useCatalogStats } from "../../hooks/useCatalogStats";
import { useInView } from "../../hooks/useInView";
import { useCountUp } from "../../hooks/useCountUp";

const TYPING_WORDS = ["contratos", "petições", "LGPD", "societário", "trabalhista"];

export function HeroSection() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const { stats, isLoading: statsLoading } = useCatalogStats();
    const { ref: revealRef, inView } = useInView<HTMLDivElement>({ threshold: 0.1 });
    const { ref: countRef, count: totalCount } = useCountUp({
        end: stats?.totalPublished || 150,
        duration: 2500,
    });

    const [wordIndex, setWordIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentWord = TYPING_WORDS[wordIndex];
        let timeout: ReturnType<typeof setTimeout>;

        if (!isDeleting && charIndex < currentWord.length) {
            timeout = setTimeout(() => setCharIndex((c) => c + 1), 80);
        } else if (!isDeleting && charIndex === currentWord.length) {
            timeout = setTimeout(() => setIsDeleting(true), 2000);
        } else if (isDeleting && charIndex > 0) {
            timeout = setTimeout(() => setCharIndex((c) => c - 1), 40);
        } else if (isDeleting && charIndex === 0) {
            setIsDeleting(false);
            setWordIndex((w) => (w + 1) % TYPING_WORDS.length);
        }

        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, wordIndex]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        navigate(query ? `/skills?q=${encodeURIComponent(query)}` : "/skills");
    };

    return (
        <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-[#F9F7F5]">
            <div className="container max-w-7xl mx-auto px-4 py-20">
                <div ref={revealRef} className="max-w-4xl mx-auto text-center space-y-10">
                    <div className="clause-header justify-center">
                        CLÁUSULA PRIMEIRA — DO PROPÓSITO
                    </div>

                    <div className="flex justify-center">
                        <div className={`seal-stamp ${inView ? "is-visible" : ""}`}>
                            <div className="seal-stamp-inner">
                                Sanfran<br />Skills<br />{statsLoading ? "..." : `${totalCount}+`}
                            </div>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-[#3E2B1E]">
                        Skills de IA para
                        <br />
                        <span className="relative inline-block">
                            <span>{TYPING_WORDS[wordIndex].substring(0, charIndex)}</span>
                            <span className="typewriter-cursor" />
                        </span>
                        <br />
                        <span className="text-[#C9A84C]">que funcionam.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-[#8B7D6B] max-w-2xl mx-auto font-light leading-relaxed">
                        Um skill jurídico não é um prompt genérico. É um documento estruturado com
                        artigos de lei, limites de escopo e casos de teste — que qualquer IA
                        consegue executar.
                    </p>

                    <div className="w-full max-w-xl mx-auto">
                        <form onSubmit={handleSearch} className="relative flex items-center">
                            <Search className="absolute left-4 w-5 h-5 text-[#8B7D6B] z-10" />
                            <input
                                type="text"
                                placeholder="Ex: revisão de contrato, LGPD, CDC..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full h-14 pl-12 pr-36 rounded-xl border border-[#E0D8D0] bg-white text-[#3E2B1E] placeholder:text-[#8B7D6B] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] transition-all text-base"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 h-10 px-5 rounded-lg bg-[#5D4432] text-white text-sm font-medium hover:bg-[#4D3728] transition-all flex items-center gap-2"
                            >
                                Buscar
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                    <div className="flex items-center justify-center gap-6 text-sm text-[#8B7D6B]">
                        <span>
                            <strong className="text-[#3E2B1E] font-mono counter-number" ref={countRef}>
                                {statsLoading ? "..." : totalCount}
                            </strong>{" "}
                            skills disponíveis
                        </span>
                        <span className="w-px h-4 bg-[#E0D8D0]" />
                        <span>Open-source</span>
                        <span className="w-px h-4 bg-[#E0D8D0]" />
                        <span>Compliance verificado</span>
                    </div>
                </div>
            </div>
        </section>
    );
}