import { NextResponse } from "next/server";
import { getCatalogStats } from "../../../../lib/skills-server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getCatalogStats());
}
