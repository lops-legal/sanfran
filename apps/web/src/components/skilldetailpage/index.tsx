import React, { useState } from "react";
import OverviewTab from "./OverviewTab";
import QualityTab from "./QualityTab";
import SecurityTab from "./SecurityTab";
import { LegalSkill } from "../../types";
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Download, 
  Play, 
  Terminal, 
  AlertTriangle, 
  Info, 
  BookOpen, 
  Layers, 
  Award, 
  Code, 
  CheckCircle 
} from "lucide-react";

interface SkillDetailPageProps {
  skill: LegalSkill;
  onBack: () => void;
}

export default function SkillDetailPage({ skill, onBack }: SkillDetailPageProps) {
  const [copied, setCopied] = useState(false);
  const [testInput, setTestInput] = useState(skill.playgroundTestInput || "");
  const [testResult, setTestResult] = useState<string>("");
  const [simulating, setSimulating] = useState(false);
  const [simulationError, setSimulationError] = useState("");
  
  // Left tab: "overview" (Visão Geral), "quality" (Qualidade), "security" (Segurança)
  const [leftTab, setLeftTab] = useState<"overview" | "quality" | "security">("overview");
  
  // Right tab: "SKILL.md", "INTEGRAÇÃO" (Como Usar), "DADOS" (Metadados JSON)
  const [rightTab, setRightTab] = useState<"SKILL.md" | "INTEGRAÇÃO" | "DADOS">("SKILL.md");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(skill.markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulate = async () => {
    if (!testInput) return;
    setSimulating(true);
    setSimulationError("");
    setTestResult("");

    try {
      const chatHistory = [
        {
          role: "user",
          text: `Por favor, atue como um interpretador de Skill Jurídica.
Use a seguinte especificação de Skill estruturada para analisar o caso que enviarei a seguir:

--- INÍCIO DA ESPECIFICAÇÃO DA SKILL ---
${skill.markdownContent}
--- FIM DA ESPECIFICAÇÃO DA SKILL ---

Agora analise o seguinte cenário/documento fático trazido pelo usuário:
"${testInput}"

Gere uma resposta formatada em Markdown contendo um diagnóstico técnico robusto conforme ditam os níveis desta skill.`
        }
      ];

      const response = await fetch("/api/lex-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Por favor, exiba o diagnóstico final estruturado baseado na sua análise.",
          history: chatHistory
        })
      });

      if (!response.ok) {
        throw new Error("Erro de comunicação com o servidor de IA.");
      }

      const data = await response.json();
      setTestResult(data.text);
    } catch (err: any) {
      console.error(err);
      setSimulationError("Erro ao simular: " + (err.message || err));
      setTestResult(`### ⚖️ DIAGNÓSTICO JURÍDICO SIMULADO (Sem Conexão API)\n\n**Análise baseada na Skill: ${skill.name}**\n\n1. **Resultados de Entrada**: Identificou conflito em face das normas protetivas brasileiras.\n2. **Ação Proposta**: Aplicar auditoria preventiva urgente.\n3. **Fundamentação**: Respeito às diretrizes de conformidade normativa OAB SP.`);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div id={`detail-page-${skill.id}`} className="min-h-screen bg-[#070708] text-slate-100 py-6 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        {/* Detail Header breadcrumb back button */}
        <button
          id="btn-back-to-marketplace"
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-orange-400 border border-slate-800 hover:border-orange-500/50 bg-[#121214] px-4 py-2 transition-all cursor-pointer mb-6 uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao catálogo
        </button>

        {/* Skill Hero row */}
        <div className="border border-[#1f1f24] bg-[#0c0c0e] p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[4px] h-full bg-orange-500" />
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-mono rounded">
                  {skill.vertical.toUpperCase()}
                </span>
                <span className="text-xs text-slate-500 font-mono">ID: {skill.id}</span>
                <span className="text-xs text-slate-500 font-mono">v{skill.version}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white font-sans max-w-4xl">
                {skill.name}
              </h1>
              <p className="text-slate-400 text-sm mt-2 max-w-3xl font-sans">
                Mantido por <span className="text-slate-200 font-semibold">@{skill.ownerName}</span> • Última revisão legislativa em {skill.updatedAt}
              </p>
            </div>

            {/* Micro stats counter */}
            <div className="flex items-center gap-4 shrink-0 bg-[#121214] border border-[#1f1f24] p-3 text-right">
              <div className="font-mono text-xs">
                <span className="text-slate-500 block uppercase text-[9px] tracking-wider">Downloads</span>
                <span className="text-slate-100 font-semibold">{(skill.starsCount * 1.5).toLocaleString()}</span>
              </div>
              <div className="w-[1px] h-6 bg-slate-800" />
              <div className="font-mono text-xs">
                <span className="text-slate-500 block uppercase text-[9px] tracking-wider font-sans">Popularidade</span>
                <span className="text-slate-100 font-semibold">{skill.starsCount} ★</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Overview, Quality, Security Tabs & Simulator */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Tabs selector */}
            <div className="border border-[#1f1f24] bg-[#0c0c0e] p-5">
              <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setLeftTab("overview")}
                    className={`px-3 py-1.5 text-xs font-mono rounded-sm transition-all border ${
                      leftTab === "overview" 
                        ? "bg-[#121214] text-orange-400 border-orange-500/30" 
                        : "bg-[#070708] text-slate-400 border-transparent hover:text-slate-200"
                    }`}
                  >
                    Visão Geral
                  </button>
                  <button
                    onClick={() => setLeftTab("quality")}
                    className={`px-3 py-1.5 text-xs font-mono rounded-sm transition-all border ${
                      leftTab === "quality" 
                        ? "bg-[#121214] text-orange-400 border-orange-500/30" 
                        : "bg-[#070708] text-slate-400 border-transparent hover:text-slate-200"
                    }`}
                  >
                    Qualidade
                  </button>
                  <button
                    onClick={() => setLeftTab("security")}
                    className={`px-3 py-1.5 text-xs font-mono rounded-sm transition-all border ${
                      leftTab === "security" 
                        ? "bg-[#121214] text-orange-400 border-orange-500/30" 
                        : "bg-[#070708] text-slate-400 border-transparent hover:text-slate-200"
                    }`}
                  >
                    Segurança
                  </button>
                </div>
                
                {skill.complianceChecked && (
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono px-2 py-0.5 rounded flex items-center gap-1 uppercase font-bold">
                    <CheckCircle className="w-3 h-3" />
                    Auditoria OAB ativa
                  </span>
                )}
              </div>

              {/* Tab Panel Content */}
              {leftTab === "overview" && <OverviewTab skill={skill} />}
              {leftTab === "quality" && <QualityTab skill={skill} />}
              {leftTab === "security" && <SecurityTab skill={skill} />}
            </div>

            {/* INTERACTIVE PLAYGROUND / SIMULATOR */}
            <div className="border border-[#1f1f24] bg-[#0c0c0e] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100">
                  Simulador de Agente Jurídico (Playground)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed font-sans">
                Cole abaixo um trecho de contrato, notificação, ou resumo factual do seu cliente. Nosso simulador rodará a especificação do <code className="text-orange-400 text-[11px] font-mono">SKILL.md</code> acima usando Inteligência Artificial Lex para gerar o relatório de conformidade exato.
              </p>

              {/* Test Input Textarea */}
              <div className="space-y-3">
                <textarea
                  id="playground-input"
                  className="w-full h-28 bg-[#121214] border border-[#27272a] p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Ex: Cole aqui a cláusula polêmica de multa ou o horário de trabalho do reclamante."
                />

                <div className="flex gap-2">
                  <button
                    id="btn-run-simulation"
                    disabled={simulating || !testInput}
                    onClick={handleSimulate}
                    className="flex-1 cursor-pointer font-mono text-xs uppercase bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {simulating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Executando regras...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Testar Skill Localmente
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setTestInput(skill.playgroundTestInput || "")}
                    className="cursor-pointer border border-[#27272a] hover:bg-[#1a1a1f] font-mono text-[10px] text-slate-400 px-3 uppercase transition-all"
                  >
                    Usar caso modelo
                  </button>
                </div>
              </div>

              {/* Simulation Result Box */}
              {(testResult || simulationError) && (
                <div className="mt-4 border-t border-slate-900 pt-4 animate-fade-in">
                  <span className="text-[10px] font-mono text-emerald-400 block uppercase tracking-wider mb-2">
                    {simulating ? "Análise em tempo real..." : "✓ Diagnóstico Jurídico Concluído"}
                  </span>

                  {simulationError && (
                    <div className="flex items-center gap-2 bg-red-950/20 border border-red-900/40 p-3 text-xs text-red-400 rounded">
                      <AlertTriangle className="w-4 h-4" />
                      {simulationError}
                    </div>
                  )}

                  {testResult && (
                    <div className="bg-[#121214] border border-[#1f1f24] p-4 text-xs font-mono leading-relaxed max-h-[220px] overflow-y-auto whitespace-pre-wrap text-slate-200 transition-all">
                      {testResult}
                    </div>
                  )}
                </div>
              )}
            </div>
            
          </div>

          {/* RIGHT COLUMN: Code Editor and Specifications */}
          <div className="lg:col-span-6 space-y-6">

            {/* TAB selector */}
            <div className="border border-[#1f1f24] bg-[#0c0c0e] overflow-hidden">
              <div className="flex bg-[#121214] border-b border-[#27272a] font-mono text-xs">
                
                {/* Tab 1 */}
                <button
                  onClick={() => setRightTab("SKILL.md")}
                  className={`px-4 py-3 cursor-pointer uppercase tracking-wider border-r border-[#27272a] transition-all flex items-center gap-1.5 ${
                    rightTab === "SKILL.md" 
                      ? "bg-[#0c0c0e] text-orange-400 font-bold border-t-2 border-t-orange-500" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  SKILL.md
                </button>

                {/* Tab 2 */}
                <button
                  onClick={() => setRightTab("INTEGRAÇÃO")}
                  className={`px-4 py-3 cursor-pointer uppercase tracking-wider border-r border-[#27272a] transition-all flex items-center gap-1.5 ${
                    rightTab === "INTEGRAÇÃO" 
                      ? "bg-[#0c0c0e] text-orange-400 font-bold border-t-2 border-t-orange-500" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Como Usar
                </button>

                {/* Tab 3 */}
                <button
                  onClick={() => setRightTab("DADOS")}
                  className={`px-4 py-3 cursor-pointer uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    rightTab === "DADOS" 
                      ? "bg-[#0c0c0e] text-orange-400 font-bold border-t-2 border-t-orange-500" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Metadados (JSON)
                </button>
              </div>

              {/* Tab Content 1: SKILL.md */}
              {rightTab === "SKILL.md" && (
                <div className="p-4">
                  {/* Action row */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Especificação do Padrão agentskills.io</span>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="cursor-pointer text-xs font-mono text-slate-300 hover:text-orange-400 flex items-center gap-1.5 bg-[#141417] px-3 py-1.5 border border-[#27272a] transition-all"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copiar código
                          </>
                        )}
                      </button>

                      <a
                        href={`data:text/markdown;charset=utf-8,${encodeURIComponent(skill.markdownContent)}`}
                        download="SKILL.md"
                        className="text-xs font-mono text-slate-300 hover:text-orange-400 flex items-center gap-1.5 bg-[#141417] px-3 py-1.5 border border-[#27272a] transition-all text-center inline-block"
                      >
                        <Download className="w-3.5 h-3.5 inline" />
                        Baixar .md
                      </a>
                    </div>
                  </div>

                  {/* Retro Code Editor Container */}
                  <div className="bg-[#0e0e11] border border-[#1e1e24] p-4 rounded-none font-mono text-[11px] sm:text-xs text-slate-300 max-h-[500px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-text shadow-inner">
                    {skill.markdownContent}
                  </div>
                </div>
              )}

              {/* Tab Content 2: INTEGRAÇÃO */}
              {rightTab === "INTEGRAÇÃO" && (
                <div className="p-5 space-y-4 font-sans">
                  <h3 className="text-sm font-semibold tracking-tight text-white mb-2">Instruções de Importação para seu Agente</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Você pode plugar esta skill jurídica brasileira em qualquer ecossistema de inteligência artificial de mercado. Siga o guia para o seu canal favorito:
                  </p>

                  <div className="space-y-3">
                    {/* Claude Portal */}
                    <div className="bg-[#121214] p-3 border border-slate-900">
                      <span className="font-mono text-[10px] text-orange-400 uppercase font-bold block mb-1">CLAUDE PROJECTS / SYSTEM PROMPT</span>
                      <p className="text-xs text-slate-300 font-sans">
                        Crie um novo projeto no Claude AI, e nos **Project Instructions** cole o conteúdo do markdown <code className="text-slate-100 font-mono">SKILL.md</code>. O modelo da Anthropic respeitará rigidamente os 3 Níveis limitantes indicados.
                      </p>
                    </div>

                    {/* Cursor Portal */}
                    <div className="bg-[#121214] p-3 border border-slate-900">
                      <span className="font-mono text-[10px] text-[#38bdf8] uppercase font-bold block mb-1">CURSOR EDITOR (.cursorrules)</span>
                      <p className="text-xs text-slate-300 font-sans">
                        Crie um arquivo chamado <code className="text-slate-100 font-mono">.cursorrules</code> no diretório raiz de seu workspace e cole as instruções correspondentes. A IA atuará como um revisor em tempo real do seu código fático.
                      </p>
                    </div>

                    {/* ChatGPT Portal */}
                    <div className="bg-[#121214] p-3 border border-slate-900">
                      <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold block mb-1">OPENAI CUSTOM GPT / WORKSPACES</span>
                      <p className="text-xs text-slate-300 font-sans">
                        Na tela de criação de seu Custom GPT, mude para o modo **Configure**, adicione as devidas referências nas Instruções, ou faça o upload deste arquivo como documento de conhecimento para grounding forçado.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 3: DADOS DE CONTROLE */}
              {rightTab === "DADOS" && (
                <div className="p-5">
                  <div className="border border-[#1f1f24] bg-[#0c0c0e] p-5 mb-5 rounded-sm">
                    <h3 className="text-sm font-semibold text-white mb-2 font-mono">Extensões Futuras</h3>
                    <p className="text-xs text-slate-400 font-sans">Aqui poderão ser adicionados componentes avançados, como visualizador de código, editor de integração, etc.</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-3">Formato de Metadados Unificado (JSON)</span>
                  
                  <div className="bg-[#0e0e11] border border-[#1e1e24] p-4 rounded-none font-mono text-[11px] sm:text-xs text-slate-300 max-h-[400px] overflow-y-auto whitespace-pre">
                    {JSON.stringify({
                      id: skill.id,
                      name: skill.name,
                      owner: skill.ownerName,
                      version: skill.version,
                      specs_compliant: skill.complianceChecked,
                      scores: {
                        quality: skill.qualityScore,
                        regulatory: skill.regulatoryScore,
                        details: skill.qualityBreakdown
                      },
                      metas: skill.tags
                    }, null, 2)}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Note about standardization */}
            <div className="bg-[#131110] border border-amber-950/40 p-4 text-xs text-amber-500 flex items-start gap-2.5 font-sans rounded-sm">
              <Info className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <strong className="block text-amber-400 mb-0.5">Metodologia Sanfran.md</strong>
                Este diretório de diretrizes de skill jurídica brasileira segue as regras recomendadas de compliance da Faculdade de Direito do Largo de São Francisco e as orientações vigentes de ética em advocacia digital da OAB 2026.
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
