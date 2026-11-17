import React from "react";

export interface ParsedSkillMarkdown {
  frontmatter: Record<string, string>;
  bodyNodes: React.ReactNode[];
}

type ListItem = { type: "ul" | "ol" | "check"; text: string; checked?: boolean };

/**
 * Renders inline markdown formatting: `code`, [links](url), **bold**, *italic*.
 * Deliberately dependency-free so it can drop into any React project.
 */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /(`[^`]+`)|(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];

    if (token.startsWith("`")) {
      nodes.push(
        <code
          key={`${keyPrefix}-c-${i++}`}
          className="px-1.5 py-0.5 rounded bg-subtle border border-border text-foreground text-[11px] font-mono"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("[")) {
      const m = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (m) {
        nodes.push(
          <a
            key={`${keyPrefix}-a-${i++}`}
            href={m[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-foreground underline underline-offset-2 decoration-muted-foreground/40"
          >
            {m[1]}
          </a>
        );
      }
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${i++}`} className="text-foreground font-semibold">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*")) {
      nodes.push(
        <em key={`${keyPrefix}-i-${i++}`} className="text-muted-foreground italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

/**
 * Parses a SKILL.md file (YAML-ish frontmatter + markdown body) into:
 * - frontmatter: flat key/value pairs from the leading --- block
 * - bodyNodes: styled React nodes for headings, lists, checklists, code blocks, paragraphs
 */
export function parseSkillMarkdown(raw: string): ParsedSkillMarkdown {
  if (!raw) return { frontmatter: {}, bodyNodes: [] };

  const frontmatter: Record<string, string> = {};
  let body = raw;

  const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (fmMatch) {
    fmMatch[1].split("\n").forEach((line) => {
      const idx = line.indexOf(":");
      if (idx > -1) {
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();
        if (key) frontmatter[key] = value;
      }
    });
    body = raw.slice(fmMatch[0].length);
  }

  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const nodes: React.ReactNode[] = [];

  let paraBuffer: string[] = [];
  let listBuffer: ListItem[] = [];

  const flushPara = (key: string) => {
    if (!paraBuffer.length) return;
    const text = paraBuffer.join(" ").trim();
    if (text) {
      nodes.push(
        <p key={key} className="text-[15px] text-foreground/85 leading-relaxed mb-4">
          {renderInline(text, key)}
        </p>
      );
    }
    paraBuffer = [];
  };

  const flushList = (key: string) => {
    if (!listBuffer.length) return;
    const type = listBuffer[0].type;

    if (type === "check") {
      nodes.push(
        <ul key={key} className="space-y-1.5 mb-4 list-none">
          {listBuffer.map((item, idx) => (
            <li key={`${key}-${idx}`} className="flex items-start gap-2 text-[15px]">
              <span
                className={`mt-0.5 flex items-center justify-center w-4 h-4 rounded-sm border shrink-0 text-[10px] font-bold ${item.checked
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                  : "border-border text-transparent"
                  }`}
              >
                {item.checked ? "\u2713" : ""}
              </span>
              <span className={`leading-relaxed ${item.checked ? "text-muted-foreground line-through" : "text-foreground/85"}`}>
                {renderInline(item.text, `${key}-${idx}`)}
              </span>
            </li>
          ))}
        </ul>
      );
    } else if (type === "ol") {
      nodes.push(
        <ol key={key} className="space-y-1.5 mb-4 pl-1">
          {listBuffer.map((item, idx) => (
            <li key={`${key}-${idx}`} className="flex gap-2.5 text-[15px] text-foreground/85 leading-relaxed">
              <span className="font-mono text-muted-foreground text-xs mt-0.5 shrink-0">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span>{renderInline(item.text, `${key}-${idx}`)}</span>
            </li>
          ))}
        </ol>
      );
    } else {
      nodes.push(
        <ul key={key} className="space-y-1.5 mb-4 pl-1">
          {listBuffer.map((item, idx) => (
            <li key={`${key}-${idx}`} className="flex gap-2.5 text-[15px] text-foreground/85 leading-relaxed">
              <span className="text-muted-foreground mt-2 text-[8px] shrink-0">&bull;</span>
              <span>{renderInline(item.text, `${key}-${idx}`)}</span>
            </li>
          ))}
        </ul>
      );
    }
    listBuffer = [];
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (/^```/.test(line.trim())) {
      flushPara(`p-${i}`);
      flushList(`l-${i}`);
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        codeLines.push(lines[i]);
        i++;
      }
      nodes.push(
        <div key={`code-${i}`} className="mb-4 rounded-lg overflow-hidden border border-white/10 bg-neutral-950">
          {lang && (
            <div className="px-3 py-1 text-[10px] font-mono text-neutral-400 border-b border-white/10 uppercase tracking-wider">
              {lang}
            </div>
          )}
          <pre className="p-3 overflow-x-auto text-[12px] font-mono text-neutral-200 leading-relaxed">
            <code>{codeLines.join("\n")}</code>
          </pre>
        </div>
      );
      i++;
      continue;
    }

    // Tabela (GFM)
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      flushPara(`p-${i}`);
      flushList(`l-${i}`);
      const cells = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const head = cells(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        rows.push(cells(lines[i]));
        i++;
      }
      nodes.push(
        <div key={`t-${i}`} className="mb-5 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-subtle/60">
              <tr>
                {head.map((h, k) => (
                  <th key={k} className="px-3 py-2 text-left font-medium whitespace-nowrap">{renderInline(h, `th-${i}-${k}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, k) => (
                    <td key={k} className="px-3 py-2 align-top text-foreground/85">{renderInline(c, `td-${i}-${ri}-${k}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Citação
    if (/^>\s?/.test(line)) {
      flushPara(`p-${i}`);
      flushList(`l-${i}`);
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      nodes.push(
        <blockquote key={`q-${i}`} className="mb-4 border-l-2 border-border pl-4 text-[15px] text-muted-foreground">
          {renderInline(quote.join(" "), `q-${i}`)}
        </blockquote>
      );
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,4})\s+(.*)/);
    if (headingMatch) {
      flushPara(`p-${i}`);
      flushList(`l-${i}`);
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();

      if (level === 1) {
        nodes.push(
          <h2
            key={`h-${i}`}
            className="text-2xl font-semibold mt-8 mb-4 first:mt-0 tracking-tight"
          >
            {renderInline(text, `h-${i}`)}
          </h2>
        );
      } else if (level === 2) {
        nodes.push(
          <h3
            key={`h-${i}`}
            className="text-xl font-semibold mt-8 mb-3 tracking-tight"
          >
            {renderInline(text, `h-${i}`)}
          </h3>
        );
      } else {
        nodes.push(
          <h4 key={`h-${i}`} className="text-base font-semibold mt-6 mb-2">
            {renderInline(text, `h-${i}`)}
          </h4>
        );
      }
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(---|\*\*\*)\s*$/.test(line.trim())) {
      flushPara(`p-${i}`);
      flushList(`l-${i}`);
      nodes.push(<hr key={`hr-${i}`} className="border-t border-border my-6" />);
      i++;
      continue;
    }

    // Checkbox list item
    const checkMatch = line.match(/^\s*[-*]\s+\[([ xX])\]\s+(.*)/);
    if (checkMatch) {
      flushPara(`p-${i}`);
      if (listBuffer.length && listBuffer[0].type !== "check") flushList(`l-${i}`);
      listBuffer.push({ type: "check", text: checkMatch[2], checked: /x/i.test(checkMatch[1]) });
      i++;
      continue;
    }

    // Bullet list item
    const bulletMatch = line.match(/^\s*[-*]\s+(.*)/);
    if (bulletMatch) {
      flushPara(`p-${i}`);
      if (listBuffer.length && listBuffer[0].type !== "ul") flushList(`l-${i}`);
      listBuffer.push({ type: "ul", text: bulletMatch[1] });
      i++;
      continue;
    }

    // Numbered list item
    const numMatch = line.match(/^\s*\d+\.\s+(.*)/);
    if (numMatch) {
      flushPara(`p-${i}`);
      if (listBuffer.length && listBuffer[0].type !== "ol") flushList(`l-${i}`);
      listBuffer.push({ type: "ol", text: numMatch[1] });
      i++;
      continue;
    }

    // Blank line: flush open blocks
    if (line.trim() === "") {
      flushPara(`p-${i}`);
      flushList(`l-${i}`);
      i++;
      continue;
    }

    // Plain paragraph text
    flushList(`l-${i}`);
    paraBuffer.push(line.trim());
    i++;
  }

  flushPara("p-end");
  flushList("l-end");

  return { frontmatter, bodyNodes: nodes };
}
