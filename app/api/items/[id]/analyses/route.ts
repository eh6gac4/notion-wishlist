import { NextResponse } from "next/server";
import { listAnalyses } from "@/lib/store";
import { errorMessage } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const analyses = await listAnalyses(id);
    return NextResponse.json({ analyses });
  } catch (e) {
    return NextResponse.json({ error: errorMessage(e) }, { status: 502 });
  }
}
