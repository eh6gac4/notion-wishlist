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
        <header>
          <h1 className="text-[22px] font-semibold tracking-tight">🛒 Wishlist</h1>
          <p className="mt-1 text-[13px] text-neutral-500 dark:text-neutral-400">
            ログインしてください
          </p>
        </header>

        <form method="POST" action="/api/login" className="space-y-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/"} />

          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="block text-[12px] font-medium text-neutral-700 dark:text-neutral-300"
            >
              ユーザー名
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-[14px] outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-[#1f1f1f] dark:focus:border-neutral-400"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-[12px] font-medium text-neutral-700 dark:text-neutral-300"
            >
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-[14px] outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-[#1f1f1f] dark:focus:border-neutral-400"
            />
          </div>

          {error === "CredentialsSignin" && (
            <div className="rounded-md border border-rose-300 bg-rose-50 p-3 text-[13px] text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
              <p>認証に失敗しました</p>
              {remaining && (
                <p className="mt-0.5 text-[12px] opacity-80">
                  あと {remaining} 回でロックされます
                </p>
              )}
            </div>
          )}
          {error === "locked" && (
            <div className="rounded-md border border-rose-300 bg-rose-50 p-3 text-[13px] text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
              試行回数を超過しました。約 {mins ?? 30} 分後に再試行してください。
            </div>
          )}

          <button
            type="submit"
            disabled={error === "locked"}
            className="w-full rounded-md bg-neutral-900 py-2.5 text-[14px] font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            ログイン
          </button>
        </form>
      </div>
    </main>
  );
}
