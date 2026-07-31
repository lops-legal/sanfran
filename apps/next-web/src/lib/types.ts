export interface LegalSkill {
  id: string;
  slug?: string;
  name: string;
  ownerName: string;
  ownerAvatar: string;
  description: string;
  markdownContent: string;
  rating: number;
  reviewCount: number;
  starsCount: number;
  downloadsCount?: number;
  tags: string[];
  vertical: string;
  qualityScore: number;
  regulatoryScore: number;
  qualityBreakdown: {
    precisaoNormativa: number;
    especificidade: number;
    padraoEntrega: number;
    limitesAutonomia: number;
    atualizacao: number;
  };
  regulatoryIssues: number;
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
  generatedSkillMarkdown?: string;
  thoughts?: string[];
}

export interface VerticalCategory {
  id: string;
  name: string;
  icon: string;
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
