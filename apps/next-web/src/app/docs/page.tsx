import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, BookOpen, Calculator, CircleDashed, FileText, Plug, Scale, ShieldAlert } from "lucide-react";
import { Badge, FeatureCard, PillLink, Section, SectionHeader } from "../../components/site/primitives";
import { FinalCTASection } from "../../components/site/sections";

export const metadata: Metadata = {
  title: "Como funciona",
  description: "O que é uma skill jurídica, como usar no Claude, ChatGPT, Grok ou Manus, como funciona a revisão e quais são os limites.",
  alternates: { canonical: "/docs" },
};

const KINDS = [
  { icon: FileText, title: "Execução", text: "Produz algo pronto para revisar: peça, parecer, resposta ao Procon, checklist preenchido, relatório." },
  { icon: BookOpen, title: "Consulta", text: "Responde uma dúvida com fundamento: qual recurso cabe, qual base legal, o que mudou com a lei nova." },
  { icon: Calculator, title: "Cálculo e validação", text: "Faz contas e conferências em que a IA costuma errar: prazos, atualização de débitos, número de processo." },
];

const FAQ = [
  {
    q: "Preciso saber programar?",
    a: "Não. Você pode copiar a skill e colar na conversa, ou adicionar o sanfran como conector no Claude, ChatGPT ou Manus seguindo o passo a passo.",
  },
  {
    q: "O que acontece com os documentos que eu envio?",
    a: "Os documentos ficam no seu assistente (Claude, ChatGPT etc.). O sanfran entrega instruções e cálculos; não guarda o conteúdo das suas conversas.",
  },
  {
    q: "Posso confiar no resultado?",
    a: "As skills reduzem erros e citam a fonte legal, mas são ferramenta de apoio. Confira a fundamentação, especialmente em skills que ainda estão em revisão, antes de usar em um caso real.",
  },
  {
    q: "Quem escreve e revisa as skills?",
    a: "Cada skill tem autor e versão. A revisão jurídica é feita por advogados da área, identificados pelo nome e número da OAB na página da skill.",
  },
  {
    q: "Encontrei um erro. O que faço?",
    a: "Avise no Slack da comunidade ou abra uma sugestão no GitHub. Cálculos e prazos têm prioridade de correção.",
  },
  {
    q: "Posso ter skills só do meu escritório ou empresa?",
    a: "Sim. Skills privadas transformam os seus modelos e procedimentos em instruções que só a sua equipe usa. Fale com a gente.",
  },
];

export default function DocsPage() {
  return (
    <>
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 text-center flex flex-col items-center gap-6">
          <Badge>
            <Scale className="w-3.5 h-3.5" aria-hidden />
            Guia rápido
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-balance">Como funciona o sanfran</h1>
          <p className="text-lg text-muted-foreground max-w-2xl text-pretty">
            Uma skill é um procedimento de trabalho jurídico escrito para a IA seguir: o passo a passo, as regras legais que
            costumam ser esquecidas, o formato da resposta e os limites.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <PillLink href="/skills" variant="primary" icon={BookOpen}>Ver as skills</PillLink>
            <PillLink href="/integrate" icon={Plug}>Conectar ao assistente</PillLink>
          </div>
        </div>
      </section>

      <Section band>
        <SectionHeader title="Três tipos de skill" subtitle="Cada uma resolve uma dor diferente do dia a dia." />
        <div className="grid gap-4 md:grid-cols-3">
          {KINDS.map((k) => (
            <FeatureCard key={k.title} icon={k.icon} title={k.title}>
              {k.text}
            </FeatureCard>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader title="O selo de revisão" subtitle="Mostramos com clareza o que já foi revisado por um advogado e o que ainda não foi." />
        <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
          <FeatureCard icon={BadgeCheck} title="Revisada">
            Conferida por advogado da área, identificado com nome e OAB. Base normativa com data da última conferência.
          </FeatureCard>
          <FeatureCard icon={CircleDashed} title="Em revisão">
            Já pode ser usada como apoio, mas a fundamentação ainda não passou pela revisão final. Confira antes de usar.
          </FeatureCard>
        </div>
      </Section>

      <Section band>
        <SectionHeader title="Perguntas frequentes" />
        <div className="max-w-3xl mx-auto rounded-lg border border-border bg-card divide-y divide-border">
          {FAQ.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-medium">
                {f.q}
                <span className="text-muted-foreground transition-transform group-open:rotate-45 text-xl leading-none">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <Section>
        <div className="max-w-3xl mx-auto flex gap-4 p-5 rounded-lg border border-border bg-card">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground leading-relaxed">
            <b className="text-foreground font-medium">Limites.</b> O sanfran é ferramenta de apoio ao trabalho jurídico e não
            substitui a análise de um advogado. Os resultados dependem das informações fornecidas e da legislação vigente na data
            de conferência indicada em cada skill. Veja o <Link href="/integrate" className="underline underline-offset-2">guia de conexão</Link>.
          </p>
        </div>
      </Section>

      <FinalCTASection />
    </>
  );
}
