import {
  BookOpen,
  Briefcase,
  Building2,
  Calculator,
  CalendarClock,
  FileCheck2,
  FileText,
  GraduationCap,
  Landmark,
  ClipboardCopy,
  MessageSquare,
  Plug,
  Scale,
  ShieldCheck,
  Upload,
  Users,
  Wand2,
  Rocket,
  RefreshCw,
  Lock,
  Repeat,
} from "lucide-react";
import { FeatureCard, IconCircle, PillLink, Section, SectionHeader } from "./primitives";
import { SLACK_URL } from "../../lib/site";

/* ───────────── Recursos ───────────── */

const CAPABILITIES = [
  { icon: Scale, title: "Skills jurídicas", text: "Procedimentos prontos de trabalho jurídico, com fundamento legal citado e data da última conferência." },
  { icon: Plug, title: "Dentro do seu assistente", text: "Conecte uma vez ao Claude, ChatGPT ou Manus e o assistente passa a usar as skills sozinho, na conversa." },
  { icon: CalendarClock, title: "Prazos", text: "Contagem em dias úteis com feriados, recesso forense e regras do CPC, da CLT e da Lei 14.133." },
  { icon: Calculator, title: "Cálculos", text: "Atualização de débitos (Lei 14.905/2024), verbas rescisórias e honorários, com memória de cálculo." },
  { icon: FileCheck2, title: "Validadores", text: "Número CNJ, CPF e CNPJ (inclusive alfanumérico) e verificação de artigos e súmulas citados." },
  { icon: FileText, title: "Peças e pareceres", text: "Iniciais, contestações, recursos e pareceres com checagem dos requisitos legais." },
  { icon: ShieldCheck, title: "LGPD", text: "Atendimento a titulares, RIPD, incidentes de segurança e transferência internacional." },
  { icon: Landmark, title: "Setor público", text: "ETP, termo de referência, pareceres do art. 53 e recursos em licitações." },
];

export function CapabilitiesSection() {
  return (
    <Section band>
      <SectionHeader
        title="Tudo para levar IA ao Direito brasileiro"
        subtitle="Procedimentos jurídicos, cálculos confiáveis e conexão direta com o seu assistente. Cada resposta com a fonte legal."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CAPABILITIES.map((c) => (
          <FeatureCard key={c.title} icon={c.icon} title={c.title}>
            {c.text}
          </FeatureCard>
        ))}
      </div>
    </Section>
  );
}

/* ───────────── Para quem ───────────── */

const PERSONAS = [
  { icon: Briefcase, title: "Advogados", pains: ["Triagem diária de intimações", "Qual recurso cabe e em que prazo", "Atualização de débito e honorários"] },
  { icon: Building2, title: "Jurídico in-house", pains: ["Contratos em volume, no seu playbook", "Provisão de contingências", "Triagem de demandas com SLA"] },
  { icon: Users, title: "Empresas", pains: ["Respostas ao Procon", "Rescisões sem erro de verbas", "Termos de uso e privacidade"] },
  { icon: GraduationCap, title: "Estagiários", pains: ["Contar e explicar o prazo", "Revisão formal antes do protocolo", "Pesquisa de jurisprudência guiada"] },
  { icon: Landmark, title: "Setor público", pains: ["ETP e termo de referência", "Pareceres em escala", "Respostas à LAI no prazo"] },
];

