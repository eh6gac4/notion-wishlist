import { describe, expect, it } from "vitest";
import { buildAnalysisBlocks, parseAnalysesFromBlocks } from "@/lib/notion";

// buildAnalysisBlocks は append 用のリクエスト型を返すが、
// Notion から読み返したときと plain_text の構造は同じなので
// このテストでは plain_text を補完して parse の入力に使う。
type AnyBlock = Record<string, unknown>;
function asResponseBlocks(reqBlocks: unknown[]): AnyBlock[] {
  return reqBlocks.map((b) => {
    const block = b as { type: string } & Record<string, unknown>;
    const inner = block[block.type] as
      | { rich_text?: Array<{ text?: { content?: string } }> }
      | undefined;
    if (inner?.rich_text) {
      inner.rich_text = inner.rich_text.map((rt) => ({
        ...rt,
        plain_text: rt.text?.content ?? "",
      }));
    }
    return block;
  });
}

describe("parseAnalysesFromBlocks", () => {
  it("単一の分析を見出し+本文から復元する", () => {
    const blocks = asResponseBlocks(
      buildAnalysisBlocks(
        "保留\n・優先度が「中」\n・代替案を検討",
        "2026-05-07 10:30"
      )
    );

    const entries = parseAnalysesFromBlocks(
      blocks as Parameters<typeof parseAnalysesFromBlocks>[0]
    );
    expect(entries).toEqual([
      {
        analyzedAt: "2026-05-07 10:30",
        analysis: "保留\n・優先度が「中」\n・代替案を検討",
      },
    ]);
  });

  it("複数の分析が連続していても文書順で配列にする", () => {
    const blocks = asResponseBlocks([
      ...buildAnalysisBlocks("買う\n・即決", "2026-05-01 09:00"),
      ...buildAnalysisBlocks("見送る\n・予算超過", "2026-05-07 10:30"),
    ]);

    const entries = parseAnalysesFromBlocks(
      blocks as Parameters<typeof parseAnalysesFromBlocks>[0]
    );
    expect(entries).toHaveLength(2);
    expect(entries[0].analyzedAt).toBe("2026-05-01 09:00");
    expect(entries[1].analyzedAt).toBe("2026-05-07 10:30");
  });

  it("AI 分析以外の見出しやブロックは無視する", () => {
    const blocks: AnyBlock[] = [
      {
        type: "heading_2",
        heading_2: {
          rich_text: [{ plain_text: "別の見出し", text: { content: "別の見出し" } }],
        },
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{ plain_text: "前書き", text: { content: "前書き" } }],
        },
      },
      ...asResponseBlocks(buildAnalysisBlocks("保留", "2026-05-07 10:30")),
    ];
    const entries = parseAnalysesFromBlocks(
      blocks as Parameters<typeof parseAnalysesFromBlocks>[0]
    );
    expect(entries).toHaveLength(1);
    expect(entries[0].analysis).toBe("保留");
  });
});
