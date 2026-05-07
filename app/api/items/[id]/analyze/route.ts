import { NextResponse } from "next/server";
import { analyzeItem } from "@/lib/store";
import { errorMessage } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const result = await analyzeItem(id);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: errorMessage(e) }, { status: 502 });
  }
}