export function PersonasSection() {
  return (
    <Section>
      <SectionHeader
        title="Feito a partir das dores de quem trabalha com Direito"
        subtitle="Cada skill nasce de uma tarefa real: algo que alguém precisa fazer ou saber hoje."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {PERSONAS.map((p) => (
          <div key={p.title} className="flex flex-col gap-3 p-5 rounded-lg border border-border bg-card">
            <IconCircle icon={p.icon} />
            <h3 className="font-medium">{p.title}</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {p.pains.map((pain) => (
                <li key={pain} className="flex gap-2">
                  <span aria-hidden className="mt-2 w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                  {pain}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ───────────── Integração (3 opções) ───────────── */

const OPTIONS = [
  { n: 1, icon: Plug, title: "Conector no seu assistente", text: "No Claude, no ChatGPT ou no Manus, adicione o sanfran como conector colando um endereço. Daí em diante, é só conversar: o assistente encontra a skill certa sozinho." },
  { n: 2, icon: ClipboardCopy, title: "Copiar e colar a skill", text: "Usa o Grok, o Gemini ou outro assistente sem conectores? Copie a skill no site e cole no início da conversa. Funciona em qualquer IA." },
  { n: 3, icon: Building2, title: "Para a equipe de TI", text: "Se o seu escritório ou empresa tem sistemas próprios, a equipe técnica pode ligá-los ao mesmo endereço (padrão MCP)." },
];

export function IntegrationOptionsSection({ band = false, showLinks = true }: { band?: boolean; showLinks?: boolean }) {
  return (
    <Section band={band} id="integrar">
      <SectionHeader title="Use no assistente que você já usa" subtitle="Três formas de levar as skills jurídicas para o seu dia a dia — nenhuma exige saber programar." />
      <div className="grid gap-10 md:grid-cols-3 text-center">
        {OPTIONS.map((o) => (
          <div key={o.n} className="flex flex-col items-center gap-3">
            <span className="text-xs text-muted-foreground">Opção {o.n}</span>
            <IconCircle icon={o.icon} size="lg" />
            <h3 className="font-medium text-lg">{o.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{o.text}</p>
          </div>
        ))}
      </div>
      {showLinks && (
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <PillLink href="/integrate" variant="primary" icon={Plug}>Ver o passo a passo</PillLink>
          <PillLink href="/skills" icon={BookOpen}>Escolher uma skill</PillLink>
        </div>
      )}
    </Section>
  );
}

/* ───────────── Skills privadas ───────────── */

const STEPS = [
  { n: 1, icon: Upload, title: "Compartilhe sua expertise", text: "Envie modelos, checklists e playbooks, ou descreva o fluxo de trabalho. Nós capturamos o conhecimento da sua equipe." },
  { n: 2, icon: Wand2, title: "Construímos a skill", text: "Transformamos o conhecimento em instruções estruturadas, com testes e fundamento legal conferido." },
  { n: 3, icon: Rocket, title: "Use onde a equipe trabalha", text: "No Claude, ChatGPT, Grok ou Manus — privada para o seu escritório ou empresa." },
];

const WHY = [
  { icon: Repeat, title: "Consistência", text: "A IA segue o seu procedimento, toda vez." },
  { icon: Users, title: "Escala", text: "Ensine uma vez, use em toda a equipe." },
  { icon: Lock, title: "Privacidade", text: "Skills privadas ficam só na sua organização." },
  { icon: Plug, title: "Sem ficar preso", text: "Funciona no Claude, ChatGPT, Grok e Manus." },
  { icon: RefreshCw, title: "Manutenção", text: "Versionadas e reconferidas quando a lei muda." },
];

export function PrivateSkillsSection() {
  return (
    <>
      <Section band>
        <SectionHeader
          title="O conhecimento do seu jurídico, dentro da IA"
          subtitle="Modelos, checklists e o jeito de trabalhar do seu escritório ou departamento, transformados em skills que toda a equipe usa."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="flex flex-col gap-3 p-5 rounded-lg border border-border bg-card">
              <span className="text-xs text-muted-foreground">Passo {s.n}</span>
              <IconCircle icon={s.icon} />
              <h3 className="font-medium">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section>
        <SectionHeader title="Por que skills privadas?" subtitle="O conhecimento da sua equipe, aplicado do mesmo jeito em toda a organização." />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 text-center">
          {WHY.map((w) => (
            <div key={w.title} className="flex flex-col items-center gap-2">
              <IconCircle icon={w.icon} />
              <h3 className="font-medium">{w.title}</h3>
              <p className="text-sm text-muted-foreground">{w.text}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

/* ───────────── CTA final ───────────── */

export function FinalCTASection() {
  return (
    <Section band>
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-semibold tracking-tight mb-4">Pronto para começar?</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Conecte o Claude ou o ChatGPT em um minuto, ou fale com a gente para levar o conhecimento do seu jurídico para a IA.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <PillLink href="/integrate" variant="primary" icon={Plug}>Conectar ao meu assistente</PillLink>
          <PillLink href="/skills" icon={BookOpen}>Explorar skills</PillLink>
          <PillLink href={SLACK_URL} icon={MessageSquare} external>Comunidade no Slack</PillLink>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Ferramenta de apoio ao trabalho jurídico. Não substitui a análise de um advogado.
        </p>
      </div>
    </Section>
  );
}

