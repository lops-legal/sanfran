import { NextRequest, NextResponse } from "next/server";
import { getSkillBySlug } from "../../../../lib/skills-server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    return NextResponse.json({ error: "Skill não encontrada." }, { status: 404 });
  }

  return NextResponse.json(skill);
}
