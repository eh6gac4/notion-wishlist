export const dynamic = "force-static";

export const metadata = {
  title: "オフライン",
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-2xl font-semibold">オフラインです</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        ネットワークに接続すると最新の Wishlist に戻れます。
      </p>
    </main>
  );
}
