import React, { useState } from "react";
import { useInView } from "../../hooks/useInView";
import { Plug, Copy, Check, Sparkles, Layers } from "lucide-react";

const MCP_NAME = "Sanfran.md";
const MCP_URL = "https://sanfranmd.up.railway.app/mcp";

function ConnectorField({ label, value }: { label: string; value: string }) {
    return (
        <div className="w-full text-left">
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#8B7D6B] mb-1.5">{label}</p>
            <div className="w-full rounded-lg bg-[#F9F7F5] border border-[#E0D8D0] px-4 py-3 font-mono text-sm text-[#3E2B1E] break-all">
                {value}
            </div>
        </div>
    );
}

export function HowToPlugSection() {
    const { ref: sectionRef, inView: sectionInView } = useInView<HTMLDivElement>({ threshold: 0.1 });
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        try {
            navigator.clipboard?.writeText(MCP_URL);
        } catch {
            /* clipboard indisponível — sem quebra de UX */
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section id="como-plugar" className="py-12 md:py-20 lg:py-28 bg-[#F9F7F5]">
            <div className="container max-w-7xl mx-auto px-4">
                <div ref={sectionRef} className="text-center mb-14">
                    <span className={`inline-flex items-center justify-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#C9A84C] mb-4 transition-all duration-700 transform ${sectionInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                        <Plug className="w-4 h-4" /> Como plugar
                    </span>
                    <h2 className={`text-3xl md:text-4xl font-bold mb-3 text-[#3E2B1E] transition-all duration-700 ${sectionInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                        Um plug. Seu assistente com o direito brasileiro.
                    </h2>
                    <p className={`text-[#8B7D6B] max-w-xl mx-auto text-sm transition-all duration-700 delay-100 ${sectionInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                        Sem instalar skill por skill. Adicione um único conector e pronto.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
                    {/* Passo 1 — o conector */}
                    <div className={`flex flex-col bg-white border border-[#E0D8D0] rounded-2xl shadow-sm p-8 transition-all duration-700 ${sectionInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                        <span className="inline-flex w-fit items-center rounded-full bg-[#5D4432] text-white text-[11px] font-mono uppercase tracking-wider px-3 py-1 mb-5">
                            Passo 1
                        </span>
                        <h3 className="text-xl font-semibold mb-2 text-[#3E2B1E]">Pegue nosso MCP como um conector</h3>
                        <p className="text-sm text-[#8B7D6B] leading-relaxed mb-6">
                            No seu assistente de IA (Claude, Grok, GPT, Cursor...), adicione o conector MCP com estes dados:
                        </p>
                        <div className="flex flex-col gap-4 mb-6">
                            <ConnectorField label="Nome" value={MCP_NAME} />
                            <ConnectorField label="Domínio / URL" value={MCP_URL} />
                        </div>
                        <button
                            onClick={handleCopy}
                            className="mt-auto h-12 px-5 rounded-lg bg-[#5D4432] text-white text-sm font-medium hover:bg-[#4D3728] transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 text-[#C9A84C]" /> URL copiada!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" /> Copiar URL do conector
                                </>
                            )}
                        </button>
                    </div>

                    {/* Passo 2 — centenas de skills */}
                    <div className={`flex flex-col bg-white border border-[#E0D8D0] rounded-2xl shadow-sm p-8 transition-all duration-700 delay-150 ${sectionInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                        <span className="inline-flex w-fit items-center rounded-full bg-[#C9A84C] text-white text-[11px] font-mono uppercase tracking-wider px-3 py-1 mb-5">
                            Passo 2
                        </span>
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-11 h-11 shrink-0 rounded-xl bg-[#F9F7F5] border border-[#E0D8D0] flex items-center justify-center">
                                <Layers className="w-5 h-5 text-[#5D4432]" />
                            </div>
                            <h3 className="text-xl font-semibold text-[#3E2B1E]">Centenas de skills jurídicas com um plug</h3>
                        </div>
                        <p className="text-sm text-[#8B7D6B] leading-relaxed mb-5">
                            Assim que o conector estiver ativo, você terá acesso instantâneo a <strong className="text-[#3E2B1E] font-semibold">centenas de skills jurídicas brasileiras</strong> prontas para usar — sem precisar plugar nenhuma habilidade individualmente.
                        </p>
                        <div className="flex items-start gap-3 mt-auto rounded-xl bg-[#FCF4E4] border border-[#E8D9A8] p-4">
                            <Sparkles className="w-5 h-5 text-[#C9A84C] shrink-0 mt-0.5" />
                            <p className="text-sm text-[#5D4432] leading-relaxed">
                                Um único plug disponibiliza todo o catálogo: contratos, petições, LGPD, CDC, CLT e muito mais.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
