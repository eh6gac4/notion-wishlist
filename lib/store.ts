import type { WishItem, WishItemInput, WishItemPatch } from "./types";
import {
  listItems as notionList,
  createItem as notionCreate,
  updateItem as notionUpdate,
  archiveItem as notionArchive,
  getItem as notionGet,
} from "./notion";
import {
  listItemsMock,
  createItemMock,
  updateItemMock,
  archiveItemMock,
  analyzeItemMock,
} from "./mock";
import { isMockMode } from "./env";

export { isMockMode };

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

export async function analyzeItem(id: string): Promise<WishItem> {
  if (isMockMode()) return analyzeItemMock(id);
  // dynamic import で @anthropic-ai/sdk を analyze 経路だけに閉じ込め、他 Route の Workers バンドル肥大化を避ける。
  const { analyzeWishItem } = await import("./anthropic");
  const item = await notionGet(id);
  const analysis = await analyzeWishItem(item);
  return notionUpdate(id, { analysis });
}
