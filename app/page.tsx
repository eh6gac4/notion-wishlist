import { listItems, isMockMode } from "@/lib/store";
import { WishlistApp } from "@/components/WishlistApp";
import type { WishItem } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  let items: WishItem[] = [];
  let error: string | null = null;
  const mock = isMockMode();
  try {
    items = await listItems();
  } catch (e) {
    error = e instanceof Error ? e.message : "unknown error";
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-4 flex items-baseline gap-2">
        <h1 className="text-[22px] font-semibold tracking-tight">🛒 Wishlist</h1>
        {mock && (
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            ダミー
          </span>
        )}
      </header>

      {error ? (
        <div className="rounded-md border border-rose-300 bg-rose-50 p-4 text-[13px] text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          <p className="font-semibold">読み込みに失敗しました</p>
          <p className="mt-1 break-all">{error}</p>
        </div>
      ) : (
        <WishlistApp initialItems={items} />
      )}
    </main>
  );
}
