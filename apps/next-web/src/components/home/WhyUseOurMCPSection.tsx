import React from "react";
import { ShieldCheck, RefreshCw, BrainCircuit } from "lucide-react";
import { RevealContainer } from "../ui/shared/RevealContainer";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Privacidade e Equipes",
    desc: "Suas skills privadas nunca vão para a internet. Nossa arquitetura garante isolamento total: apenas o seu escritório acessa o conhecimento criado pelo seu time.",
  },
  {
    icon: RefreshCw,
    title: "Atualização em Tempo Real",
    desc: "Edite ou crie uma nova habilidade no painel e seu assistente de IA será atualizado no mesmo segundo, sem necessidade de reinstalar nada.",
  },
  {
    icon: BrainCircuit,
    title: "Descoberta via Embeddings",
    desc: "Não tem certeza de qual skill usar? Nossa plataforma entende o contexto do seu caso e sugere a melhor habilidade automaticamente.",
  },
];

export function WhyUseOurMCPSection() {
  return (
    <section className="py-12 md:py-20 lg:py-28 bg-[#F9F7F5] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#E0D8D0]/20 rounded-bl-[200px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-[#E0D8D0]/20 rounded-tr-[200px] pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <RevealContainer>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#3E2B1E]">
              Infraestrutura pronta para o seu dia-a-dia jurídico
            </h2>
          </RevealContainer>
          <RevealContainer delay={100}>
            <p className="text-[#8B7D6B] max-w-2xl mx-auto text-base">
              Desenvolvido para equipes que exigem privacidade e alta performance.
            </p>
          </RevealContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {FEATURES.map((feature, i) => (
            <RevealContainer
              key={feature.title}
              delay={200 + i * 150}
              className="bg-white rounded-2xl p-8 border border-[#E0D8D0] shadow-sm hover:shadow-md transition-all group hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-lg bg-[#F5F1EC] flex items-center justify-center mb-6 group-hover:bg-[#5D4432] transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-[#5D4432] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-bold text-[#3E2B1E] mb-3">{feature.title}</h3>
              <p className="text-[#8B7D6B] text-sm leading-relaxed">{feature.desc}</p>
            </RevealContainer>
          ))}
        </div>
      </div>
    </section>
  );
}
