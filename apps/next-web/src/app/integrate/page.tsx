import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, MessageSquare, Plug } from "lucide-react";
import { Badge, PillLink, Section, SectionHeader } from "../../components/site/primitives";
import { CodeBlock } from "../../components/site/CodeBlock";
import { CopyField } from "../../components/site/CopyField";
import { FinalCTASection, IntegrationOptionsSection, PrivateSkillsSection } from "../../components/site/sections";
import { MCP_TOOLS } from "../../lib/mcp/tools";
import { MCP_URL, SITE_URL, SLACK_URL } from "../../lib/site";

export const metadata: Metadata = {
  title: "Conectar ao seu assistente",
  description:
    "Passo a passo para usar as skills jurídicas do sanfran.md no Claude, ChatGPT, Manus e Grok. Sem programação.",
  alternates: { canonical: "/integrate" },
};

type Guide = { name: string; note?: string; steps: React.ReactNode[]; copy?: boolean };

const GUIDES: Guide[] = [
  {
    name: "Claude",
    note: "claude.ai e aplicativo para computador",
    copy: true,
    steps: [
      <>Abra <b>Configurações → Conectores</b>.</>,
      <>Clique em <b>Adicionar conector personalizado</b>.</>,
      <>Dê o nome <b>sanfran</b> e cole o endereço abaixo.</>,
      <>Na conversa, ative o sanfran no menu de ferramentas e peça o que precisa.</>,
    ],
  },
  {
    name: "ChatGPT",
    note: "planos pagos, com o modo desenvolvedor",
    copy: true,
    steps: [
      <>Em <b>Configurações → Apps e conectores → Avançado</b>, ative o <b>modo desenvolvedor</b>.</>,
      <>Volte em <b>Apps e conectores</b> e clique em <b>Criar</b>.</>,
      <>Nome <b>sanfran</b>, cole o endereço abaixo e escolha <b>sem autenticação</b>.</>,
      <>Na conversa, selecione o sanfran no botão <b>+</b> e descreva a tarefa.</>,
    ],
  },
  {
    name: "Manus",
    copy: true,
    steps: [
      <>Abra <b>Configurações → Conectores</b>.</>,
      <>Escolha <b>Adicionar conector → MCP personalizado</b>.</>,
      <>Cole o endereço abaixo e salve.</>,
      <>Peça a tarefa normalmente; o Manus chama o sanfran quando precisar.</>,
    ],
  },
  {
    name: "Grok e outros",
    note: "Gemini, Copilot ou qualquer assistente sem conectores",
    steps: [
      <>Abra a skill no <Link className="underline underline-offset-2" href="/skills">catálogo</Link>.</>,
      <>Clique em <b>Copiar skill</b>.</>,
      <>Cole no início da conversa.</>,
      <>Em seguida, descreva o caso ou cole o documento.</>,
    ],
  },
];

const EXAMPLES = [
  "Confira se estes números de processo estão certos antes de eu cadastrar: …",
  "A intimação saiu no DJEN em 19/12. Tenho 15 dias para contestar. Quando vence?",
  "Revise este contrato de prestação de serviços e aponte as cláusulas de risco para a empresa.",
  "Recebi esta reclamação do Procon. Monte uma resposta dentro do CDC.",
  "Preciso de um ETP para contratar serviço de limpeza pela Lei 14.133.",
  "Explique para o cliente, em linguagem simples, o que aconteceu no processo.",
];

const TECH_SNIPPETS = [
  { label: "Claude Code (terminal)", code: `claude mcp add --transport http sanfran ${MCP_URL}` },
  { label: "Arquivo de configuração MCP", code: JSON.stringify({ mcpServers: { sanfran: { url: MCP_URL } } }, null, 2) },
  { label: "Skill em markdown", code: `curl ${SITE_URL}/skills/cnj-numero.md` },
  {
    label: "Chamada direta (JSON-RPC 2.0)",
    code: `curl -X POST ${MCP_URL} \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json, text/event-stream" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"validar_numero_cnj","arguments":{"numeros":["0002150-39.2023.8.13.0024"]}}}'`,
  },
];

