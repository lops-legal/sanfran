import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { upsertSkill } from "../lib/supabaseAdapter";
import { slugify } from "../lib/slugify";
import { validateSkillInput } from "../lib/validation";
import { toast } from "./Toast";
import { LegalSkill } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Callback to prepend the newly created skill */
  onSkillCreated: (skill: LegalSkill) => void;
  /** Authenticated user ID */
  currentUserId: string;
}

export default function CreateSkillModal({ isOpen, onClose, onSkillCreated, currentUserId }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [vertical, setVertical] = useState("Consumidor");
  const [tags, setTags] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    const parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);

    // Validate inputs
    const errors = validateSkillInput({
      name,
      description,
      vertical,
      tags: parsedTags,
      markdown_body: markdown,
    });

    if (errors.length > 0) {
      toast.error("Erro de Validação", errors[0].message);
      return;
    }

    setIsSaving(true);
    const slug = slugify(name);
    try {
      const newSkill = await upsertSkill({
        slug,
        name,
        description,
        markdownContent: markdown,
        version: "1.0.0",
        author_id: currentUserId,
        ownerAvatar: "⚖️",
        vertical,
        tags: parsedTags,
        qualityScore: 80,
        regulatoryScore: 80,
        complianceChecked: true,
        starsCount: 0,
        reviewCount: 0,
        rating: 0,
      });
      if (newSkill) {
        onSkillCreated(newSkill);
        setName("");
        setDescription("");
        setVertical("Consumidor");
        setTags("");
        setMarkdown("");
        toast.success("Skill criada com sucesso!", `A skill "${name}" foi registrada.`);
        onClose();
      } else {
        toast.error("Falha ao salvar a skill", "Ocorreu um erro no banco de dados.");
      }
    } catch (err) {
      toast.error("Erro inesperado", err instanceof Error ? err.message : "Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0c0c0e] border border-[#1f1f24] p-6 w-full max-w-2xl rounded-lg shadow-xl animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-orange-400">Criar nova skill</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            placeholder="Nome da skill"
            className="bg-[#121214] border border-[#27272a] p-2 text-sm text-slate-200"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Vertical (ex.: Consumidor)"
            className="bg-[#121214] border border-[#27272a] p-2 text-sm text-slate-200"
            value={vertical}
            onChange={(e) => setVertical(e.target.value)}
          />
          <input
            placeholder="Tags (separadas por vírgula)"
            className="bg-[#121214] border border-[#27272a] p-2 text-sm text-slate-200"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <input
            placeholder="Descrição curta"
            className="bg-[#121214] border border-[#27272a] p-2 text-sm text-slate-200"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <textarea
          placeholder="Corpo da skill (Markdown)"
          className="mt-4 w-full h-48 bg-[#121214] border border-[#27272a] p-3 text-sm text-slate-200 resize-none"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
        />
        <div className="flex justify-end mt-4 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-[#121214] border border-[#27272a] hover:bg-[#1a1a1f]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 flex items-center gap-2 text-sm font-medium ${isSaving ? "bg-gray-600" : "bg-orange-600 hover:bg-orange-500"} text-white border border-orange-500 transition`}
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}