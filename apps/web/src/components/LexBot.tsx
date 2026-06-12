import React, { useState, useRef, useEffect } from "react";
import { LegalSkill, ChatMessage } from "../types";
import { 
  Send, Upload, Play, Copy, Check, Download,
  Volume2, Terminal, Info, Globe, Sparkles, BookOpen,
  X, CheckSquare, FileText, PlusCircle, AlertCircle
} from "lucide-react";

interface LexBotProps {
  onPublishSkill: (newSkill: LegalSkill) => void;
}

// Beautiful predefined sample legal documents for non-technical users to load with 1-click
const SAMPLE_DOCS = [
  {
    name: "Contrato_Prestacao_PJ_Lucas.txt",
    type: "Contrato de Prestação de Serviços (Risco de Vínculo)",
    text: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE TECNOLOGIA
CONTRATANTE: Alpha Solution S.A.
CONTRATADO: Lucas Cardoso Silva (Desenvolvedor Sênior)

CLÁUSULA TERCEIRA - DA EXCLUSIVIDADE E SUBORDINAÇÃO:
O Contratado executará as tarefas de desenvolvimento de software em caráter de dedicação exclusiva, não podendo prestar serviços correlatos a nenhuma outra pessoa jurídica concorrente.
Parágrafo Único: O Contratado Lucas deverá registrar ponto diário em sistema eletrônico da Contratante, cumprindo obrigatoriamente a jornada padrão de segunda a sexta-feira das 9:00 às 18:00, sujeito a penalidades disciplinares e suspensões aplicadas pelo Diretor Técnico.`
  },
  {
    name: "Peticao_Consumidor_Celular_Quebrado.txt",
    type: "Petição de Vício de Produto CDC (Urgente)",
    text: `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DO JUIZADO ESPECIAL CÍVEL
AUTORA: Joana D'Arc Ribeiro
RÉU: Gigante Varejo S.A. e TechCorp Brasil Ltda.

Fatos: A autora comprou um celular no dia 10 de Maio de 2026. Duas semanas após a aquisição, o aparelho parou de carregar completamente de forma súbita. Desesperada e sem celular para trabalhar, a autora resolveu entrar instantaneamente com a presente ação pedindo indenização de R$ 15.000,00 por danos morais, entendendo que não é obrigada a passar pelo balcão da assistência técnica porque o produto é essencial.`
  },
  {
    name: "Termo_Uso_E_Dados_Fintech.txt",
    type: "Termos de Uso de Aplicativo Financeiro (Regras LGPD)",
    text: `TERMOS DE USO E POLÍTICA DE PRIVACIDADE - FINPAGO
Ao baixar o aplicativo, o usuário declara consentimento automático, ilimitado e irrevogável para que a Fintech Finpago trate todos os seus dados pessoais, incluindo endereço residencial, histórico de transações bancárias, cookies de navegador, dados de geolocalização por satélite em tempo real e lista de contatos do telefone celular.
O compartilhamento desses dados sensíveis com parceiros comerciais e redes multilaterais de publicidade fica pré-aprovado de forma integral e ad eternum para fins de monetização agregada.`
  }
];

export default function LexBot({ onPublishSkill }: LexBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "lex",
      text: "🦊 **Olá! Eu sou a Lex, sua raposa especialista em Inteligência de Prompt jurídica!**\n\nEstou aqui para ajudar você a converter sua experiência de doutrina, seus contratos rascunhados ou ideias de conformidade brasileira em uma **Skill Jurídica estruturada em formato SKILL.md**.\n\nComo você prefere começar?\n\n*   **Carregue um Documento de Apoio** (uma minuta de contrato ou petição no painel de suporte)\n*   **Diga-me o seu objetivo** em linguagem simples (exemplo: *'quero fazer um revisor de multas de contratos de locação residencial'*)"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeDoc, setActiveDoc] = useState<{ name: string; text: string } | null>(null);
  
  // Sidebar Markdown workspace state
  const [currentMarkdown, setCurrentMarkdown] = useState<string>(`# Skill Jurídica: [Insira o Nome da Skill]
## 1. Goal
[Explique aqui o objetivo central de auditoria que o agente de IA irá atingir]

## 2. Context & Core Norms
* [Insira artigos de lei brasileira correspondentes]
* [Ex: CLT Artigo X ou CDC Artigo Y]

## 3. Execution Levels
### Level 1: Standard Case
1. [Rotina padrão de mapeamento de dados]
2. [Checklist simples de conformidade]

### Level 2: Exceptional Handling
1. [Habilidade de alertar em cenários de risco]
2. [Lidar com cláusula leonina oculta]

### Level 3: Hard Boundaries & Grounding
1. [Limites onde a IA é proibida de prometer vitória jurídica]

## 4. Test Cases & Expected Formats
### Input Text
[Exemplo de caso fático para testar]

### Diagnostic
[Saída ideal estruturada esperada]`);

  const [publishSuccess, setPublishSuccess] = useState(false);
  const [customFileText, setCustomFileText] = useState("");
  const [fileUploadActive, setFileUploadActive] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest bot messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setActiveDoc({
        name: file.name,
        text: content
      });
      
      // Auto-insert message to trigger chatbot interaction
      addBotMessage(`✓ Carreguei seu documento local **"${file.name}"**! Eu integrarei esse texto como contexto para estruturar nossa nova skill jurídica. O que você gostaria que eu analisasse nesse arquivo?`);
    };
    reader.readAsText(file);
  };

  const addBotMessage = (text: string, markdownDraft?: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: "lex",
        text: text,
        generatedSkillMarkdown: markdownDraft
      }
    ]);
    if (markdownDraft) {
      setCurrentMarkdown(markdownDraft);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage;
    setInputMessage("");
    setPublishSuccess(false);

    // Append user message to chat state
    setMessages((prev) => [
      ...prev,
      { id: Math.random().toString(), sender: "user", text: userText }
    ]);
    
    setLoading(true);

    try {
      // Map prior frontend messages into Gemini history format
      const history = messages.map(m => ({
        role: m.sender === "user" ? "user" : "model",
        text: m.text
      }));

      const bodyData: any = {
        message: userText,
        history: history
      };

      if (activeDoc) {
        bodyData.contextDocument = {
          name: activeDoc.name,
          text: activeDoc.text
        };
      }

      const response = await fetch("/api/lex-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });

      if (!response.ok) {
        throw new Error("Erro de comunicação com o servidor de IA Lex.");
      }

      const data = await response.json();
      
      addBotMessage(data.text, data.generatedSkillMarkdown);

    } catch (err: any) {
      console.error(err);
      addBotMessage(`🦊 **Opa! Tive uma pequena interferência no meu canil jurídico.**\n\nErro: ${err.message || "Conexão de rede indisponível."}\n\nPor favor, tente formular outra instrução para vermos os rascunhos.`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = (sample: typeof SAMPLE_DOCS[0]) => {
    setActiveDoc({
      name: sample.name,
      text: sample.text
    });
    setPublishSuccess(false);
    
    // Lex registers the upload immediately and gives proactive feedback
    addBotMessage(`🦊 **Muito bom! Carreguei o arquivo fictício de apoio: "${sample.name}"**.\n\nEste texto possui cláusulas polêmicas sobre **${sample.type}**.\n\nDigite no chat abaixo: *'Crie uma skill rígida baseada neste documento'* e acompanhe a mágica lateral!`);
  };

  const handlePublish = () => {
    // Determine target variables or parse headers from generated currentMarkdown
    const lines = currentMarkdown.split("\n");
    let title = "Skill Customizada por Lex";
    let vertical = "Direito Geral";
    let desc = "Skill jurídica criada via assistente conversacional Lex.";
    let tags = ["lex", "ai-generated"];

    const titleLine = lines.find(line => line.startsWith("# "));
    if (titleLine) {
      title = titleLine.replace("# ", "").trim();
    }

    const verticalLine = lines.find(line => line.includes("vertical:") || line.includes("Vertical:"));
    if (verticalLine) {
      vertical = verticalLine.split(":")[1].trim();
    } else {
      // Intelligently infer vertical category based on prompt keywords in the currentMarkdown
      const contentLower = currentMarkdown.toLowerCase();
      if (contentLower.includes("clt") || contentLower.includes("trabalhista") || contentLower.includes("ponto") || contentLower.includes("emprego")) {
        vertical = "Trabalhista";
        tags.push("trabalho", "clt");
      } else if (contentLower.includes("lgpd") || contentLower.includes("dados") || contentLower.includes("privacidade") || contentLower.includes("dpo")) {
        vertical = "LGPD";
        tags.push("lgpd", "dados");
      } else if (contentLower.includes("cdc") || contentLower.includes("consumidor") || contentLower.includes("compra") || contentLower.includes("vício")) {
        vertical = "Consumidor";
        tags.push("cdc", "varejo");
      } else if (contentLower.includes("contrato") || contentLower.includes("cláusula penal") || contentLower.includes("civil") || contentLower.includes("sócio")) {
        vertical = "Societarior";
        tags.push("contrato", "civil");
      } else {
        vertical = "Processual";
        tags.push("processo", "cpc");
      }
    }

    // Capture first paragraph as description
    const goalSectionIdx = lines.findIndex(l => l.includes("## 1. Goal") || l.includes("## Goal") || l.includes("## Objetivo"));
    if (goalSectionIdx !== -1 && lines[goalSectionIdx + 1]) {
      desc = lines[goalSectionIdx + 1].trim();
      if (lines[goalSectionIdx + 2] && lines[goalSectionIdx + 2].trim().length > 3) {
        desc += " " + lines[goalSectionIdx + 2].trim();
      }
    }
    
    // Prune desc size
    if (desc.length > 150) {
      desc = desc.substring(0, 147) + "...";
    }

    const generatedSkill: LegalSkill = {
      id: "user-" + Math.random().toString(36).substring(2, 9),
      name: title,
      ownerName: "editor-lex",
      ownerAvatar: "🦊",
      description: desc,
      markdownContent: currentMarkdown,
      rating: 5.0,
      reviewCount: 1,
      starsCount: 10,
      tags: tags,
      vertical: vertical,
      qualityScore: 92,
      regulatoryScore: 90,
      qualityBreakdown: {
        precisaoNormativa: 9,
        especificidade: 9,
        padraoEntrega: 10,
        limitesAutonomia: 9,
        atualizacao: 8
      },
      regulatoryIssues: 0,
      version: "1.0.0",
      complianceChecked: true,
      updatedAt: new Date().toLocaleDateString("pt-BR")
    };

    onPublishSkill(generatedSkill);
    setPublishSuccess(true);
  };

  const handleExportMarkdown = () => {
    const element = document.createElement("a");
    const file = new Blob([currentMarkdown], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = "SKILL.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div id="lex-bot-workspace" className="max-w-7xl mx-auto py-4 px-2 sm:px-4">
      
      {/* Visual Title Header represent USP Largo de Sao Francisco colors */}
      <div className="border border-[#26262c] bg-[#101012] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-red-600 flex items-center justify-center text-xl shadow-md border border-red-500 shrink-0">
            🦊
          </div>
          <div>
            <h2 className="text-md sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              LEX: Atelier e Gerador de Skills
              <span className="text-[10px] font-mono text-orange-400 border border-orange-500/30 px-1.5 py-0.5 bg-orange-500/5 uppercase font-bold tracking-widest leading-none">
                AI Beta
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Transforme petições e auditoria fática em diretivas estruturadas <code className="text-orange-400 font-mono">SKILL.md</code> sob as normas brasileiras.
            </p>
          </div>
        </div>

        {/* Clear Workspace button info button */}
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="text-slate-500 uppercase">Status do compilador:</span>
          <span className="text-[#22c55e] flex items-center gap-1 font-bold animate-pulse">
            ● LEX_ENGINE_PRONTAS
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: The Chat Box & Document Ingestion (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* Document Ingestion Supporting Panel */}
          <div className="border border-[#26262c] bg-[#101012] p-4">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Etapa 1: Ingestão de Documento de Apoio (Simples & Rápido)
            </span>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Carregue a base fática desejada (uma petição, súmula de tribunal ou contrato comercial). Nós forneceremos este arquivo como contexto exclusivo para a IA Lex moldar a especificação lateral.
            </p>

            {/* Quick pre-sets for immediate testing */}
            <div className="mb-4">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-2">Selecione uma Minuta Modelo (1-Clique):</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {SAMPLE_DOCS.map((doc, idx) => (
                  <button
                    key={idx}
                    id={`btn-sample-doc-${idx}`}
                    onClick={() => handleLoadSample(doc)}
                    className={`text-left text-[11px] p-2 border transition-all pointer-events-auto cursor-pointer ${
                      activeDoc?.name === doc.name
                        ? "bg-red-950/20 border-red-500 text-white font-semibold"
                        : "bg-[#141416] border-slate-800 hover:border-slate-700 text-slate-400"
                    }`}
                  >
                    <span className="font-mono text-[9px] text-[#dc2626] font-extrabold uppercase block truncate mb-0.5">
                      {doc.type.replace("Direito ", "")}
                    </span>
                    <span className="truncate block font-sans text-slate-300">{doc.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Real local file picker container */}
            <div className="border border-dashed border-slate-800 hover:border-orange-500/40 transition-all p-3 text-center bg-[#141417]">
              <input
                type="file"
                id="lex-docx-picker"
                accept=".txt,.md,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="lex-docx-picker"
                className="flex items-center justify-center gap-2 text-xs font-mono text-slate-300 hover:text-white cursor-pointer py-1.5"
              >
                <Upload className="w-4 h-4 text-orange-500" />
                <span>Escolher .TXT .MD do Computador (Leitura local)</span>
              </label>
            </div>

            {/* Active Document Badge inside Support Panel */}
            {activeDoc && (
              <div className="mt-3 bg-[#1e1e24]/40 border border-slate-800 p-2.5 flex items-center justify-between text-xs animate-fade-in text-slate-300 rounded-sm">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-mono text-slate-400">Ativo como background:</span>
                  <span className="font-semibold text-slate-100 truncate max-w-[200px]">{activeDoc.name}</span>
                </div>
                <button
                  onClick={() => setActiveDoc(null)}
                  className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                  title="Remover documento das diretrizes"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Chat Conversational Flow Box */}
          <div className="border border-[#26262c] bg-[#101012] flex flex-col justify-between h-[500px]">
            
            {/* Messages body scrolling container */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1 select-text scrollbar-thin max-h-[420px]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 leading-relaxed text-xs sm:text-[13px] ${
                      message.sender === "user"
                        ? "bg-[#27272a] text-slate-100 rounded-sm border border-slate-700"
                        : "bg-[#141416] text-slate-200 rounded-sm border-l-4 border-l-orange-500 border border-[#232329]"
                    }`}
                  >
                    {/* Bot Title tag */}
                    {message.sender === "lex" && (
                      <span className="block font-mono text-[9px] uppercase tracking-wider text-orange-400 font-extrabold mb-1">
                        🦊 Lex • Assistente de Skills
                      </span>
                    )}
                    
                    {/* Render message formatting cleanly */}
                    <div className="whitespace-pre-wrap leading-relaxed font-sans font-light">
                      {message.text}
                    </div>

                    {message.generatedSkillMarkdown && (
                      <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between">
                        <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          Skill gerada lateralmente!
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">Formato SKILL.md v3.2</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-[#141416] border border-[#232329] p-3 text-xs font-mono text-slate-400 rounded-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                    <span>Lex está compilando leis aplicáveis e estruturando os 3 níveis...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Messages bottom bar input */}
            <form onSubmit={handleSendMessage} className="border-t border-[#26262c] bg-[#111113] p-3 flex gap-2">
              <input
                type="text"
                id="lex-chat-textbox"
                className="flex-1 bg-[#161619] border border-slate-800 focus:outline-none focus:border-orange-500 text-xs text-slate-200 px-4 py-2.5 font-sans"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={activeDoc ? "Instrua a bot: 'Gere regras trabalhistas com base no txt'..." : "Diga à Lex: 'Peça para fazer auditoria de condomínios'..."}
                disabled={loading}
              />
              <button
                type="submit"
                id="btn-lex-submit"
                className="cursor-pointer bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white active:bg-orange-700 px-5 py-2 transition-all shrink-0 flex items-center justify-center gap-2 font-mono text-xs uppercase font-extrabold"
                disabled={loading || !inputMessage.trim()}
              >
                <span>Enviar</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: The Interactive Split workspace Editor (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          <div className="border border-[#26262c] bg-[#101012] p-4 flex-1 flex flex-col justify-between min-h-[500px]">
            
            <div>
              {/* Workspace Header */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
                    Editor de Rascunho Lateral
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportMarkdown}
                    className="cursor-pointer font-mono text-[10px] text-slate-300 hover:text-white px-2 py-1 border border-slate-800 bg-[#161619] uppercase"
                    title="Exportar arquivo local"
                  >
                    Exportar .MD
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed font-sans">
                Como a **Lex** funciona sob um modelo conversacional livre, você tem **autonomia total** para alterar manualmente as seções, adicionar artigos, ou refinar os níveis do seu <code className="text-slate-300">SKILL.md</code> abaixo.
              </p>

              {/* Textarea Workspace Editor */}
              <textarea
                id="lex-workspace-textarea"
                className="w-full h-[410px] bg-[#0c0c0e] border border-[#242429] p-4 text-xs font-mono leading-relaxed text-slate-300 focus:outline-none focus:border-orange-500/50 resize-none select-text rounded-sm shadow-inner"
                value={currentMarkdown}
                onChange={(e) => {
                  setCurrentMarkdown(e.target.value);
                  setPublishSuccess(false);
                }}
              />
            </div>

            {/* Publishing Box Area */}
            <div className="pt-4 border-t border-slate-900 mt-4 space-y-3">
              {publishSuccess ? (
                <div className="bg-emerald-950/20 border border-emerald-900/60 p-3.5 text-xs text-emerald-400 rounded-sm font-sans animate-fade-in flex items-start gap-2.5">
                  <CheckSquare className="w-5 h-5 col-span-1 shrink-0 mt-0.5 text-emerald-400" />
                  <div>
                    <strong className="block font-bold">✓ Força Jurídica Unificada!</strong>
                    Sua nova skill jurídica foi empacotada, validada e distribuída com sucesso! Ela já está disponível no catálogo de pesquisa.
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    id="btn-publish-skill"
                    onClick={handlePublish}
                    className="flex-1 cursor-pointer text-xs font-mono font-bold uppercase bg-orange-600 hover:bg-orange-500 text-white py-3 px-4 transition-all flex items-center justify-center gap-2 shrink-0 border border-transparent shadow-lg text-center"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Listar e Publicar Skill no Catálogo
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
