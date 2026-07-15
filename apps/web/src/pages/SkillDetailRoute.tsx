import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SkillDetailPage from "../components/skilldetailpage";
import { fetchSkillBySlug } from "../lib/supabaseAdapter";
import { LegalSkill } from "../types";
import { Loader2 } from "lucide-react";

function SkillDetailRoute() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [skill, setSkill] = useState<LegalSkill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("Skill não encontrada.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchSkillBySlug(slug)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setError("Skill não encontrada ou ainda não publicada.");
          setSkill(null);
          return;
        }
        setSkill(result);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Erro ao carregar skill.");
        setSkill(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 text-muted">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="font-mono text-sm">Carregando skill…</span>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center">
        <p className="text-sm text-muted mb-4">{error ?? "Skill não encontrada."}</p>
        <button
          onClick={() => navigate("/skills")}
          className="border border-border bg-card px-4 py-2 text-xs font-mono uppercase tracking-wide hover:text-foreground transition-colors"
        >
          Voltar ao catálogo
        </button>
      </div>
    );
  }

  return <SkillDetailPage skill={skill} onBack={() => navigate("/skills")} />;
}

export default SkillDetailRoute;
