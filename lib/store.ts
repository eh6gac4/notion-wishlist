import type { WishItem, WishItemInput, WishItemPatch } from "./types";
import {
  listItems as notionList,
  createItem as notionCreate,
  updateItem as notionUpdate,
  archiveItem as notionArchive,
} from "./notion";
import {
  listItemsMock,
  createItemMock,
  updateItemMock,
  archiveItemMock,
} from "./mock";

const TRUTHY = new Set(["1", "true"]);
const FALSY = new Set(["0", "false"]);

export function isMockMode(): boolean {
  const flag = process.env.USE_MOCK_DATA;
  if (flag && TRUTHY.has(flag)) return true;
  if (flag && FALSY.has(flag)) return false;
  return !process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID;
}

export async function listItems(): Promise<WishItem[]> {
  return isMockMode() ? listItemsMock() : notionList();
}

export async function createItem(input: WishItemInput): Promise<WishItem> {
  return isMockMode() ? createItemMock(input) : notionCreate(input);
}

export async function updateItem(
  id: string,
  patch: WishItemPatch
): Promise<WishItem> {
  return isMockMode() ? updateItemMock(id, patch) : notionUpdate(id, patch);
}

export async function archiveItem(id: string): Promise<void> {
  return isMockMode() ? archiveItemMock(id) : notionArchive(id);
}
