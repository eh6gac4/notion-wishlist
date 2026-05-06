export type WishStatus = "検討中" | "購入予定" | "購入済み" | "却下";
export type WishPriority = "高" | "中" | "低";

export type WishItem = {
  id: string;
  name: string;
  url: string | null;
  price: number | null;
  status: WishStatus | null;
  priority: WishPriority | null;
  purchaseDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WishItemInput = {
  name: string;
  url?: string | null;
  price?: number | null;
  status?: WishStatus | null;
  priority?: WishPriority | null;
  purchaseDate?: string | null;
};

export type WishItemPatch = Partial<WishItemInput>;

export const STATUSES: WishStatus[] = [
  "検討中",
  "購入予定",
  "購入済み",
  "却下",
];
export const PRIORITIES: WishPriority[] = ["高", "中", "低"];
