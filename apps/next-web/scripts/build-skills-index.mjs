// Gera src/lib/generated/skills-index.ts a partir de content/skills/<slug>/{SKILL.md,sanfran.yaml}.
// Roda automaticamente em `npm run dev` e `npm run build` (predev/prebuild).
// Falha (exit 1) se alguma skill violar o básico da especificação.
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const ROOT = path.resolve("content/skills");
const OUT = path.resolve("src/lib/generated/skills-index.ts");
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TEXT_EXT = new Set([".md", ".py", ".txt", ".json", ".jsonl", ".yaml", ".yml", ".csv"]);

function listFiles(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.name === "__pycache__") return [];
    return e.isDirectory() ? listFiles(p, base) : [path.relative(base, p).split(path.sep).join("/")];
  });
}

const errors = [];
const skills = [];

for (const slug of fs.readdirSync(ROOT).sort()) {
  const dir = path.join(ROOT, slug);
  if (!fs.statSync(dir).isDirectory()) continue;
  const skillMd = fs.readFileSync(path.join(dir, "SKILL.md"), "utf8").replace(/\r\n/g, "\n");
  const m = skillMd.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) { errors.push(`${slug}: SKILL.md sem frontmatter`); continue; }
  const fm = YAML.parse(m[1]);
  const manifestPath = path.join(dir, "sanfran.yaml");
  const man = fs.existsSync(manifestPath) ? YAML.parse(fs.readFileSync(manifestPath, "utf8")) : {};

  if (fm.name !== slug) errors.push(`${slug}: 'name' (${fm.name}) deve ser igual ao nome da pasta`);
  if (!NAME_RE.test(slug) || slug.length > 64) errors.push(`${slug}: nome fora do padrão (minúsculas, números e hífen)`);
  if (!fm.description || String(fm.description).length > 1024) errors.push(`${slug}: 'description' ausente ou > 1024 caracteres`);
  if (fm.metadata && Object.values(fm.metadata).some((v) => typeof v === "object")) errors.push(`${slug}: 'metadata' deve ser mapa string→string`);
  if (!fm.license) errors.push(`${slug}: 'license' ausente`);

  const files = listFiles(dir);
  const references = Object.fromEntries(
    files
      .filter((f) => f !== "SKILL.md" && TEXT_EXT.has(path.extname(f)) && !f.startsWith("tests/"))
      .map((f) => [f, fs.readFileSync(path.join(dir, f), "utf8")]),
  );

  skills.push({
    slug,
    title: man.titulo || slug,
    description: String(fm.description).trim().replace(/\s+/g, " "),
    license: fm.license,
    version: String(man.versao || fm.metadata?.version || "1.0.0"),
    author: man.autor || fm.metadata?.author || "sanfran",
    origin: man.origem || null,
    type: man.tipo || "execucao",
    area: man.area || "Geral",
    personas: man.personas || [],
    tags: man.tags || [],
    legalBasis: (man.base_normativa || []).map((b) => ({ ref: b.ref, url: b.url || null, checkedAt: b.conferido_em ? String(b.conferido_em) : null })),
    review: { status: man.revisao?.status || "rascunho", reviewer: man.revisao?.revisor || null, reviewedAt: man.revisao?.revisado_em ? String(man.revisao.revisado_em) : null },
    updatedAt: String(man.atualizado_em || "2026-01-01"),
    files,
    markdown: skillMd,
    references,
  });
}

if (errors.length) {
  console.error("✘ Skills inválidas:\n  " + errors.join("\n  "));
  process.exit(1);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  `// AUTO-GERADO por scripts/build-skills-index.mjs — não edite. Fonte: content/skills/\n` +
    `import type { RepoSkill } from "../repo-skill";\n\n` +
    `export const SKILLS_INDEX: RepoSkill[] = ${JSON.stringify(skills, null, 2)};\n`,
);
console.log(`✔ ${skills.length} skills indexadas → ${path.relative(process.cwd(), OUT)}`);
