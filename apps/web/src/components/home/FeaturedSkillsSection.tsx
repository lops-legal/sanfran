import React from "react";
import { useNavigate } from "react-router-dom";
import { useInView } from "../../hooks/useInView";
import { ArrowRight, FileText, Scale, Shield, Building, Gavel, FileSearch } from "lucide-react";

const FEATURED_SKILLS = [
    { title: "Análise de Contratos", category: "Contratos", description: "Revise e extraia cláusulas críticas de contratos comerciais em segundos.", icon: FileText },
    { title: "Due Diligence Legal", category: "Corporate", description: "Mapeie riscos jurídicos em operações de M&A com relatórios estruturados.", icon: Scale },
    { title: "Compliance LGPD", category: "Regulatório", description: "Avalie a conformidade de processos com a Lei Geral de Proteção de Dados.", icon: Shield },
    { title: "Petição Inicial", category: "Litígios", description: "Estruture petições com fundamentação jurídica sólida e precedentes.", icon: Gavel },
    { title: "Pesquisa Jurisprudencial", category: "Pesquisa", description: "Encontre jurisprudência relevante para teses jurídicas complexas.", icon: FileSearch },
    { title: "Contrato Societário", category: "Corporate", description: "Elabore contratos sociais, acordos de sócios e atas de assembleia.", icon: Building },
];

function SkillCard({
    title,
    category,
    description,
    icon: Icon,
    index,
}: {
    title: string;
    category: string;
    description: string;
    icon: React.ElementType;
    index: number;
}) {
    const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });

    return (
        <div
            ref={ref}
            style={{ ["--reveal-delay" as string]: `${index * 80}ms` }}
            className={`reveal ${inView ? "is-visible" : ""} gradient-border-card p-6 transition-all duration-500 hover:shadow-md hover:-translate-y-1`}
        >
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F5F1EC] border border-[#E0D8D0] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#5D4432]" />
                </div>
                <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#8B7D6B]">{category}</span>
                    <h3 className="text-base font-semibold mt-1 text-[#3E2B1E]">{title}</h3>
                    <p className="text-sm text-[#8B7D6B] mt-1 leading-relaxed">{description}</p>
                </div>
            </div>
        </div>
    );
}

export function FeaturedSkillsSection() {
    const navigate = useNavigate();
    const { ref: sectionRef, inView: sectionInView } = useInView<HTMLDivElement>({ threshold: 0.1 });

    return (
        <section id="skills" className="py-20 md:py-28 bg-[#F9F7F5]">
            <div className="container max-w-7xl mx-auto px-4">
                <div ref={sectionRef} className="text-center mb-14">
                    <h2 className={`text-3xl md:text-4xl font-bold mb-3 text-[#3E2B1E] transition-all duration-700 ${sectionInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                        Habilidades mais usadas
                    </h2>
                    <p className={`text-[#8B7D6B] max-w-xl mx-auto text-sm transition-all duration-700 delay-100 ${sectionInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                        As skills que estão transformando a rotina dos escritórios.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
                    {FEATURED_SKILLS.map((skill, i) => (
                        <React.Fragment key={skill.title}>
                            <SkillCard
                                title={skill.title}
                                category={skill.category}
                                description={skill.description}
                                icon={skill.icon}
                                index={i}
                            />
                        </React.Fragment>
                    ))}
                </div>

                <div className={`text-center mt-10 transition-all duration-700 delay-300 ${sectionInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                    <button
                        onClick={() => navigate("/skills")}
                        className="inline-flex items-center gap-2 h-11 px-7 rounded-lg bg-[#5D4432] text-white text-sm font-medium hover:bg-[#4D3728] transition-all hover:-translate-y-0.5 shadow-sm hover:shadow"
                    >
                        Ver todas as skills <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </section>
    );
}