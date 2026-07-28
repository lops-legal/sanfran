import { useNavigate } from "react-router-dom";
import { useInView } from "../../hooks/useInView";
import { Slack, Phone } from "lucide-react"; // Using Phone for WhatsApp if WhatsApp icon not available, but let's check if there's a better one, or just use lucide-react standard ones. Actually, MessageCircle is good for WhatsApp too.

export function FinalCTASection() {
    const navigate = useNavigate();
    const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });

    return (
        <section className="py-24 md:py-32 bg-white relative overflow-hidden">
            {/* Arch background reference */}
            <div className="absolute inset-x-0 bottom-0 h-64 bg-[#F9F7F5] rounded-t-[100%] scale-150 pointer-events-none opacity-50" />

            <div className="container max-w-3xl mx-auto px-4 relative z-10">
                <div ref={ref} className={`scale-reveal ${inView ? "is-visible" : ""} text-center space-y-10`}>

                    <h2 className="text-3xl md:text-5xl font-bold leading-tight text-[#3E2B1E]">
                        Pronto para transformar seu fluxo de trabalho?
                    </h2>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button
                            onClick={() => window.open("https://app.sanfran.md/signup", "_blank")}
                            className="relative h-14 px-8 rounded-lg bg-[#5D4432] text-white text-base font-medium hover:bg-[#4D3728] transition-all shadow-lg hover:-translate-y-0.5 w-full sm:w-auto"
                        >
                            <span className="relative z-10">Criar Conta Gratuita</span>
                        </button>
                        <a
                            href="http://localhost:3000/docs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-14 px-8 rounded-lg border-2 border-[#5D4432] text-[#5D4432] text-base font-medium hover:bg-[#F5F1EC] transition-all flex items-center justify-center w-full sm:w-auto"
                        >
                            Ver Documentação do MCP
                        </a>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10 border-t border-[#E0D8D0]/50 mt-10">
                        <a
                            href="https://join.slack.com/t/sanfranmd/shared_invite/zt-44ys5kr75-li43f~B2o4TGQLsDwqc0rQ"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-[#8B7D6B] hover:text-[#5D4432] transition-colors"
                        >
                            <Slack className="w-4 h-4" />
                            Junte-se à nossa comunidade no Slack
                        </a>
                        <a
                            href="https://chat.whatsapp.com/FDMNcZIGtow4UdU3esHKxz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-[#8B7D6B] hover:text-[#25D366] transition-colors"
                        >
                            {/* Using a generic chat icon for Whatsapp */}
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                            </svg>
                            Fale com o suporte no WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}