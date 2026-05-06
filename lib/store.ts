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

export function isMockMode(): boolean {
  if (process.env.USE_MOCK_DATA === "1") return true;
  if (process.env.USE_MOCK_DATA === "true") return true;
  if (process.env.USE_MOCK_DATA === "0") return false;
  if (process.env.USE_MOCK_DATA === "false") return false;
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
