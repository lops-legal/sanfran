/**
 * sanitize.ts
 * 
 * XSS protection for user-generated markdown content.
 * Strips dangerous HTML tags and attributes before rendering.
 */

// Allowlisted tags for markdown rendering
const ALLOWED_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr",
  "ul", "ol", "li",
  "strong", "em", "b", "i", "u", "s", "del",
  "code", "pre", "blockquote",
  "a", "img",
  "table", "thead", "tbody", "tr", "th", "td",
  "span", "div",
  "sup", "sub",
]);

// Allowlisted attributes per tag
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title", "width", "height"]),
  code: new Set(["class"]),
  pre: new Set(["class"]),
  td: new Set(["align"]),
  th: new Set(["align"]),
};

/**
 * Lightweight HTML sanitizer.
 * For production, consider using DOMPurify instead.
 * This covers the most common XSS vectors.
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and their content entirely
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  
  // Remove event handlers (onXXX attributes)
  clean = clean.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  
  // Remove javascript: URLs
  clean = clean.replace(/href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'href="#"');
  clean = clean.replace(/src\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'src=""');
  
  // Remove data: URLs from src (can be used for XSS in some contexts)
  clean = clean.replace(/src\s*=\s*(?:"data:[^"]*"|'data:[^']*')/gi, 'src=""');

  // Remove <iframe>, <object>, <embed>, <form>, <input>, <style>
  clean = clean.replace(/<\/?(iframe|object|embed|form|input|textarea|style|link|meta|base)\b[^>]*>/gi, "");
  
  return clean;
}

/**
 * Escape HTML entities for safe text rendering.
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (c) => map[c] || c);
}
