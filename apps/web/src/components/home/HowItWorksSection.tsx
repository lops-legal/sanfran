import React from "react";
import { useInView } from "../../hooks/useInView";
import { Search, Bookmark, Plug, Play, ArrowRight } from "lucide-react";

const STEPS = [
    { icon: Search, title: "1. Encontre", desc: "Navegue pelo catálogo e escolha a habilidade jurídica ideal para o seu caso." },
    { icon: Bookmark, title: "2. Salve", desc: "Adicione a skill à sua biblioteca pessoal ou ao repositório privado da sua equipe." },
    { icon: Plug, title: "3. Conecte", desc: "Vincule a plataforma Sanfran ao seu assistente utilizando nosso servidor MCP em dois cliques." },
    { icon: Play, title: "4. Execute", desc: "Peça ao assistente para usar a habilidade e obtenha respostas blindadas pelo direito brasileiro." },
];

function StepCard({
    icon: Icon,
    title,
    desc,
    index,
}: {
    icon: React.ElementType;
    title: string;
    desc: string;
    index: number;
}) {
    const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });

    return (
        <div
            ref={ref}
            style={{ ["--reveal-delay" as string]: `${index * 120}ms` }}
            className={`reveal ${inView ? "is-visible" : ""} relative flex flex-col items-center text-center`}
        >
            <div className="w-16 h-16 rounded-full border border-[#E0D8D0] bg-white flex items-center justify-center mb-5 shadow-sm transition-transform hover:scale-110 duration-300">
                <Icon className="w-7 h-7 text-[#5D4432]" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-[#3E2B1E]">{title}</h3>
            <p className="text-sm text-[#8B7D6B] max-w-[200px] leading-relaxed">{desc}</p>
        </div>
    );
}

export function HowItWorksSection() {
    const { ref: sectionRef, inView: sectionInView } = useInView<HTMLDivElement>({ threshold: 0.1 });

    return (
        <section id="como-funciona" className="py-12 md:py-20 lg:py-28 bg-[#F9F7F5]">
            <div className="container max-w-7xl mx-auto px-4">
                <div ref={sectionRef} className="text-center mb-16">
                    <h2 className={`text-3xl md:text-4xl font-bold mb-3 text-[#3E2B1E] transition-all duration-700 ${sectionInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                        Como usar o Sanfran Skills
                    </h2>
                    <p className={`text-[#8B7D6B] max-w-xl mx-auto text-sm transition-all duration-700 delay-100 ${sectionInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                        Quatro passos simples. Nenhuma configuração complexa.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 max-w-6xl mx-auto relative">
                    {/* Connector line for desktop */}
                    <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%]">
                        <div
                            style={{ width: sectionInView ? "100%" : "0%", transition: "width 1.5s cubic-bezier(0.16, 1, 0.3, 1)", transitionDelay: "300ms" }}
                            className="connector-line-horizontal"
                        />
                    </div>
                    {STEPS.map((step, i) => (
                        <React.Fragment key={step.title}>
                            <StepCard
                                icon={step.icon}
                                title={step.title}
                                desc={step.desc}
                                index={i}
                            />
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </section>
    );
}