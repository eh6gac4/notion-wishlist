import { describe, expect, it } from "vitest";
import { buildAnalysisBlocks } from "@/lib/notion";

function getType(block: unknown): string | undefined {
  return (block as { type?: string }).type;
}

function headingText(block: unknown): string {
  const b = block as {
    heading_3?: { rich_text?: Array<{ text?: { content?: string } }> };
  };
  return b.heading_3?.rich_text?.[0]?.text?.content ?? "";
}

function bulletText(block: unknown): string {
  const b = block as {
    bulleted_list_item?: { rich_text?: Array<{ text?: { content?: string } }> };
  };
  return b.bulleted_list_item?.rich_text?.[0]?.text?.content ?? "";
}

describe("buildAnalysisBlocks", () => {
  it("見出し（divider + heading_3）を最初に置き、行内容を bullet/paragraph に振り分ける", () => {
    const blocks = buildAnalysisBlocks(
      "保留\n・優先度が「中」\n・もう少し検討する余地あり\n断定はできません。",
      "2026-05-07 10:30"
    );

    expect(blocks[0]).toEqual({ type: "divider", divider: {} });
    expect(getType(blocks[1])).toBe("heading_3");
    expect(headingText(blocks[1])).toBe("🤖 AI 分析（2026-05-07 10:30）");

    // 結論「保留」は通常段落
    expect(getType(blocks[2])).toBe("paragraph");
    // 「・」始まりは bulleted_list_item に変換され、先頭マーカーは剥がす
    expect(getType(blocks[3])).toBe("bulleted_list_item");
    expect(bulletText(blocks[3])).toBe("優先度が「中」");
    expect(getType(blocks[4])).toBe("bulleted_list_item");
    expect(getType(blocks[5])).toBe("paragraph");
  });

  it("空行は無視する", () => {
    const blocks = buildAnalysisBlocks("買う\n\n・理由", "2026-05-07 10:30");
    // divider, heading, paragraph(買う), bullet(理由) の 4 ブロックだけ
    expect(blocks).toHaveLength(4);
  });
});
