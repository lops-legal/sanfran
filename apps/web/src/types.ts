export interface LegalSkill {
  id: string;
  slug?: string;
  name: string;
  ownerName: string; // e.g., "são francisco", "Garra-Aberta"
  ownerAvatar: string; // Emoji or short SVG
  description: string;
  markdownContent: string; // The SKILL.md format content
  rating: number; // e.g., 4.9
  reviewCount: number; // e.g., 18
  starsCount: number; // e.g., 1420
  tags: string[]; // e.g., ["Contratos", "LGPD", "CDC"]
  vertical: string; // e.g., "Trabalhista", "LGPD", "Tributário", "Consumidor", "Regulatório"
  qualityScore: number; // 0-100 - Quality Score
  regulatoryScore: number; // 0-100 - Security & Regulatory Score
  qualityBreakdown: {
    precisaoNormativa: number; // 0-10
    especificidade: number; // 0-10
    padraoEntrega: number; // 0-10
    limitesAutonomia: number; // 0-10
    atualizacao: number; // 0-10
  };
  regulatoryIssues: number; // e.g., 0 issues, 2 warnings
  version: string;
  updatedAt: string;
  complianceChecked: boolean;
  playgroundTestInput?: string;
  playgroundExpectedOutput?: string;
  playgroundSystemPrompt?: string;
  authorOrganization?: string;
  authorProfile?: string;
  objective?: string;
  useCase?: string;
  legalArea?: string;
  workflow?: string;
  professionalRole?: string;
  securityCriteria?: SecurityCriterion[];
}


export interface ChatMessage {
  id: string;
  sender: "user" | "lex";
  text: string;
  status?: "typing" | "done" | "error";
  generatedSkillMarkdown?: string; // Optional field for auto‑generated SKILL.md content
  thoughts?: string[]; // Intermediate agent steps/thoughts
}

export interface VerticalCategory {
  id: string;
  name: string;
  icon: string; // lucide icon name
  count: number;
  description: string;
  accentClass: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  count: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}
export interface SecurityCriterion {
  id: string;
  description: string;
  category: string;
  severity: "low" | "medium" | "high";
}

