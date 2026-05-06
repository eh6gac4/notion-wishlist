import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  CreatePageParameters,
  UpdatePageParameters,
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
} as const;

let _client: Client | null = null;

export function getNotion(): Client {
  if (!token) {
    throw new Error("NOTION_TOKEN is not set");
  }
  if (!_client) {
    _client = new Client({ auth: token });
  }
  return _client;
}

export function getDatabaseId(): string {
  if (!databaseId) {
    throw new Error("NOTION_DATABASE_ID is not set");
  }
  return databaseId;
}

function isFullPage(page: unknown): page is PageObjectResponse {
  return (
    !!page &&
    typeof page === "object" &&
    (page as { object?: string }).object === "page" &&
    "properties" in page
  );
}

function readTitle(prop: unknown): string {
  if (!prop || typeof prop !== "object") return "";
  const p = prop as { type?: string; title?: Array<{ plain_text: string }> };
  if (p.type !== "title" || !p.title) return "";
  return p.title.map((t) => t.plain_text).join("");
}

function readUrl(prop: unknown): string | null {
  if (!prop || typeof prop !== "object") return null;
  const p = prop as { type?: string; url?: string | null };
  if (p.type !== "url") return null;
  return p.url ?? null;
}

function readNumber(prop: unknown): number | null {
  if (!prop || typeof prop !== "object") return null;
  const p = prop as { type?: string; number?: number | null };
  if (p.type !== "number") return null;
  return p.number ?? null;
}

function readSelect(prop: unknown): string | null {
  if (!prop || typeof prop !== "object") return null;
  const p = prop as {
    type?: string;
    select?: { name: string } | null;
  };
  if (p.type !== "select") return null;
  return p.select?.name ?? null;
}

function readDateStart(prop: unknown): string | null {
  if (!prop || typeof prop !== "object") return null;
  const p = prop as {
    type?: string;
    date?: { start: string; end: string | null } | null;
  };
  if (p.type !== "date") return null;
  return p.date?.start ?? null;
}

export function pageToItem(page: PageObjectResponse): WishItem {
  const props = page.properties;
  return {
    id: page.id,
    name: readTitle(props[PROPS.name]) || "(無題)",
    url: readUrl(props[PROPS.url]),
    price: readNumber(props[PROPS.price]),
    status: (readSelect(props[PROPS.status]) as WishItem["status"]) ?? null,
    priority:
      (readSelect(props[PROPS.priority]) as WishItem["priority"]) ?? null,
    purchaseDate: readDateStart(props[PROPS.purchaseDate]),
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
  };
}

type PropertyValue = NonNullable<
  CreatePageParameters["properties"]
>[string];

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
  return props;
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
