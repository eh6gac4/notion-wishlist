import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  CreatePageParameters,
  UpdatePageParameters,
  AppendBlockChildrenParameters,
} from "@notionhq/client/build/src/api-endpoints";
import type { WishItem, WishItemInput, WishItemPatch } from "./types";

const token = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID;

export const PROPS = {
  name: process.env.NOTION_PROP_NAME ?? "品名",
  url: process.env.NOTION_PROP_URL ?? "URL",
  price: process.env.NOTION_PROP_PRICE ?? "価格",
  status: process.env.NOTION_PROP_STATUS ?? "ステータス",
  priority: process.env.NOTION_PROP_PRIORITY ?? "優先度",
  purchaseDate: process.env.NOTION_PROP_PURCHASE_DATE ?? "購入予定日",
  memo: process.env.NOTION_PROP_MEMO ?? "メモ",
} as const;

let _client: Client | null = null;

export function getNotion(): Client {
  if (!token) {
    throw new Error("NOTION_TOKEN is not set");
  }
  if (!_client) {
    // Workers の nodejs_compat では SDK 既定の node-fetch 経路が落ちるためグローバル fetch を渡す。
    _client = new Client({
      auth: token,
      fetch: (url, init) => globalThis.fetch(url, init),
    });
  }
  return _client;
}

export function getDatabaseId(): string {
  if (!databaseId) {
    throw new Error("NOTION_DATABASE_ID is not set");
  }
  return databaseId;
}

export function isFullPage(page: unknown): page is PageObjectResponse {
  return (
    !!page &&
    typeof page === "object" &&
    (page as { object?: string }).object === "page" &&
    "properties" in page
  );
}

type Property = PageObjectResponse["properties"][string];

export function pageToItem(page: PageObjectResponse): WishItem {
  const p = page.properties;
  return {
    id: page.id,
    name: readTitle(p[PROPS.name]) || "(無題)",
    url: readUrl(p[PROPS.url]),
    price: readNumber(p[PROPS.price]),
    status: readSelect(p[PROPS.status]) as WishItem["status"],
    priority: readSelect(p[PROPS.priority]) as WishItem["priority"],
    purchaseDate: readDateStart(p[PROPS.purchaseDate]),
    memo: readRichText(p[PROPS.memo]),
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
  };
}

function readTitle(prop: Property | undefined): string {
  if (prop?.type !== "title") return "";
  return prop.title.map((t) => t.plain_text).join("");
}

function readUrl(prop: Property | undefined): string | null {
  return prop?.type === "url" ? prop.url ?? null : null;
}

function readNumber(prop: Property | undefined): number | null {
  return prop?.type === "number" ? prop.number ?? null : null;
}

function readSelect(prop: Property | undefined): string | null {
  return prop?.type === "select" ? prop.select?.name ?? null : null;
}

function readDateStart(prop: Property | undefined): string | null {
  return prop?.type === "date" ? prop.date?.start ?? null : null;
}

function readRichText(prop: Property | undefined): string | null {
  if (prop?.type !== "rich_text") return null;
  const text = prop.rich_text.map((t) => t.plain_text).join("");
  return text || null;
}

type PropertyValue = NonNullable<CreatePageParameters["properties"]>[string];

function buildProperties(
  input: WishItemPatch
): Record<string, PropertyValue> {
  const props: Record<string, PropertyValue> = {};

  if (input.name !== undefined) {
    props[PROPS.name] = {
      title: [{ type: "text", text: { content: input.name } }],
    };
  }
  if (input.url !== undefined) {
    props[PROPS.url] = { url: input.url || null };
  }
  if (input.price !== undefined) {
    props[PROPS.price] = { number: input.price };
  }
  if (input.status !== undefined) {
    props[PROPS.status] = input.status
      ? { select: { name: input.status } }
      : { select: null };
  }
  if (input.priority !== undefined) {
    props[PROPS.priority] = input.priority
      ? { select: { name: input.priority } }
      : { select: null };
  }
  if (input.purchaseDate !== undefined) {
    props[PROPS.purchaseDate] = input.purchaseDate
      ? { date: { start: input.purchaseDate } }
      : { date: null };
  }
  if (input.memo !== undefined) {
    props[PROPS.memo] = {
      rich_text: input.memo
        ? [{ type: "text", text: { content: input.memo } }]
        : [],
    };
  }
  return props;
}

export async function getItem(id: string): Promise<WishItem> {
  const notion = getNotion();
  const page = await notion.pages.retrieve({ page_id: id });
  if (!isFullPage(page)) {
    throw new Error("Notion returned a partial page response");
  }
  return pageToItem(page);
}

export async function listItems(): Promise<WishItem[]> {
  const notion = getNotion();
  const items: WishItem[] = [];
  let cursor: string | undefined;
  do {
    const res = await notion.databases.query({
      database_id: getDatabaseId(),
      start_cursor: cursor,
      page_size: 100,
      sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
    });
    for (const page of res.results) {
      if (isFullPage(page)) {
        items.push(pageToItem(page));
      }
    }
    cursor = res.has_more ? res.next_cursor ?? undefined : undefined;
  } while (cursor);
  return items;
}

export async function createItem(input: WishItemInput): Promise<WishItem> {
  const notion = getNotion();
  const properties = buildProperties(input) as CreatePageParameters["properties"];
  const res = await notion.pages.create({
    parent: { database_id: getDatabaseId() },
    properties,
  });
  if (!isFullPage(res)) {
    throw new Error("Notion returned a partial page response");
  }
  return pageToItem(res);
}

export async function updateItem(
  id: string,
  patch: WishItemPatch
): Promise<WishItem> {
  const notion = getNotion();
  const properties = buildProperties(patch) as UpdatePageParameters["properties"];
  const res = await notion.pages.update({
    page_id: id,
    properties,
  });
  if (!isFullPage(res)) {
    throw new Error("Notion returned a partial page response");
  }
  return pageToItem(res);
}

export async function archiveItem(id: string): Promise<void> {
  const notion = getNotion();
  await notion.pages.update({ page_id: id, archived: true });
}

type BlockChild = AppendBlockChildrenParameters["children"][number];

export function buildAnalysisBlocks(
  text: string,
  analyzedAt: Date
): BlockChild[] {
  const heading = `🤖 AI 分析（${formatTimestampJa(analyzedAt)}）`;
  const blocks: BlockChild[] = [
    { type: "divider", divider: {} },
    {
      type: "heading_3",
      heading_3: {
        rich_text: [{ type: "text", text: { content: heading } }],
      },
    },
  ];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const bullet = line.match(/^[・\-•]\s*(.+)$/);
    if (bullet) {
      blocks.push({
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{ type: "text", text: { content: bullet[1] } }],
        },
      });
    } else {
      blocks.push({
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: line } }],
        },
      });
    }
  }
  return blocks;
}

export async function appendAnalysisBlocks(
  pageId: string,
  text: string,
  analyzedAt: Date
): Promise<void> {
  const notion = getNotion();
  await notion.blocks.children.append({
    block_id: pageId,
    children: buildAnalysisBlocks(text, analyzedAt),
  });
}

function formatTimestampJa(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
