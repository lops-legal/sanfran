import React, { useState, useRef, useEffect, useCallback, useTransition } from "react";
import { LegalSkill, ChatMessage } from "../types";
import { cn } from "../lib/utils";
import { 
  Send, Upload, Copy, Check, Download,
  Terminal, Sparkles, X, CheckSquare, FileText, PlusCircle,
  PanelLeft, PanelRight, Paperclip, MessageSquare, Plus,
  ChevronRight, ImageIcon, Figma, MonitorIcon, Command, LoaderIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LexBotProps {
  onPublishSkill: (newSkill: LegalSkill) => void;
}

const SAMPLE_DOCS = [
  {
    name: "Contrato_Prestacao_PJ_Lucas.txt",
    type: "Contrato de Prestação de Serviços (Risco de Vínculo)",
    text: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE TECNOLOGIA...`
  },
  {
    name: "Peticao_Consumidor_Celular_Quebrado.txt",
    type: "Petição de Vício de Produto CDC (Urgente)",
    text: `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO...`
  }
];

interface CommandSuggestion {
  icon: React.ReactNode;
  label: string;
  description: string;
  prefix: string;
}

function useAutoResizeTextarea(minHeight: number, maxHeight?: number) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(
          textarea.scrollHeight,
          maxHeight ?? Number.POSITIVE_INFINITY
        )
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    
    return (
      <div className={cn("relative", containerClassName)}>
        <textarea
          className={cn(
            "flex w-full bg-transparent text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-white/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {showRing && isFocused && (
          <motion.span 
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-orange-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

function TypingDots() {
  return (
    <div className="flex items-center ml-1">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5"
          initial={{ opacity: 0.3 }}
          animate={{ 
            opacity: [0.3, 0.9, 0.3],
            scale: [0.85, 1.1, 0.85]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: dot * 0.15,
            ease: "easeInOut",
          }}
          style={{ boxShadow: "0 0 4px rgba(255, 255, 255, 0.3)" }}
        />
      ))}
    </div>
  );
}

export default function LexBot({ onPublishSkill }: LexBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeDoc, setActiveDoc] = useState<{ name: string; text: string } | null>(null);
  
  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isArtifactOpen, setIsArtifactOpen] = useState(false);
  const [currentMarkdown, setCurrentMarkdown] = useState<string>("");
  const [publishSuccess, setPublishSuccess] = useState(false);
  
  // Command Palette States
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
  const [inputFocused, setInputFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const commandPaletteRef = useRef<HTMLDivElement>(null);
  
  const { textareaRef, adjustHeight } = useAutoResizeTextarea(44, 200);

  const isTyping = loading;

  const commandSuggestions: CommandSuggestion[] = [
    { icon: <Sparkles className="w-4 h-4 text-orange-400" />, label: "Gerar Skill", description: "Criar SKILL.md a partir da instrução", prefix: "/skill" },
    { icon: <FileText className="w-4 h-4 text-emerald-400" />, label: "Auditar Minuta", description: "Encontrar riscos e conformidades", prefix: "/auditar" },
    { icon: <Terminal className="w-4 h-4 text-slate-400" />, label: "Explicar Termo", description: "Simplificar linguagem jurídica", prefix: "/explicar" },
    { icon: <PlusCircle className="w-4 h-4 text-fuchsia-400" />, label: "Adicionar Exceção", description: "Adicionar Level 2 na skill gerada", prefix: "@excecao" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if ((inputMessage.startsWith('/') || inputMessage.startsWith('@')) && !inputMessage.includes(' ')) {
      setShowCommandPalette(true);
      const matchingIndex = commandSuggestions.findIndex((cmd) => cmd.prefix.startsWith(inputMessage));
      setActiveSuggestion(matchingIndex >= 0 ? matchingIndex : -1);
    } else {
      setShowCommandPalette(false);
    }
  }, [inputMessage]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (commandPaletteRef.current && !commandPaletteRef.current.contains(target)) {
        setShowCommandPalette(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectCommandSuggestion = (index: number) => {
    const selected = commandSuggestions[index];
    setInputMessage(selected.prefix + ' ');
    setShowCommandPalette(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommandPalette) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestion(prev => prev < commandSuggestions.length - 1 ? prev + 1 : 0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestion(prev => prev > 0 ? prev - 1 : commandSuggestions.length - 1);
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        if (activeSuggestion >= 0) {
          selectCommandSuggestion(activeSuggestion);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowCommandPalette(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const addBotMessage = (text: string, markdownDraft?: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Math.random().toString(), sender: "lex", text: text, generatedSkillMarkdown: markdownDraft }
    ]);
    if (markdownDraft) {
      setCurrentMarkdown(markdownDraft);
      setIsArtifactOpen(true);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage;
    setInputMessage("");
    setPublishSuccess(false);
    adjustHeight(true);
    setShowCommandPalette(false);

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

      const bodyData: any = { message: userText, history: history };
      if (activeDoc) {
        bodyData.contextDocument = { name: activeDoc.name, text: activeDoc.text };
      }

      const response = await fetch("/api/lex-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });

      if (!response.ok) throw new Error("Erro de comunicação.");

      const data = await response.json();
      addBotMessage(data.text, data.generatedSkillMarkdown);

    } catch (err: any) {
      console.error(err);
      addBotMessage(`🦊 **Ops!**\nErro: ${err.message || "Rede indisponível."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setActiveDoc({ name: file.name, text: event.target?.result as string });
      addBotMessage(`✓ Carreguei seu documento **"${file.name}"**!\nComo você quer analisar esse arquivo?`);
    };
    reader.readAsText(file);
    e.target.value = ""; 
  };

  const handlePublish = () => {
    const lines = currentMarkdown.split("\n");
    let title = "Skill Customizada por Lex";
    const titleLine = lines.find(line => line.startsWith("# "));
    if (titleLine) title = titleLine.replace("# ", "").trim();

    onPublishSkill({
      id: "user-" + Math.random().toString(36).substring(2, 9),
      name: title,
      ownerName: "editor-lex",
      ownerAvatar: "🦊",
      description: "Skill jurídica criada via assistente conversacional Lex.",
      markdownContent: currentMarkdown,
      rating: 5.0,
      reviewCount: 1,
      starsCount: 1,
      tags: ["lex"],
      vertical: "Direito Geral",
      qualityScore: 95,
      regulatoryScore: 98,
      qualityBreakdown: { precisaoNormativa: 9, especificidade: 10, padraoEntrega: 10, limitesAutonomia: 9, atualizacao: 9 },
      regulatoryIssues: 0,
      version: "1.0.0",
      complianceChecked: true,
      updatedAt: new Date().toLocaleDateString("pt-BR"),
      authorOrganization: "Lex AI Atelier",
      authorProfile: "#",
      objective: "Análise gerada por IA.",
      useCase: "Auditar conformidade jurídica.",
      legalArea: "Geral",
      workflow: "Análise automática",
      professionalRole: "Advogado / Analista",
      securityCriteria: [],
    });
    setPublishSuccess(true);
  };

  return (
    <div className="flex h-[calc(100vh-76px)] bg-[#050505] text-slate-200 overflow-hidden font-sans relative">
      
      {/* GLOW BACKGROUNDS */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
        {inputFocused && (
          <motion.div 
            className="absolute w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.02] bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 blur-[96px]"
            animate={{ x: mousePosition.x - 400, y: mousePosition.y - 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 150, mass: 0.5 }}
          />
        )}
      </div>

      {/* 1. LEFT SIDEBAR */}
      <div className={`${isSidebarOpen ? "w-[260px] md:w-[280px]" : "w-0"} flex-shrink-0 transition-all duration-300 ease-in-out bg-[#0A0A0C]/80 backdrop-blur-md border-r border-white/5 flex flex-col z-10`}>
        <div className="p-4 flex-1 overflow-y-auto">
          <button 
            onClick={() => { setMessages([]); setActiveDoc(null); setCurrentMarkdown(""); setIsArtifactOpen(false); }}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-lg py-2.5 px-4 font-medium transition-colors text-sm shadow-sm border border-white/10"
          >
            <Plus className="w-4 h-4" />
            Nova Sessão
          </button>
          <div className="mt-8">
            <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider px-2 mb-3">Histórico Recente</h3>
            <div className="space-y-1">
              <button className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/5 text-orange-400 border border-white/5 text-sm">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="truncate">Criação de Skill CDC</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        
        {/* Top Header */}
        <div className="h-14 flex-shrink-0 flex items-center justify-between px-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 text-white/40 hover:text-white/90 rounded-md transition-colors">
              <PanelLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-slate-100 flex items-center gap-2">Lex AI</span>
          </div>
          {currentMarkdown && (
            <button onClick={() => setIsArtifactOpen(!isArtifactOpen)} className={`p-2 rounded-md transition-colors ${isArtifactOpen ? 'text-orange-400 bg-orange-400/10' : 'text-white/40 hover:text-white/90'}`}>
              <PanelRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Chat Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 pb-32">
          <div className="max-w-3xl mx-auto w-full pt-8 pb-4">
            {messages.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-full mt-20">
                <div className="text-center space-y-3 mb-10">
                  <h1 className="text-3xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/40 pb-1">
                    Como a Lex pode ajudar?
                  </h1>
                  <p className="text-sm text-white/40">Digite um comando com '/' ou faça uma pergunta livre.</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 max-w-2xl">
                  {commandSuggestions.map((suggestion, idx) => (
                    <motion.button key={idx} onClick={() => selectCommandSuggestion(idx)} className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] rounded-xl text-sm text-white/70 hover:text-white/90 transition-all border border-white/5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                      {suggestion.icon}
                      <span>{suggestion.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.sender === "lex" && <div className="w-8 h-8 rounded-full bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-sm shrink-0 mr-4 mt-1">🦊</div>}
                    <div className={`max-w-[85%] ${msg.sender === "user" ? "bg-white/10 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm text-[15px] shadow-sm backdrop-blur-md" : "text-slate-200 text-[15px] leading-relaxed pt-1.5"}`}>
                      <div className="whitespace-pre-wrap font-light">{msg.text}</div>
                      {msg.generatedSkillMarkdown && !isArtifactOpen && (
                        <button onClick={() => setIsArtifactOpen(true)} className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-white/[0.05] hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors">
                          <Terminal className="w-4 h-4 text-emerald-400" />
                          <span className="font-medium">Abrir Rascunho SKILL.md</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Input Area - Animated */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent pt-12 pb-6 px-4">
          <div className="max-w-3xl mx-auto relative">
            <motion.div 
              className="relative backdrop-blur-2xl bg-white/[0.03] rounded-2xl border border-white/[0.08] shadow-2xl"
              initial={{ scale: 0.98 }} animate={{ scale: 1 }}
            >
              <AnimatePresence>
                {showCommandPalette && (
                  <motion.div 
                    ref={commandPaletteRef}
                    className="absolute left-0 right-0 bottom-full mb-2 backdrop-blur-xl bg-black/90 rounded-xl z-50 shadow-2xl border border-white/10 overflow-hidden"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  >
                    <div className="py-2">
                      {commandSuggestions.map((suggestion, index) => (
                        <div
                          key={suggestion.prefix}
                          className={cn("flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer", activeSuggestion === index ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5")}
                          onClick={() => selectCommandSuggestion(index)}
                        >
                          {suggestion.icon}
                          <div className="font-medium">{suggestion.label}</div>
                          <div className="text-white/40 text-xs ml-auto font-mono">{suggestion.prefix}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {activeDoc && (
                <div className="px-4 pt-3 flex gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-xs bg-white/[0.05] py-1.5 px-3 rounded-lg text-white/80 border border-white/10">
                    <FileText className="w-3.5 h-3.5 text-orange-400" />
                    <span className="truncate max-w-[200px]">{activeDoc.name}</span>
                    <button onClick={() => setActiveDoc(null)} className="text-white/40 hover:text-white transition-colors ml-1"><X className="w-3 h-3" /></button>
                  </div>
                </div>
              )}

              <div className="p-4 flex items-end gap-3">
                <div className="relative shrink-0 mb-1">
                  <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} accept=".txt,.md,.json" />
                  <label htmlFor="file-upload" className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white/90 hover:bg-white/10 cursor-pointer transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </label>
                </div>
                
                <Textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => { setInputMessage(e.target.value); adjustHeight(); }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="Instrua a Lex, use '/' para comandos..."
                  className="min-h-[44px] text-[15px] border-none px-0 py-2.5 text-white/90"
                  showRing={false}
                  disabled={loading}
                />
                
                <motion.button
                  onClick={handleSendMessage}
                  disabled={isTyping || !inputMessage.trim()}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-10 h-10 shrink-0 mb-1 rounded-xl flex items-center justify-center transition-all",
                    inputMessage.trim() && !loading ? "bg-orange-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]" : "bg-white/[0.05] text-white/30 cursor-not-allowed"
                  )}
                >
                  {isTyping ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
        
        <AnimatePresence>
          {isTyping && (
            <motion.div 
              className="fixed bottom-[140px] left-1/2 transform -translate-x-1/2 backdrop-blur-2xl bg-white/[0.05] rounded-full px-5 py-2.5 shadow-2xl border border-white/10 z-50 flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            >
              <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs">🦊</div>
              <div className="flex items-center gap-2 text-sm text-white/70 font-medium">
                <span>Lex está analisando</span>
                <TypingDots />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* 3. RIGHT ARTIFACT PANEL */}
      <div className={`${isArtifactOpen ? "w-[400px] lg:w-[480px]" : "w-0"} flex-shrink-0 transition-all duration-300 ease-in-out bg-[#0A0A0C]/90 backdrop-blur-xl border-l border-white/5 flex flex-col z-20 overflow-hidden`}>
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="font-mono text-xs font-semibold text-white/90">Editor SKILL.md</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsArtifactOpen(false)} className="p-1.5 text-white/40 hover:text-white rounded-md hover:bg-white/10 transition-colors"><X className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="flex-1 flex flex-col relative">
          <textarea
            className="flex-1 w-full bg-transparent text-white/80 font-mono text-[13px] leading-relaxed p-5 focus:outline-none resize-none scrollbar-thin"
            value={currentMarkdown}
            onChange={(e) => { setCurrentMarkdown(e.target.value); setPublishSuccess(false); }}
          />
          <div className="p-4 border-t border-white/5">
            {publishSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 rounded-xl flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4" />
                <span className="font-medium">Skill Publicada com Sucesso!</span>
              </div>
            ) : (
              <button
                onClick={handlePublish}
                disabled={!currentMarkdown}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 border border-white/5 shadow-lg"
              >
                <PlusCircle className="w-4 h-4 text-orange-400" />
                Publicar no Catálogo
              </button>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
