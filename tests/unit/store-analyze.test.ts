import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { analyzeItem, createItem } from "@/lib/store";

const globalRef = globalThis as unknown as { __wishlistMockStore?: unknown };

beforeAll(() => {
  // モックモードを強制（NOTION_TOKEN/DB_ID 不在時は自動だが明示）
  process.env.USE_MOCK_DATA = "1";
});

afterEach(() => {
  delete globalRef.__wishlistMockStore;
});

describe("analyzeItem (mock mode)", () => {
  it("分析結果文字列が analysis フィールドに保存される", async () => {
    const created = await createItem({
      name: "テスト商品",
      price: 5000,
      priority: "中",
      status: "検討中",
      memo: "代替案を比較中",
    });
    expect(created.analysis).toBeNull();

    const analyzed = await analyzeItem(created.id);
    expect(analyzed.analysis).toBeTruthy();
    expect(analyzed.analysis).toMatch(/買う|見送る|保留/);
  });

  it("優先度「高」のときは結論が「買う」になる", async () => {
    const created = await createItem({
      name: "急ぎで欲しいやつ",
      price: 1000,
      priority: "高",
    });
    const analyzed = await analyzeItem(created.id);
    expect(analyzed.analysis?.split("\n")[0]).toBe("買う");
  });

  it("存在しない id はエラーを投げる", async () => {
    await expect(analyzeItem("does-not-exist")).rejects.toThrow(/not found/);
  });
});
