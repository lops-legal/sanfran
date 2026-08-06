const fs = require("fs");
const path = require("path");

// Pasta raiz com as skills reais
const ROOT = path.join(__dirname, "..", "..", "skills-teste-docker");

// ids (diretórios) das 14 novas skills
const IDS = [
  "alertas-contratuais",
  "atendimento-titular-lgpd",
  "audiencia-classifier",
  "cadastro-processo",
  "cnj-parser",
  "contagem-prazo",
  "contingencia-report",
  "contrato-playbook",
  "contrato-review",
  "intake-consultivo",
  "monitor-prazos",
  "provisao-cpc25",
  "revisao-fatura",
  "ripd-generator",
];

// Escapa o markdown para viver dentro de um template literal JS.
function esc(s) {
  return s
    .replace(/\uFEFF/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

let out = "// AUTO-GERADO por generate-skills-md.cjs — conteudo real de cada SKILL.md.\n";
out += "// NAO edite manualmente. Rode o script novamente apos alterar skills-teste-docker.\n\n";
out += "export const SKILL_MARKDOWN: Record<string, string> = {\n";
for (const id of IDS) {
  const file = path.join(ROOT, id, "SKILL.md");
  if (!fs.existsSync(file)) {
    console.error("SKIP (sem SKILL.md):", id);
    continue;
  }
  const raw = fs.readFileSync(file, "utf8");
  out += `  ${JSON.stringify(id)}: \`${esc(raw)}\`,\n`;
}
out += "};\n";

const outFile = path.join(__dirname, "src", "lib", "skillsMarkdown.ts");
fs.writeFileSync(outFile, out, "utf8");
console.log("Gerado:", outFile, "| bytes:", out.length);
