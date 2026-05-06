import { NextResponse } from "next/server";
import { archiveItem, updateItem } from "@/lib/store";
import { errorMessage } from "@/lib/api";
import type { WishItemPatch } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  let body: WishItemPatch;
  try {
    body = (await req.json()) as WishItemPatch;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  try {
    const item = await updateItem(id, body);
    return NextResponse.json({ item });
  } catch (e) {
    return NextResponse.json({ error: errorMessage(e) }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    await archiveItem(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: errorMessage(e) }, { status: 500 });
  }
}
