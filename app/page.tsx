import { isMockMode } from "@/lib/store";
import { WishlistApp } from "@/components/WishlistApp";
import { PixelIcon } from "@/components/PixelIcon";

export default function Page() {
  const mock = isMockMode();

  return (
    <main className="mx-auto max-w-3xl px-6 pwa-pt pwa-pb">
      <header className="mb-4 flex items-center gap-2">
        <PixelIcon name="cart" size={32} />
        <h1 className="text-xl">Wishlist</h1>
        {mock && (
          <span className="border-2 border-fc-ink bg-fc-yellow px-1.5 py-0.5 text-xs text-fc-ink">
            ダミー
          </span>
        )}
      </header>

      <WishlistApp />
    </main>
  );
}
