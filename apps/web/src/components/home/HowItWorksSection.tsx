import React from "react";
import { useInView } from "../../hooks/useInView";
import { Search, Copy, Play, ArrowRight } from "lucide-react";

const STEPS = [
    { icon: Search, title: "Encontre", desc: "Navegue por skills escritas por especialistas. Cada uma cobre uma área específica do direito." },
    { icon: Copy, title: "Copie", desc: "Copie o conteúdo ou o link. A skill funciona como um documento de instruções que qualquer IA entende." },
    { icon: Play, title: "Execute", desc: "Cole no Claude, ChatGPT ou Gemini. Adicione os fatos do seu caso e a IA aplica as regras." },
];

function StepCard({
    icon: Icon,
    title,
    desc,
    index,
    ...rest
}: {
    icon: React.ElementType;
    title: string;
    desc: string;
    index: number;
    [key: string]: unknown;
}) {
    const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });

    return (
        <div
            ref={ref}
            style={{ ["--reveal-delay" as string]: `${index * 120}ms` }}
            className={`reveal ${inView ? "is-visible" : ""} relative flex flex-col items-center text-center`}
        >
            <div className="w-16 h-16 rounded-full border border-[#E0D8D0] bg-white flex items-center justify-center mb-5 shadow-sm">
                <Icon className="w-7 h-7 text-[#5D4432]" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-[#3E2B1E]">{title}</h3>
            <p className="text-sm text-[#8B7D6B] max-w-xs leading-relaxed">{desc}</p>
        </div>
    );
}

export function HowItWorksSection() {
    const { ref: sectionRef, inView: sectionInView } = useInView<HTMLDivElement>({ threshold: 0.1 });

    return (
        <section id="como-funciona" className="py-20 md:py-28 bg-[#F9F7F5]">
            <div className="container max-w-7xl mx-auto px-4">
                <div ref={sectionRef} className="text-center mb-14">
                    <div className="clause-header justify-center mb-6">CLÁUSULA SEGUNDA — DO MECANISMO</div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[#3E2B1E]">Como qualquer skill funciona</h2>
                    <p className="text-[#8B7D6B] max-w-xl mx-auto text-sm">Três passos. Nenhuma integração. Nenhuma API.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto relative">
                    <div className="hidden md:block absolute top-8 left-[16.6%] right-[16.6%]">
                        <div
                            style={{ width: sectionInView ? "100%" : "0%", transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)", transitionDelay: "300ms" }}
                            className="connector-line-horizontal"
                        />
                    </div>
                    {STEPS.map((step, i) => (
                        <StepCard key={step.title} icon={step.icon} title={step.title} desc={step.desc} index={i} />
                    ))}
                </div>

                <div className="text-center mt-12">
                    <a href="#skills" className="inline-flex items-center gap-2 text-sm text-[#8B7D6B] hover:text-[#5D4432] transition-colors">
                        Ver o catálogo completo <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>
        </section>
    );
}