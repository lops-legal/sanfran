import { BookOpen, CircleHelp, MessageSquare, Plug, Scale } from "lucide-react";
import { Badge, PillLink } from "../components/site/primitives";
import {
  CapabilitiesSection,
  FinalCTASection,
  IntegrationOptionsSection,
  PersonasSection,
  PrivateSkillsSection,
} from "../components/site/sections";
import { getCatalogStats } from "../lib/skills-server";
import { SLACK_URL } from "../lib/site";

// Contagens vêm do banco: revalida a cada hora em vez de congelar no build.
export const revalidate = 3600;

export default async function Home() {
  const stats = await getCatalogStats();

  return (
    <>
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 text-center flex flex-col items-center gap-6">
          <Badge>
            <Scale className="w-3.5 h-3.5" aria-hidden />
            Feito para o Direito brasileiro
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-balance">
            O kit de engenharia jurídica brasileira
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl text-pretty">
            Skills para prazos, cálculos, peças, contratos, LGPD e licitações, com a fonte legal de cada resposta. Funciona
            dentro do Claude, ChatGPT, Grok e Manus — sem precisar saber programar.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <PillLink href="/skills" variant="primary" icon={BookOpen}>Explorar skills</PillLink>
            <PillLink href="/integrate" icon={Plug}>Conectar ao meu assistente</PillLink>
            <PillLink href="/docs" icon={CircleHelp}>Como funciona</PillLink>
            <PillLink href={SLACK_URL} icon={MessageSquare} external>Comunidade</PillLink>
          </div>
          <p className="text-sm text-muted-foreground">
            {stats.totalPublished > 0 && <>{stats.totalPublished} skills publicadas · </>}
            Fontes oficiais citadas · Código aberto
          </p>
        </div>
      </section>

      <CapabilitiesSection />
      <PersonasSection />
      <IntegrationOptionsSection band />
      <PrivateSkillsSection />
      <FinalCTASection />
    </>
  );
}
