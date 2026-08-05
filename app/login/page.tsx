import { PixelIcon } from "@/components/PixelIcon";
import { alertCls, btnPrimary, inputCls } from "@/lib/styles";

type SearchParams = {
  callbackUrl?: string;
  error?: string;
  remaining?: string;
  mins?: string;
};

// 認証済みのまま /login に来た場合は middleware が "/" にリダイレクト済みなので、
// ここでは searchParams だけ読めば足りる。
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { callbackUrl, error, remaining, mins } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm items-center px-6">
      <div className="w-full space-y-6">
        <header className="flex items-center gap-2">
          <PixelIcon name="cart" size={24} />
          <div>
            <h1 className="text-lg">Wishlist</h1>
            <p className="text-xs text-[var(--fc-muted)]">ログインしてください</p>
          </div>
        </header>

        <form method="POST" action="/api/login" className="space-y-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/"} />

          <div className="space-y-1.5">
            <label htmlFor="username" className="block text-xs text-[var(--fc-muted)]">
              ユーザー名
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              className={`w-full ${inputCls}`}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs text-[var(--fc-muted)]">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={`w-full ${inputCls}`}
            />
          </div>

          {error === "CredentialsSignin" && (
            <div className={alertCls}>
              <p>認証に失敗しました</p>
              {remaining && (
                <p className="mt-0.5 text-xs opacity-80">
                  あと {remaining} 回でロックされます
                </p>
              )}
            </div>
          )}
          {error === "locked" && (
            <div className={alertCls}>
              試行回数を超過しました。約 {mins ?? 30} 分後に再試行してください。
            </div>
          )}

          <button
            type="submit"
            disabled={error === "locked"}
            className={`${btnPrimary} w-full justify-center py-2.5 text-sm`}
          >
            ログイン
          </button>
        </form>
      </div>
    </main>
  );
}
