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
