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
          className="px-1.5 py-0.5 rounded bg-[#C9A84C]/15 border border-[#C9A84C]/20 text-[#C9A84C] text-[11px] font-mono"
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
            className="text-[#C9A84C] hover:text-[#E0C060] underline underline-offset-2 decoration-[#C9A84C]/40"
          >
            {m[1]}
          </a>
        );
      }
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${i++}`} className="text-[#E8DDD0] font-semibold">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*")) {
      nodes.push(
        <em key={`${keyPrefix}-i-${i++}`} className="text-[#C4B5A0] italic">
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

  let frontmatter: Record<string, string> = {};
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
        <p key={key} className="text-sm text-[#C4B5A0] leading-relaxed mb-3 font-sans">
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
            <li key={`${key}-${idx}`} className="flex items-start gap-2 text-sm">
              <span
                className={`mt-0.5 flex items-center justify-center w-4 h-4 rounded-sm border shrink-0 text-[10px] font-bold ${item.checked
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                  : "border-[#5D4432]/40 text-transparent"
                  }`}
              >
                {item.checked ? "\u2713" : ""}
              </span>
              <span className={`leading-relaxed ${item.checked ? "text-[#8B7D6B] line-through" : "text-[#C4B5A0]"}`}>
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
            <li key={`${key}-${idx}`} className="flex gap-2.5 text-sm text-[#C4B5A0] leading-relaxed">
              <span className="font-mono text-[#C9A84C]/80 text-xs mt-0.5 shrink-0">
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
            <li key={`${key}-${idx}`} className="flex gap-2.5 text-sm text-[#C4B5A0] leading-relaxed">
              <span className="text-[#C9A84C] mt-1.5 text-[8px] shrink-0">&bull;</span>
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
        <div key={`code-${i}`} className="mb-4 rounded-lg overflow-hidden border border-[#3D3226] bg-[#1E180F]">
          {lang && (
            <div className="px-3 py-1 text-[10px] font-mono text-[#8B7D6B] border-b border-[#3D3226] uppercase tracking-wider">
              {lang}
            </div>
          )}
          <pre className="p-3 overflow-x-auto text-[11px] font-mono text-[#C9A84C] leading-relaxed">
            <code>{codeLines.join("\n")}</code>
          </pre>
        </div>
      );
      i++;
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
            className="text-lg font-bold text-[#E8DDD0] mt-6 mb-3 pb-2 border-b border-[#3D3226] first:mt-0 font-sans tracking-tight"
          >
            {renderInline(text, `h-${i}`)}
          </h2>
        );
      } else if (level === 2) {
        nodes.push(
          <h3
            key={`h-${i}`}
            className="flex items-center gap-2 text-sm font-bold text-[#C9A84C] uppercase tracking-wider mt-5 mb-2.5 font-mono"
          >
            <span className="w-1 h-3.5 bg-[#C9A84C] rounded-full shrink-0" />
            {renderInline(text, `h-${i}`)}
          </h3>
        );
      } else {
        nodes.push(
          <h4 key={`h-${i}`} className="text-xs font-bold text-[#E8DDD0] uppercase tracking-wide mt-4 mb-2 font-mono">
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
      nodes.push(<hr key={`hr-${i}`} className="border-t border-[#3D3226] my-5" />);
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
