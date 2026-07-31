export interface SecurityCriterion {
  id: string;
  description: string;
  category: string;
  severity: "low" | "medium" | "high";
}

export const SECURITY_CRITERIA: SecurityCriterion[] = [
  { id: "inj-immediate", description: "Injeção imediata", category: "Injeção", severity: "high" },
  { id: "command-injection", description: "Injeção de comando", category: "Injeção", severity: "high" },
  { id: "data-exfiltration", description: "Exfiltração de dados", category: "Exfiltração", severity: "high" },
  { id: "credential-collection", description: "Coleta de credenciais", category: "Credenciais", severity: "medium" },
  { id: "obfuscation", description: "Ofuscação", category: "Ofuscação", severity: "low" },
  { id: "confidential-file-access", description: "Acesso a arquivos confidenciais", category: "Acesso", severity: "high" },
  { id: "external-calls", description: "Chamadas externas", category: "Rede", severity: "medium" },
  { id: "persistence", description: "Persistência", category: "Persistência", severity: "high" },
  { id: "social-engineering", description: "Engenharia Social", category: "Engenharia", severity: "medium" },
  { id: "clickfix-attack", description: "Ataque ClickFix", category: "UI", severity: "low" },
  { id: "malware-stages", description: "Malware em etapas", category: "Malware", severity: "high" },
  { id: "second-order-injection", description: "Injeção de segunda ordem", category: "Injeção", severity: "medium" },
  { id: "other", description: "Outros vetores relevantes", category: "Diversos", severity: "low" },
];
