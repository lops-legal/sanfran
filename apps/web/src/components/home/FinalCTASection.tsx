import { useNavigate } from "react-router-dom";
import { useInView } from "../../hooks/useInView";

export function FinalCTASection() {
    const navigate = useNavigate();
    const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });

    return (
        <section className="py-24 md:py-32 bg-[#F9F7F5]">
            <div className="container max-w-2xl mx-auto px-4">
                <div ref={ref} className={`scale-reveal ${inView ? "is-visible" : ""} text-center space-y-8`}>
                    

                    <h2 className="text-3xl md:text-4xl font-bold leading-tight text-[#3E2B1E]">
                        Sua IA não precisa mais se perder no direito.
                    </h2>

                    <p className="text-[#8B7D6B] text-sm max-w-md mx-auto">
                        Skills prontas. Compatível com qualquer assistente. Código aberto.
                    </p>

                    <div className="flex flex-col items-center gap-4">
                        <button
                            onClick={() => navigate("/skills")}
                            className="relative h-12 px-8 rounded-lg bg-[#5D4432] text-white text-sm font-medium hover:bg-[#4D3728] transition-all pulse-ring"
                        >
                            <span className="relative z-10">Começar agora</span>
                        </button>
                        <p className="text-xs text-[#8B7D6B]">Gratuito. Sem cadastro. Comece em segundos.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}