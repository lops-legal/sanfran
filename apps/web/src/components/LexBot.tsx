import React, { useState, useRef, useEffect } from "react";
import { LegalSkill, ChatMessage } from "../types";
import { 
  Send, Upload, Copy, Check, Download,
  Terminal, Sparkles, X, CheckSquare, FileText, PlusCircle,
  PanelLeft, PanelRight, Paperclip, MessageSquare, Plus, Settings, ChevronRight
} from "lucide-react";

interface LexBotProps {
  onPublishSkill: (newSkill: LegalSkill) => void;
}

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeDoc, setActiveDoc] = useState<{ name: string; text: string } | null>(null);
  
  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isArtifactOpen, setIsArtifactOpen] = useState(false);
  
  // Artifact Workspace state
  const [currentMarkdown, setCurrentMarkdown] = useState<string>("");
  const [publishSuccess, setPublishSuccess] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      addBotMessage(`✓ Carreguei seu documento local **"${file.name}"**!\nO que você gostaria que eu analisasse nesse arquivo para começarmos a criar sua skill jurídica?`);
    };
    reader.readAsText(file);
    e.target.value = ""; // reset input
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
      setIsArtifactOpen(true); // Auto-open artifact when new markdown is generated
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage;
    setInputMessage("");
    setPublishSuccess(false);

    setMessages((prev) => [
      ...prev,
      { id: Math.random().toString(), sender: "user", text: userText }
    ]);
    
    setLoading(true);

    try {
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
        throw new Error("Erro de comunicação com o servidor.");
      }

      const data = await response.json();
      addBotMessage(data.text, data.generatedSkillMarkdown);

    } catch (err: any) {
      console.error(err);
      addBotMessage(`🦊 **Ops!**\nErro: ${err.message || "Conexão de rede indisponível."}\n\nPor favor, tente novamente.`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLoadSample = (sample: typeof SAMPLE_DOCS[0]) => {
    setActiveDoc({
      name: sample.name,
      text: sample.text
    });
    setPublishSuccess(false);
    
    if (messages.length === 0) {
      addBotMessage(`🦊 **Carreguei o arquivo: "${sample.name}"**.\n\nEste texto trata de **${sample.type}**.\n\nDigite abaixo como você quer que eu crie uma skill jurídica a partir dele.`);
    } else {
      addBotMessage(`✓ Documento substituído por **"${sample.name}"**.\nO que fazemos agora?`);
    }
  };

  const handlePublish = () => {
    const lines = currentMarkdown.split("\n");
    let title = "Skill Customizada por Lex";
    let vertical = "Direito Geral";
    let desc = "Skill jurídica criada via assistente conversacional Lex.";
    let tags = ["lex", "ai-generated"];

    const titleLine = lines.find(line => line.startsWith("# "));
    if (titleLine) {
      title = titleLine.replace("# ", "").trim();
    }

    const contentLower = currentMarkdown.toLowerCase();
    if (contentLower.includes("clt") || contentLower.includes("trabalhista")) {
      vertical = "Trabalhista";
      tags.push("trabalho", "clt");
    } else if (contentLower.includes("lgpd") || contentLower.includes("dados")) {
      vertical = "LGPD";
      tags.push("lgpd", "dados");
    } else if (contentLower.includes("cdc") || contentLower.includes("consumidor")) {
      vertical = "Consumidor";
      tags.push("cdc", "varejo");
    } else {
      vertical = "Processual";
      tags.push("processo");
    }

    const goalSectionIdx = lines.findIndex(l => l.includes("## 1. Goal") || l.includes("## Goal"));
    if (goalSectionIdx !== -1 && lines[goalSectionIdx + 1]) {
      desc = lines[goalSectionIdx + 1].trim();
    }
    if (desc.length > 150) desc = desc.substring(0, 147) + "...";

    const generatedSkill: LegalSkill = {
      id: "user-" + Math.random().toString(36).substring(2, 9),
      name: title,
      ownerName: "editor-lex",
      ownerAvatar: "🦊",
      description: desc,
      markdownContent: currentMarkdown,
      rating: 5.0,
      reviewCount: 1,
      starsCount: 1,
      tags: tags,
      vertical: vertical,
      qualityScore: 95,
      regulatoryScore: 98,
      qualityBreakdown: { precisaoNormativa: 9, especificidade: 10, padraoEntrega: 10, limitesAutonomia: 9, atualizacao: 9 },
      regulatoryIssues: 0,
      version: "1.0.0",
      complianceChecked: true,
      updatedAt: new Date().toLocaleDateString("pt-BR"),
      authorOrganization: "Lex AI Atelier",
      authorProfile: "#",
      objective: "Análise automatizada gerada por inteligência artificial.",
      useCase: "Auditar conformidade jurídica do caso inserido.",
      legalArea: "Geral",
      workflow: "Análise automática",
      professionalRole: "Advogado / Analista",
      securityCriteria: [],
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
    <div className="flex h-[calc(100vh-76px)] bg-[#09090b] text-slate-200 overflow-hidden font-sans">
      
      {/* 1. LEFT SIDEBAR (Claude-style history) */}
      <div 
        className={`${isSidebarOpen ? "w-[260px] md:w-[300px]" : "w-0"} flex-shrink-0 transition-all duration-300 ease-in-out bg-[#0c0c0e] border-r border-[#1f1f24] flex flex-col`}
      >
        <div className="p-4 flex-1 overflow-y-auto">
          <button 
            onClick={() => {
              setMessages([]);
              setActiveDoc(null);
              setCurrentMarkdown("");
              setIsArtifactOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg py-2.5 px-4 font-medium transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Sessão
          </button>

          <div className="mt-8">
            <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-3">Histórico Recente</h3>
            <div className="space-y-0.5">
              <button className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#18181b] text-orange-400 border border-[#27272a] text-sm">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="truncate">Criação de Skill CDC</span>
              </button>
              <button className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#18181b] text-slate-400 hover:text-slate-200 transition-colors text-sm">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="truncate">Auditoria Contrato PJ</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#1f1f24]">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#18181b] text-slate-400 hover:text-slate-200 transition-colors text-sm">
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">LC</div>
            <span className="truncate font-medium">Lucas Cardoso</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-[#09090b]">
        
        {/* Top Header */}
        <div className="h-14 flex-shrink-0 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-200 rounded-md hover:bg-[#18181b] transition-colors"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-slate-100 flex items-center gap-2">
              Lex AI
              <span className="text-[9px] font-mono text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded-full bg-orange-500/5 uppercase tracking-widest leading-none">Beta</span>
            </span>
          </div>

          {currentMarkdown && (
            <button 
              onClick={() => setIsArtifactOpen(!isArtifactOpen)}
              className={`p-2 text-slate-400 hover:text-slate-200 rounded-md hover:bg-[#18181b] transition-colors ${isArtifactOpen ? 'text-orange-400 bg-orange-400/10' : ''}`}
              title="Abrir Editor da Skill"
            >
              <PanelRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Chat Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 pb-32">
          <div className="max-w-3xl mx-auto w-full pt-8 pb-4">
            
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full mt-20 animate-fade-up-heavy">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-3xl mb-6 shadow-[0_0_30px_rgba(249,115,22,0.1)]">
                  🦊
                </div>
                <h2 className="text-2xl font-semibold text-slate-100 mb-2">Como posso ajudar?</h2>
                <p className="text-slate-400 text-sm mb-8 text-center max-w-md">
                  Sou a Lex. Posso criar diretrizes de auditoria (SKILL.md) analisando documentos, leis ou seu pedido direto.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                  {SAMPLE_DOCS.slice(0, 2).map((doc, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLoadSample(doc)}
                      className="text-left p-4 rounded-xl border border-[#27272a] bg-[#18181b] hover:border-orange-500/50 hover:bg-[#18181b]/80 transition-all group"
                    >
                      <span className="font-medium text-slate-200 block mb-1 text-sm">{doc.type.split(" (")[0]}</span>
                      <span className="text-xs text-slate-500 block truncate group-hover:text-slate-400">{doc.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    
                    {msg.sender === "lex" && (
                      <div className="w-8 h-8 rounded-full bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-sm shrink-0 mr-4 mt-1">
                        🦊
                      </div>
                    )}
                    
                    <div className={`max-w-[85%] ${
                      msg.sender === "user" 
                        ? "bg-[#27272a] text-slate-100 px-5 py-3.5 rounded-2xl rounded-tr-sm text-[15px] shadow-sm leading-relaxed" 
                        : "text-slate-200 text-[15px] leading-relaxed pt-1.5"
                    }`}>
                      <div className="whitespace-pre-wrap font-light">{msg.text}</div>
                      
                      {msg.generatedSkillMarkdown && !isArtifactOpen && (
                        <button 
                          onClick={() => setIsArtifactOpen(true)}
                          className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] rounded-lg text-sm text-slate-300 transition-colors group"
                        >
                          <Terminal className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">Abrir Rascunho SKILL.md</span>
                          <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex w-full justify-start">
                    <div className="w-8 h-8 rounded-full bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-sm shrink-0 mr-4 mt-1 animate-pulse">
                      🦊
                    </div>
                    <div className="text-slate-400 text-sm pt-2.5 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: "0ms"}} />
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: "150ms"}} />
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: "300ms"}} />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Input Area */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent pt-10 pb-6 px-4">
          <div className="max-w-3xl mx-auto relative">
            
            {activeDoc && (
              <div className="absolute -top-10 left-0 flex items-center gap-2 bg-[#18181b] border border-[#27272a] px-3 py-1.5 rounded-full text-xs text-slate-300 shadow-md">
                <FileText className="w-3.5 h-3.5 text-orange-400" />
                <span className="truncate max-w-[150px] sm:max-w-[250px]">{activeDoc.name}</span>
                <button onClick={() => setActiveDoc(null)} className="ml-1 text-slate-500 hover:text-red-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form 
              onSubmit={handleSendMessage} 
              className="bg-[#18181b] border border-[#27272a] rounded-2xl p-2.5 flex items-end gap-2 shadow-2xl focus-within:border-orange-500/50 transition-colors"
            >
              <div className="relative shrink-0">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".txt,.md,.json"
                />
                <label 
                  htmlFor="file-upload"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-[#27272a] cursor-pointer transition-colors"
                  title="Anexar documento de apoio"
                >
                  <Paperclip className="w-4.5 h-4.5" />
                </label>
              </div>
              
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={activeDoc ? "Instrua a Lex sobre o documento anexo..." : "Peça para gerar ou auditar uma regra jurídica..."}
                className="flex-1 bg-transparent border-none focus:outline-none text-slate-200 text-[15px] resize-none py-1.5 max-h-[200px] min-h-[44px] overflow-y-auto scrollbar-thin placeholder:text-slate-500"
                rows={1}
                disabled={loading}
              />
              
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-all ${
                  inputMessage.trim() && !loading 
                    ? "bg-orange-600 text-white hover:bg-orange-500 shadow-lg" 
                    : "bg-[#27272a] text-slate-500 cursor-not-allowed"
                }`}
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
            <div className="text-center mt-2">
              <span className="text-[10px] text-slate-500">Lex pode cometer erros de formatação. Verifique a Skill antes de publicar.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RIGHT ARTIFACT PANEL (Editor) */}
      <div 
        className={`${isArtifactOpen ? "w-[400px] lg:w-[480px]" : "w-0"} flex-shrink-0 transition-all duration-300 ease-in-out bg-[#0c0c0e] border-l border-[#1f1f24] flex flex-col z-10 shadow-2xl overflow-hidden`}
      >
        {/* Artifact Header */}
        <div className="h-14 border-b border-[#1f1f24] flex items-center justify-between px-4 flex-shrink-0 bg-[#0c0c0e]">
          <div className="flex items-center gap-2 overflow-hidden">
            <Terminal className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="font-mono text-xs font-semibold text-slate-200 truncate">
              Editor de Rascunho
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button 
              onClick={handleExportMarkdown}
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-[#18181b] transition-colors"
              title="Baixar Markdown"
            >
              <Download className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsArtifactOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-[#18181b] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Artifact Body */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <textarea
            className="flex-1 w-full bg-[#0c0c0e] text-slate-300 font-mono text-[13px] leading-relaxed p-5 focus:outline-none resize-none scrollbar-thin"
            value={currentMarkdown}
            onChange={(e) => {
              setCurrentMarkdown(e.target.value);
              setPublishSuccess(false);
            }}
            placeholder="O código SKILL.md gerado aparecerá aqui..."
          />
          
          {/* Action Bar at bottom */}
          <div className="p-4 border-t border-[#1f1f24] bg-[#0c0c0e]">
            {publishSuccess ? (
              <div className="bg-emerald-950/20 border border-emerald-900/60 p-3 text-xs text-emerald-400 rounded-lg flex items-start gap-2.5">
                <CheckSquare className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <strong className="block font-medium">Skill Publicada!</strong>
                  Ela já está disponível no catálogo de pesquisa.
                </div>
              </div>
            ) : (
              <button
                onClick={handlePublish}
                disabled={!currentMarkdown}
                className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Publicar no Catálogo
              </button>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
