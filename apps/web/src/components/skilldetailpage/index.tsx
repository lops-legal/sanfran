import React, { useEffect, useState } from "react";
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
import { useInView } from "../../hooks/useInView";
import { Dock, DockIcon, DockItem, DockLabel } from "../ui/dock";
import {
  ArrowLeft,
  Trash2,
  Edit,
  LayoutGrid,
  Gauge,
  ShieldCheck,
  Plug,
  ChevronRight,
  Download,
  Star,
} from "lucide-react";

// Import cinematic styles
import "../../styles/home-cinematic.css";

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

  const { ref: heroRef, inView: heroInView } = useInView<HTMLDivElement>({ threshold: 0.1 });

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

  const downloadsLabel = (skill.downloadsCount ?? skill.starsCount) >= 1000
    ? `${((skill.downloadsCount ?? skill.starsCount) / 1000).toFixed(1)}k`
    : String(skill.downloadsCount ?? skill.starsCount);

  return (
    <div id={`detail-page-${skill.id}`} className="min-h-screen bg-background text-foreground font-sans animate-fade-in">

      {/* Breadcrumb + Hero */}
      <div className="paper-texture paper-seda" style={{ background: "linear-gradient(180deg, #fff8f5 0%, #F9F7F5 100%)" }}>
        <div className="max-w-7xl mx-auto px-margin-desktop pt-[100px] pb-8">
          <nav className="flex items-center gap-1.5 mb-6">
            <button onClick={onBack} className="breadcrumb-link hover:text-primary flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Catálogo
            </button>
            <ChevronRight className="w-3 h-3 text-muted" />
            <span className="text-[12px] font-mono text-muted">{skill.vertical}</span>
            <ChevronRight className="w-3 h-3 text-muted" />
            <span className="text-[12px] font-mono text-foreground font-medium truncate max-w-[200px]">{skill.name}</span>
          </nav>

          <div ref={heroRef} className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className={`flex-1 min-w-0 transition-all duration-700 transform ${heroInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="pill-tag bg-primary/8 text-primary border border-primary/20">
                  {skill.vertical}
                </span>
                <span className="text-[11px] text-muted font-mono">v{skill.version}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif max-w-3xl leading-tight mb-3">
                {skill.name}
              </h1>
              <p className="text-muted text-sm max-w-2xl leading-relaxed">
                {skill.description}
              </p>
              <p className="text-muted text-xs mt-3 font-mono">
                Mantido por <span className="text-foreground font-semibold">@{skill.ownerName}</span> &middot; Atualizado em {skill.updatedAt}
              </p>
            </div>

            <div className={`shrink-0 flex flex-col gap-4 transition-all duration-700 delay-200 transform ${heroInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
              <div className="flex items-center gap-6 bg-white border border-border rounded-xl p-4 shadow-sm">
                <div className="text-center">
                  <span className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-1">Downloads</span>
                  <span className="text-lg font-bold text-foreground font-mono">{downloadsLabel}</span>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <span className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-1">Score</span>
                  <span className="text-lg font-bold text-foreground font-mono">{skill.qualityScore}%</span>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <span className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-1">Rating</span>
                  <span className="text-lg font-bold text-foreground font-mono flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                    {skill.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {user && (
                  <>
                    <button
                      onClick={() => alert("Funcionalidade de edição em desenvolvimento.")}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono text-foreground bg-white hover:bg-card border border-border rounded-lg transition-all"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-margin-desktop py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: Nav tabs + active section */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tab navigation — Apple-style Dock */}
            <Dock className="items-end pb-3 bg-card/90 border border-border shadow-md">
              {SECTIONS.map(({ id, label, icon: Icon }) => {
                const isActive = activeSection === id;
                return (
                  <DockItem
                    key={id}
                    onClick={() => setActiveSection(id)}
                    className={`aspect-square rounded-full ${isActive ? "bg-primary/15 ring-2 ring-primary/30" : "bg-card-hover"}`}
                  >
                    <DockLabel>{label}</DockLabel>
                    <DockIcon>
                      <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted"}`} />
                    </DockIcon>
                  </DockItem>
                );
              })}
            </Dock>

            {/* Active section (only one rendered at a time) */}
            <div key={activeSection} className="tab-content-enter">
              {activeSection === "overview" && (
                <section className="detail-section-card">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono mb-5 flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-primary" />
                    Visão Geral
                  </h3>
                  <OverviewSection skill={skill} />
                </section>
              )}
              {activeSection === "quality" && (
                <section className="detail-section-card">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono mb-5 flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-primary" />
                    Qualidade
                  </h3>
                  <QualitySection skill={skill} />
                </section>
              )}
              {activeSection === "security" && (
                <section className="detail-section-card">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono mb-5 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Segurança & Vetores de Risco
                  </h3>
                  <SecuritySection skill={skill} />
                </section>
              )}
              {activeSection === "integration" && (
                <section className="detail-section-card">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono mb-1.5 flex items-center gap-2">
                    <Plug className="w-4 h-4 text-primary" />
                    Como Usar
                  </h3>
                  <p className="text-xs text-muted mb-5">
                    Conecte esta skill jurídica ao seu ecossistema de IA preferido.
                  </p>
                  <IntegrationSection />
                </section>
              )}
            </div>
          </div>

          {/* RIGHT: SKILL.md */}
          <div className="lg:col-span-7 lg:sticky lg:top-[72px] self-start">
            <SkillMarkdownCard skill={skill} loading={loadingDetails} />
          </div>
        </div>
      </div>
    </div>
  );
}