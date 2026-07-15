import React, { useState } from "react";
import { X, User, Bell, Shield, Globe, Palette, Key, ChevronRight, Check } from "lucide-react";
import { toast } from "./Toast";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SECTIONS = [
  { id: "profile", label: "Perfil", icon: User },
  { id: "preferences", label: "Preferências", icon: Palette },
  { id: "notifications", label: "Notificações", icon: Bell },
  { id: "security", label: "Segurança", icon: Shield },
  { id: "api", label: "API & Integrações", icon: Key },
];

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState("profile");
  const [notifications, setNotifications] = useState({
    newSkills: true,
    updates: false,
    compliance: true,
  });
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("PT-BR");
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    toast.success("Configurações salvas", "Suas preferências foram atualizadas com sucesso.");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-3xl mx-4 bg-[#0c0c0e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-[15px] font-sans font-bold text-white">Configurações</h2>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5">Gerencie sua conta e preferências</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar */}
          <div className="w-52 shrink-0 border-r border-white/5 py-3 px-2">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-sans transition-all duration-200 cursor-pointer mb-0.5 ${activeSection === id
                    ? "bg-white/10 text-white font-medium"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                {activeSection === id && <ChevronRight className="w-3 h-3 ml-auto text-slate-500" />}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* === PERFIL === */}
            {activeSection === "profile" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-3xl">
                    👨‍⚖️
                  </div>
                  <div>
                    <p className="text-white font-sans font-bold text-[15px]">Dr. Lucas</p>
                    <p className="text-slate-500 font-mono text-[11px]">Plano Beta · OAB SP</p>
                    <button className="mt-1 text-[11px] font-mono text-orange-400 hover:text-orange-300 transition-colors">
                      Alterar foto
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Nome</label>
                    <input
                      defaultValue="Lucas"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-slate-200 outline-none focus:border-orange-500/50 transition-colors font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Sobrenome</label>
                    <input
                      defaultValue="Cardoso"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-slate-200 outline-none focus:border-orange-500/50 transition-colors font-sans"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">E-mail</label>
                    <input
                      type="email"
                      defaultValue="lucas@exemplo.com.br"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-slate-200 outline-none focus:border-orange-500/50 transition-colors font-sans"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Número OAB</label>
                    <input
                      defaultValue="SP 123.456"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-slate-200 outline-none focus:border-orange-500/50 transition-colors font-sans"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* === PREFERÊNCIAS === */}
            {activeSection === "preferences" && (
              <div className="space-y-6">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-3">Tema</label>
                  <div className="flex gap-3">
                    {["dark", "darker"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`flex-1 py-3 rounded-xl border text-[12px] font-mono transition-all ${theme === t
                            ? "border-orange-500 bg-orange-500/10 text-orange-400"
                            : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
                          }`}
                      >
                        {t === "dark" ? "Escuro" : "Ultra Escuro"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-3">Idioma do Sistema</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-slate-200 outline-none focus:border-orange-500/50 transition-colors font-mono"
                  >
                    <option value="PT-BR" className="bg-[#0c0c0e]">Português (BR)</option>
                    <option value="EN-US" className="bg-[#0c0c0e]">English (US)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-3">Densidade do Feed</label>
                  <div className="flex gap-3">
                    {["Compacto", "Padrão", "Expandido"].map((d) => (
                      <button
                        key={d}
                        className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 text-[12px] font-mono text-slate-400 hover:border-white/20 hover:text-slate-200 transition-all"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* === NOTIFICAÇÕES === */}
            {activeSection === "notifications" && (
              <div className="space-y-4">
                {[
                  { key: "newSkills" as const, label: "Novas skills publicadas", desc: "Receba alertas quando skills relevantes forem publicadas" },
                  { key: "updates" as const, label: "Atualizações da plataforma", desc: "Novidades, correções e melhorias do Sanfran.md" },
                  { key: "compliance" as const, label: "Alertas de compliance", desc: "Mudanças na legislação que afetam suas skills" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-start justify-between gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                    <div>
                      <p className="text-[13px] font-sans font-medium text-slate-200">{label}</p>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
                      className={`shrink-0 w-10 h-5 rounded-full transition-colors ${notifications[key] ? "bg-orange-600" : "bg-white/10"}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${notifications[key] ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* === SEGURANÇA === */}
            {activeSection === "security" && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-400 text-[12px] font-mono font-bold mb-1">
                    <Shield className="w-4 h-4" />
                    Conta Verificada
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">Sua conta está protegida com autenticação OAB.</p>
                </div>
                <button className="w-full text-left p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-sans text-slate-200">Alterar senha</p>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">Última alteração: nunca</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
                <button className="w-full text-left p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-sans text-slate-200">Autenticação de dois fatores</p>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">Não configurado</p>
                  </div>
                  <span className="text-[11px] font-mono text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">Configurar</span>
                </button>
              </div>
            )}

            {/* === API === */}
            {activeSection === "api" && (
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">Sua Chave de API</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-[12px] font-mono text-orange-400 bg-black/40 px-3 py-2 rounded-lg truncate">
                      sfr_••••••••••••••••••••••••••••••
                    </code>
                    <button className="px-3 py-2 text-[11px] font-mono bg-white/10 hover:bg-white/15 text-slate-300 rounded-lg transition-all">
                      Revelar
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Integrações Ativas</p>
                  {["Cursor Rules"].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl">
                      <span className="text-[12px] font-mono text-slate-300">{i}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Ativo
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-6 py-3 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[12px] font-mono text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-[12px] font-mono font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-all flex items-center gap-1.5"
          >
            {saved ? <><Check className="w-3.5 h-3.5" /> Salvo!</> : "Salvar Alterações"}
          </button>
        </div>

      </div>
    </div>
  );
}
