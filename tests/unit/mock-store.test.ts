import { afterEach, describe, expect, it } from "vitest";
import {
  archiveItemMock,
  createItemMock,
  listItemsMock,
  updateItemMock,
} from "@/lib/mock";

const globalRef = globalThis as unknown as { __wishlistMockStore?: unknown };

afterEach(() => {
  // 各テスト間でストアを初期化
  delete globalRef.__wishlistMockStore;
});

describe("mock store", () => {
  it("シードデータを初回 list で返す", async () => {
    const items = await listItemsMock();
    expect(items.length).toBeGreaterThan(0);
    const names = items.map((i) => i.name);
    expect(names).toContain("HHKB Professional HYBRID Type-S 雪");
  });

  it("createItemMock が新しいアイテムを追加し、id を発行する", async () => {
    const before = await listItemsMock();
    const created = await createItemMock({
      name: "テスト商品",
      url: "https://example.com",
      price: 1000,
      status: "検討中",
      priority: "中",
    });

    expect(created.id).toMatch(/^mock-/);
    expect(created.name).toBe("テスト商品");
    expect(created.price).toBe(1000);

    const after = await listItemsMock();
    expect(after.length).toBe(before.length + 1);
    expect(after.some((i) => i.id === created.id)).toBe(true);
  });

  it("updateItemMock が指定フィールドのみ更新する", async () => {
    const created = await createItemMock({
      name: "before",
      price: 100,
      status: "検討中",
      priority: "低",
    });

    const updated = await updateItemMock(created.id, {
      name: "after",
      price: 999,
    });

    expect(updated.name).toBe("after");
    expect(updated.price).toBe(999);
    expect(updated.status).toBe("検討中"); // 触っていない
    expect(updated.priority).toBe("低");
    expect(updated.updatedAt >= created.updatedAt).toBe(true);
  });

  it("archiveItemMock が一覧から削除する", async () => {
    const created = await createItemMock({ name: "doomed" });
    await archiveItemMock(created.id);
    const after = await listItemsMock();
    expect(after.some((i) => i.id === created.id)).toBe(false);
  });

  it("存在しない id の更新はエラーを投げる", async () => {
    await expect(updateItemMock("not-found", { name: "x" })).rejects.toThrow(
      /not found/
    );
  });
});
