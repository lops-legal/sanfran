import { NextRequest, NextResponse } from "next/server";
import { listSkills } from "../../../lib/skills-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const result = await listSkills({
    search: sp.get("search") ?? "",
    vertical: sp.get("vertical"),
    taskCategory: sp.get("taskCategory"),
    minQualityScore: sp.get("minQualityScore") ? Number(sp.get("minQualityScore")) : 0,
    sortBy: sp.get("sortBy") ?? "stars",
    pageSize: sp.get("pageSize") ? Number(sp.get("pageSize")) : 12,
    cursor: sp.get("cursor") != null ? Number(sp.get("cursor")) : null,
  });

  return NextResponse.json(result);
}
