import { NextRequest, NextResponse } from "next/server";
import { getRepoSkill } from "../../../../../lib/catalog";
import { getSkillBySlug } from "../../../../../lib/skills-server";

/** Markdown cru da skill. Exposto publicamente em /skills/<slug>.md (rewrite em next.config.ts). */
export async function GET(_request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const markdown = getRepoSkill(slug)?.markdown ?? (await getSkillBySlug(slug))?.markdownContent;
  if (!markdown) return new NextResponse("Skill não encontrada.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
