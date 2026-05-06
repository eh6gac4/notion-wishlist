import { describe, expect, it } from "vitest";
import { pageToItem } from "@/lib/notion";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

function fixturePage(
  overrides: Partial<PageObjectResponse["properties"]> = {}
): PageObjectResponse {
  const base: PageObjectResponse = {
    object: "page",
    id: "page-1",
    created_time: "2026-01-01T00:00:00.000Z",
    last_edited_time: "2026-02-01T00:00:00.000Z",
    created_by: { object: "user", id: "u1" },
    last_edited_by: { object: "user", id: "u1" },
    cover: null,
    icon: null,
    parent: { type: "database_id", database_id: "db-1" },
    archived: false,
    in_trash: false,
    url: "https://example.com",
    public_url: null,
    properties: {
      品名: {
        id: "p1",
        type: "title",
        title: [
          {
            type: "text",
            text: { content: "テスト商品", link: null },
            plain_text: "テスト商品",
            href: null,
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: "default",
            },
          },
        ],
      },
      URL: { id: "p2", type: "url", url: "https://example.com/x" },
      価格: { id: "p3", type: "number", number: 12345 },
      ステータス: {
        id: "p4",
        type: "select",
        select: { id: "s1", name: "検討中", color: "yellow" },
      },
      優先度: {
        id: "p5",
        type: "select",
        select: { id: "s2", name: "高", color: "red" },
      },
      購入予定日: {
        id: "p6",
        type: "date",
        date: {
          start: "2026-04-01",
          end: null,
          time_zone: null,
        },
      },
      ...overrides,
    },
  } as unknown as PageObjectResponse;
  return base;
}

describe("pageToItem", () => {
  it("Notion の各プロパティを WishItem にマッピングする", () => {
    const item = pageToItem(fixturePage());
    expect(item.id).toBe("page-1");
    expect(item.name).toBe("テスト商品");
    expect(item.url).toBe("https://example.com/x");
    expect(item.price).toBe(12345);
    expect(item.status).toBe("検討中");
    expect(item.priority).toBe("高");
    expect(item.purchaseDate).toBe("2026-04-01");
    expect(item.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(item.updatedAt).toBe("2026-02-01T00:00:00.000Z");
  });

  it("Title が空のときは (無題) になる", () => {
    const item = pageToItem(
      fixturePage({
        品名: { id: "p1", type: "title", title: [] },
      })
    );
    expect(item.name).toBe("(無題)");
  });

  it("オプショナルなフィールドが null のときも壊れない", () => {
    const item = pageToItem(
      fixturePage({
        URL: { id: "p2", type: "url", url: null },
        価格: { id: "p3", type: "number", number: null },
        ステータス: { id: "p4", type: "select", select: null },
        優先度: { id: "p5", type: "select", select: null },
        購入予定日: { id: "p6", type: "date", date: null },
      })
    );
    expect(item.url).toBeNull();
    expect(item.price).toBeNull();
    expect(item.status).toBeNull();
    expect(item.priority).toBeNull();
    expect(item.purchaseDate).toBeNull();
  });
});