export default function IntegratePage() {
  return (
    <>
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 text-center flex flex-col items-center gap-6">
          <Badge>
            <Plug className="w-3.5 h-3.5" aria-hidden />
            Sem programação
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-balance">
            Leve o sanfran para o assistente que você já usa
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl text-pretty">
            Conecte uma vez ao Claude, ao ChatGPT ou ao Manus. Daí em diante, o assistente consulta as skills jurídicas
            sozinho, cita a fonte legal e faz os cálculos com precisão.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <PillLink href="#passo-a-passo" variant="primary" icon={Plug}>Ver o passo a passo</PillLink>
            <PillLink href="/skills" icon={BookOpen}>Escolher uma skill</PillLink>
            <PillLink href={SLACK_URL} icon={MessageSquare} external>Pedir ajuda</PillLink>
          </div>
          <p className="text-sm text-muted-foreground">Gratuito e sem cadastro.</p>
        </div>
      </section>

      <IntegrationOptionsSection band showLinks={false} />

      <Section id="passo-a-passo">
        <SectionHeader title="Passo a passo" subtitle="Escolha o seu assistente. Leva cerca de um minuto." />
        <div className="grid gap-4 md:grid-cols-2 max-w-5xl mx-auto">
          {GUIDES.map((g) => (
            <div key={g.name} className="flex flex-col gap-4 p-6 rounded-lg border border-border bg-card">
              <div>
                <h3 className="text-xl font-semibold">{g.name}</h3>
                {g.note && <p className="text-sm text-muted-foreground mt-1">{g.note}</p>}
              </div>
              <ol className="space-y-2.5 text-sm">
                {g.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-border text-[11px] text-muted-foreground shrink-0 mt-px">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground [&_b]:text-foreground [&_b]:font-medium">{step}</span>
                  </li>
                ))}
              </ol>
              {g.copy && (
                <div className="mt-auto pt-2">
                  <CopyField value={MCP_URL} label="Copiar endereço" />
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Os nomes dos menus mudam de tempos em tempos. Se não encontrar, procure por “conectores” nas configurações do seu assistente.
        </p>
      </Section>

      <Section band>
        <SectionHeader title="O que pedir depois de conectar" subtitle="Escreva como escreveria para um colega. O assistente escolhe a skill certa." />
        <div className="grid gap-3 sm:grid-cols-2 max-w-4xl mx-auto">
          {EXAMPLES.map((e) => (
            <div key={e} className="p-4 rounded-lg border border-border bg-card text-sm">
              “{e}”
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader title="O que o assistente passa a saber fazer" subtitle="Disponível assim que você conecta." />
        <div className="max-w-4xl mx-auto rounded-lg border border-border bg-card divide-y divide-border">
          {MCP_TOOLS.map((t) => (
            <div key={t.name} className="grid gap-1 sm:grid-cols-[240px_1fr] sm:gap-6 p-4">
              <p className="text-sm font-medium">{t.label}</p>
              <p className="text-sm text-muted-foreground">{t.summary}</p>
            </div>
          ))}
        </div>
      </Section>

      <PrivateSkillsSection />

      <Section band>
        <details className="max-w-5xl mx-auto group">
          <summary className="cursor-pointer list-none text-center">
            <span className="text-lg font-serif font-semibold">Para a equipe de TI</span>
            <span className="block text-sm text-muted-foreground mt-1">
              Endpoint MCP (Streamable HTTP), URLs em markdown e JSON-RPC 2.0 — clique para ver
            </span>
          </summary>
          <div className="grid gap-4 lg:grid-cols-2 mt-8">
            {TECH_SNIPPETS.map((s) => (
              <CodeBlock key={s.label} label={s.label} code={s.code} />
            ))}
          </div>
        </details>
      </Section>

      <FinalCTASection />
    </>
  );
}
