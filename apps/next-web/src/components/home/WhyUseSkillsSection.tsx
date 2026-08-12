import React from "react";
import { TriangleAlert, ShieldCheck } from "lucide-react";
import { RevealContainer } from "../ui/shared/RevealContainer";

export function WhyUseSkillsSection() {
  return (
    <section className="py-12 md:py-20 lg:py-28 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E0D8D0] to-transparent opacity-50" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#F5F1EC] rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#F9F7F5] rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="container max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <RevealContainer>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#3E2B1E]">
              Por que não usar apenas o chat padrão?
            </h2>
          </RevealContainer>
          <RevealContainer delay={100}>
            <p className="text-[#8B7D6B] max-w-2xl mx-auto text-base">
              A diferença entre um assistente genérico e um especialista jurídico.
            </p>
          </RevealContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          <RevealContainer delay={200} className="bg-white border-2 border-red-100 rounded-2xl p-8 md:p-10 shadow-sm hover:shadow-md">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-6 border border-red-100">
              <TriangleAlert className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-[#3E2B1E] mb-3">Sem Habilidades (Risco)</h3>
            <p className="text-[#8B7D6B] leading-relaxed">
              Sem o contexto das leis brasileiras (CLT, LGPD, CDC), IAs genéricas tendem a <span className="text-red-500/80 font-medium">alucinar</span>, inventar jurisprudência e gerar documentos fora do padrão jurídico nacional.
            </p>
          </RevealContainer>

          <RevealContainer delay={400} className="bg-[#F9F7F5] border-2 border-[#5D4432]/20 rounded-2xl p-8 md:p-10 shadow-md hover:shadow-lg">
            <div className="w-14 h-14 rounded-full bg-[#5D4432] flex items-center justify-center mb-6 border border-[#4D3728]">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#3E2B1E] mb-3">Com Sanfran Skills (Segurança)</h3>
            <p className="text-[#8B7D6B] leading-relaxed">
              Nossas habilidades <span className="text-[#5D4432] font-medium">injetam a legislação correta</span> e casos de teste que funcionam como trilhos de segurança, limitando o escopo da IA e garantindo um raciocínio jurídico previsível.
            </p>
          </RevealContainer>
        </div>

        <RevealContainer delay={500} className="mt-20 bg-[#5D4432] rounded-3xl p-8 md:p-12 text-center shadow-xl">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-5">Mas o que é de fato uma "Skill"?</h3>
          <p className="text-[#E0D8D0] max-w-4xl mx-auto text-lg leading-relaxed font-light">
            Uma skill é um <strong className="text-white font-medium">documento de código (como um plug-in)</strong> injetado diretamente na memória do seu assistente de IA. 
            Não é um simples prompt. É um pacote de instruções rigorosas contendo artigos de lei, contexto prático, jurisprudência e limites de atuação. Isso obriga a IA a pensar estritamente dentro da lei brasileira, eliminando respostas genéricas e alucinações.
          </p>
        </RevealContainer>
      </div>
    </section>
  );
}
