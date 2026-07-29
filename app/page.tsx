import { isMockMode } from "@/lib/store";
import { WishlistApp } from "@/components/WishlistApp";

export default function Page() {
  const mock = isMockMode();

  return (
    <main className="mx-auto max-w-3xl px-6 pwa-pt pwa-pb">
      <header className="mb-4 flex items-baseline gap-2">
        <h1 className="text-[22px] font-semibold tracking-tight">🛒 Wishlist</h1>
        {mock && (
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            ダミー
          </span>
        )}
      </header>

      <WishlistApp />
    </main>
  );
}
