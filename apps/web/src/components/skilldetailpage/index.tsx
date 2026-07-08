import React, { useEffect, useRef, useState } from "react";
import OverviewSection from "./OverviewSection";
import QualitySection from "./QualitySection";
import SecuritySection from "./SecuritySection";
import IntegrationSection from "./IntegrationSection";
import SkillMarkdownCard from "./SkillMarkdownCard";
import { LegalSkill } from "../../types";
import { supabase } from "../../lib/supabaseAdapter";
import { mapDbSkillToLegalSkill } from "../../lib/skillMapper";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Info,
  CheckCircle,
  Trash2,
  Edit,
  LayoutGrid,
  Gauge,
  ShieldCheck,
  Plug,
} from "lucide-react";

interface SkillDetailPageProps {
  skill: LegalSkill;
  onBack: () => void;
}

const SECTIONS = [
  { id: "overview", label: "Visão Geral", icon: LayoutGrid },
  { id: "quality", label: "Qualidade", icon: Gauge },
  { id: "security", label: "Segurança", icon: ShieldCheck },
  { id: "integration", label: "Como Usar", icon: Plug },
] as const;

export default function SkillDetailPage({ skill: initialSkill, onBack }: SkillDetailPageProps) {
  const [skill, setSkill] = useState<LegalSkill>(initialSkill);
  const [loadingDetails, setLoadingDetails] = useState(!initialSkill.markdownContent);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<string>("overview");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!initialSkill.markdownContent && initialSkill.id) {
      supabase
        .from("skills")
        .select("*")
        .eq("id", initialSkill.id)
        .single()
        .then(({ data, error }) => {
          if (data && !error) {
            setSkill(mapDbSkillToLegalSkill(data));
          }
          setLoadingDetails(false);
        });
    } else {
      setLoadingDetails(false);
    }
  }, [initialSkill.id, initialSkill.markdownContent]);

  // Tracks which section is in view so the quick-nav can highlight it —
  // all sections stay rendered and readable, this just aids orientation.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir permanentemente esta skill?")) return;
    try {
      const { error } = await supabase.from("skills").delete().eq("id", skill.id);
      if (error) throw error;
      alert("Skill excluída com sucesso.");
      navigate("/skills");
    } catch (err: any) {
      alert("Erro ao excluir skill: " + err.message);
    }
  };

  return (
    <div id={`detail-page-${skill.id}`} className="min-h-screen bg-[#070708] text-slate-100 py-6 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <button
          id="btn-back-to-marketplace"
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono text-muted hover:text-accent border border-slate-800 hover:border-primary/50 bg-[#121214] px-4 py-2 transition-all cursor-pointer mb-6 uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao catálogo
        </button>

        {/* Hero */}
        <div className="border border-[#1f1f24] bg-[#0c0c0e] p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[4px] h-full bg-primary-dim" />
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-primary-dim/10 border border-primary/30 text-accent text-[10px] font-mono rounded">
                  {skill.vertical.toUpperCase()}
                </span>
                <span className="text-xs text-muted font-mono">ID: {skill.id}</span>
                <span className="text-xs text-muted font-mono">v{skill.version}</span>
                {skill.complianceChecked && (
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono px-2 py-0.5 rounded flex items-center gap-1 uppercase font-bold">
                    <CheckCircle className="w-3 h-3" />
                    Auditoria OAB ativa
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground font-sans max-w-4xl">
                {skill.name}
              </h1>
              <p className="text-muted text-sm mt-2 max-w-3xl font-sans">
                Mantido por <span className="text-slate-200 font-semibold">@{skill.ownerName}</span> • Última revisão
                legislativa em {skill.updatedAt}
              </p>
            </div>

            <div className="flex flex-col items-end gap-3 shrink-0">
              <div className="flex items-center gap-4 bg-[#121214] border border-[#1f1f24] p-3 text-right">
                <div className="font-mono text-xs">
                  <span className="text-muted block uppercase text-[9px] tracking-wider">Downloads</span>
                  <span className="text-slate-100 font-semibold">{(skill.downloadsCount ?? 0).toLocaleString()}</span>
                </div>
                <div className="w-[1px] h-6 bg-slate-800" />
                <div className="font-mono text-xs">
                  <span className="text-muted block uppercase text-[9px] tracking-wider">Popularidade</span>
                  <span className="text-slate-100 font-semibold">{skill.starsCount} ★</span>
                </div>
              </div>

              {user && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert("Funcionalidade de edição em desenvolvimento.")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-300 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-red-400 bg-red-950/30 hover:bg-red-900/40 border border-red-900/50 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main grid: sections on the left, SKILL.md as the featured card on the right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: always-visible sections, no clicks required to read anything */}
          <div className="lg:col-span-5 space-y-5">
            {/* Quick nav — jumps to a section, never hides one */}
            <div className="sticky top-4 z-10">
              <div className="flex gap-1.5 overflow-x-auto bg-[#0c0c0e]/95 backdrop-blur border border-[#1f1f24] p-1.5 rounded-md">
                {SECTIONS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono whitespace-nowrap rounded transition-all border ${activeSection === id
                      ? "bg-orange-500/10 text-accent border-orange-500/30"
                      : "text-muted border-transparent hover:text-slate-200 hover:bg-[#141417]"
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Overview */}
            <section
              id="overview"
              ref={(el) => {
                sectionRefs.current["overview"] = el;
              }}
              className="border border-[#1f1f24] bg-[#0c0c0e] p-5 scroll-mt-20"
            >
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
                <LayoutGrid className="w-3.5 h-3.5 text-orange-400" />
                Visão Geral
              </h3>
              <OverviewSection skill={skill} />
            </section>

            {/* Quality */}
            <section
              id="quality"
              ref={(el) => {
                sectionRefs.current["quality"] = el;
              }}
              className="border border-[#1f1f24] bg-[#0c0c0e] p-5 scroll-mt-20"
            >
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
                <Gauge className="w-3.5 h-3.5 text-orange-400" />
                Qualidade
              </h3>
              <QualitySection skill={skill} />
            </section>

            {/* Security */}
            <section
              id="security"
              ref={(el) => {
                sectionRefs.current["security"] = el;
              }}
              className="border border-[#1f1f24] bg-[#0c0c0e] p-5 scroll-mt-20"
            >
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                Segurança &amp; Vetores de Risco
              </h3>
              <SecuritySection skill={skill} />
            </section>

            {/* Integration — previously a hidden tab, now a first-class section */}
            <section
              id="integration"
              ref={(el) => {
                sectionRefs.current["integration"] = el;
              }}
              className="border border-[#1f1f24] bg-[#0c0c0e] p-5 scroll-mt-20"
            >
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono mb-1 flex items-center gap-2">
                <Plug className="w-3.5 h-3.5 text-orange-400" />
                Como Usar
              </h3>
              <p className="text-xs text-muted mb-4 font-sans">
                Conecte esta skill jurídica ao seu ecossistema de IA preferido.
              </p>
              <IntegrationSection />
            </section>

            {/* Methodology note */}
            <div className="bg-[#131110] border border-amber-950/40 p-4 text-xs text-amber-500 flex items-start gap-2.5 font-sans rounded-sm">
              <Info className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <strong className="block text-amber-400 mb-0.5">Metodologia Sanfran.md</strong>
                Este diretório de diretrizes de skill jurídica brasileira segue as regras recomendadas de compliance da
                Faculdade de Direito do Largo de São Francisco e as orientações vigentes de ética em advocacia digital
                da OAB 2026.
              </div>
            </div>
          </div>

          {/* RIGHT: SKILL.md — the featured, sticky, marked card */}
          <div className="lg:col-span-7 lg:sticky lg:top-4 self-start">
            <SkillMarkdownCard skill={skill} loading={loadingDetails} />
          </div>
        </div>
      </div>
    </div>
  );
}
