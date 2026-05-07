import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { analyzeItem, createItem, listAnalyses } from "@/lib/store";

const globalRef = globalThis as unknown as { __wishlistMockStore?: unknown };

beforeAll(() => {
  // モックモードを強制（NOTION_TOKEN/DB_ID 不在時は自動だが明示）
  process.env.USE_MOCK_DATA = "1";
});

afterEach(() => {
  delete globalRef.__wishlistMockStore;
});

describe("analyzeItem (mock mode)", () => {
  it("分析テキストと表示用タイムスタンプを返し、履歴にも積む", async () => {
    const created = await createItem({
      name: "テスト商品",
      price: 5000,
      priority: "中",
      status: "検討中",
      memo: "代替案を比較中",
    });

    const result = await analyzeItem(created.id);
    expect(result.analysis).toMatch(/買う|見送る|保留/);
    // YYYY-MM-DD HH:MM のフォーマット
    expect(result.analyzedAt).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);

    const history = await listAnalyses(created.id);
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual(result);
  });

  it("複数回 analyze すると履歴に積み上がる", async () => {
    const created = await createItem({ name: "履歴テスト", priority: "中" });
    await analyzeItem(created.id);
    await analyzeItem(created.id);
    const history = await listAnalyses(created.id);
    expect(history).toHaveLength(2);
  });

  it("優先度「高」のときは結論が「買う」になる", async () => {
    const created = await createItem({
      name: "急ぎで欲しいやつ",
      price: 1000,
      priority: "高",
    });
    const result = await analyzeItem(created.id);
    expect(result.analysis.split("\n")[0]).toBe("買う");
  });

  it("存在しない id はエラーを投げる", async () => {
    await expect(analyzeItem("does-not-exist")).rejects.toThrow(/not found/);
  });

  it("listAnalyses は未分析の id に対して空配列を返す", async () => {
    const created = await createItem({ name: "untouched" });
    expect(await listAnalyses(created.id)).toEqual([]);
  });
});
