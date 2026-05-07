import type { WishItem, WishItemInput, WishItemPatch } from "./types";

type Store = {
  items: Map<string, WishItem>;
  seeded: boolean;
};

const globalRef = globalThis as unknown as {
  __wishlistMockStore?: Store;
};

function getStore(): Store {
  if (!globalRef.__wishlistMockStore) {
    globalRef.__wishlistMockStore = {
      items: new Map(),
      seeded: false,
    };
  }
  const store = globalRef.__wishlistMockStore;
  if (!store.seeded) {
    seed(store);
    store.seeded = true;
  }
  return store;
}

function seed(store: Store) {
  const now = new Date().toISOString();
  const samples: WishItem[] = [
    {
      id: "mock-1",
      name: "HHKB Professional HYBRID Type-S 雪",
      url: "https://happyhackingkb.com/jp/products/hybrid_types/",
      price: 38500,
      status: "購入予定",
      priority: "高",
      purchaseDate: addDays(now, 14),
      memo: "英語配列・無刻印モデルを優先",
      createdAt: addDays(now, -7),
      updatedAt: addDays(now, -1),
    },
    {
      id: "mock-2",
      name: "BenQ ScreenBar Halo モニターライト",
      url: "https://www.benq.com/ja-jp/lighting/monitor-light/screenbar-halo.html",
      price: 19900,
      status: "検討中",
      priority: "中",
      purchaseDate: null,
      memo: null,
      createdAt: addDays(now, -14),
      updatedAt: addDays(now, -3),
    },
    {
      id: "mock-3",
      name: "ハーマンミラー セイルチェア",
      url: null,
      price: 110000,
      status: "検討中",
      priority: "低",
      purchaseDate: null,
      memo: "ショールームで座り心地を確認してから判断",
      createdAt: addDays(now, -30),
      updatedAt: addDays(now, -5),
    },
    {
      id: "mock-4",
      name: "ロジクール MX Master 3S",
      url: "https://www.logicool.co.jp/ja-jp/shop/p/mx-master-3s",
      price: 16940,
      status: "購入済み",
      priority: "中",
      purchaseDate: addDays(now, -10),
      memo: null,
      createdAt: addDays(now, -45),
      updatedAt: addDays(now, -10),
    },
    {
      id: "mock-5",
      name: "Anker 充電器（旧モデル）",
      url: null,
      price: 4500,
      status: "却下",
      priority: "低",
      purchaseDate: null,
      memo: null,
      createdAt: addDays(now, -20),
      updatedAt: addDays(now, -2),
    },
  ];
  for (const it of samples) store.items.set(it.id, it);
}

function addDays(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function makeId(): string {
  return `mock-${Math.random().toString(36).slice(2, 10)}`;
}

export async function listItemsMock(): Promise<WishItem[]> {
  const store = getStore();
  return Array.from(store.items.values()).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
}

export async function createItemMock(
  input: WishItemInput
): Promise<WishItem> {
  const store = getStore();
  const now = new Date().toISOString();
  const item: WishItem = {
    id: makeId(),
    name: input.name,
    url: input.url ?? null,
    price: input.price ?? null,
    status: input.status ?? null,
    priority: input.priority ?? null,
    purchaseDate: input.purchaseDate ?? null,
    memo: input.memo ?? null,
    createdAt: now,
    updatedAt: now,
  };
  store.items.set(item.id, item);
  return item;
}

export async function updateItemMock(
  id: string,
  patch: WishItemPatch
): Promise<WishItem> {
  const store = getStore();
  const existing = store.items.get(id);
  if (!existing) {
    throw new Error(`item not found: ${id}`);
  }
  const updated: WishItem = {
    ...existing,
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.url !== undefined ? { url: patch.url ?? null } : {}),
    ...(patch.price !== undefined ? { price: patch.price ?? null } : {}),
    ...(patch.status !== undefined ? { status: patch.status ?? null } : {}),
    ...(patch.priority !== undefined
      ? { priority: patch.priority ?? null }
      : {}),
    ...(patch.purchaseDate !== undefined
      ? { purchaseDate: patch.purchaseDate ?? null }
      : {}),
    ...(patch.memo !== undefined ? { memo: patch.memo ?? null } : {}),
    updatedAt: new Date().toISOString(),
  };
  store.items.set(id, updated);
  return updated;
}

export async function archiveItemMock(id: string): Promise<void> {
  const store = getStore();
  store.items.delete(id);
}

export async function analyzeItemMock(
  id: string
): Promise<{ analysis: string; analyzedAt: string }> {
  const store = getStore();
  const existing = store.items.get(id);
  if (!existing) {
    throw new Error(`item not found: ${id}`);
  }
  return {
    analysis: cannedAnalysis(existing),
    analyzedAt: new Date().toISOString(),
  };
}

function cannedAnalysis(item: WishItem): string {
  const days = Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(item.createdAt).getTime()) / 86_400_000
    )
  );
  const verdict =
    item.priority === "高"
      ? "買う"
      : item.priority === "低" || (item.price ?? 0) >= 100_000
        ? "見送る"
        : "保留";
  const reasons: string[] = [];
  reasons.push(`・優先度が「${item.priority ?? "未設定"}」で登録から ${days} 日経過`);
  if (item.price !== null) {
    reasons.push(`・価格 ¥${item.price.toLocaleString("ja-JP")} を予算と相談する余地あり`);
  }
  if (item.memo) {
    reasons.push(`・メモ「${item.memo}」の懸念を解消できれば判断しやすい`);
  } else {
    reasons.push("・メモが空欄なので、決め手・代替案を書き出してから再判断するのが安全");
  }
  return [verdict, ...reasons].join("\n") + "\n（※ モックデータの簡易分析です）";
}
