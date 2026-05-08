import { describe, expect, it } from "vitest";
import { buildAnalysisPrompt } from "@/lib/anthropic";
import type { WishItem } from "@/lib/types";

function makeItem(overrides: Partial<WishItem> = {}): WishItem {
  return {
    id: "x",
    name: "テスト商品",
    url: null,
    price: null,
    status: null,
    priority: null,
    purchaseDate: null,
    memo: null,
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildAnalysisPrompt", () => {
  it("品名は必ず含める", () => {
    const prompt = buildAnalysisPrompt(makeItem({ name: "HHKB" }));
    expect(prompt).toContain("品名: HHKB");
  });

  it("価格があれば日本円フォーマットで含める", () => {
    const prompt = buildAnalysisPrompt(makeItem({ price: 38500 }));
    expect(prompt).toContain("価格: ¥38,500");
  });

  it("値が null のフィールドは行ごと省略する", () => {
    const prompt = buildAnalysisPrompt(makeItem());
    expect(prompt).not.toContain("価格:");
    expect(prompt).not.toContain("URL:");
    expect(prompt).not.toContain("メモ:");
    expect(prompt).not.toContain("優先度:");
  });

  it("登録からの経過日数を計算して入れる", () => {
    const item = makeItem({ createdAt: "2026-04-01T00:00:00.000Z" });
    const now = new Date("2026-04-11T00:00:00.000Z");
    const prompt = buildAnalysisPrompt(item, now);
    expect(prompt).toContain("登録からの経過日数: 10日");
  });

  it("今日の日付を Asia/Tokyo の YYYY-MM-DD で含める", () => {
    const now = new Date("2026-05-07T03:00:00.000Z");
    const prompt = buildAnalysisPrompt(makeItem(), now);
    expect(prompt).toContain("今日の日付: 2026-05-07");
  });

  it("出力フォーマット指示と判定語彙が含まれている", () => {
    const prompt = buildAnalysisPrompt(makeItem());
    expect(prompt).toContain("出力フォーマット");
    expect(prompt).toContain("買う");
    expect(prompt).toContain("見送る");
    expect(prompt).toContain("保留");
  });
});
