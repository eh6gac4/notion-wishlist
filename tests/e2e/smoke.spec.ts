import { expect, test } from "@playwright/test";

test.describe("Wishlist", () => {
  test("トップページが表示され、ダミーデータが見える", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: /Wishlist/ })
    ).toBeVisible();
    // ダミーモードのバッジ
    await expect(page.getByText("ダミー", { exact: false })).toBeVisible();
    // シードデータの 1 つ
    await expect(
      page.getByText("HHKB Professional HYBRID Type-S 雪")
    ).toBeVisible();
  });

  test("「購入済み」セクションを展開すると購入済みアイテムが見える", async ({
    page,
  }) => {
    await page.goto("/");
    // デフォルト（アクティブ）でも「購入済み」は表示されないが、フィルタを「すべて」に
    const select = page.locator("select").first();
    await select.selectOption("all");
    // 「購入済み」のセクション見出しは折りたたみ状態で見える
    const purchasedHeader = page.getByRole("button", { name: /購入済み/ });
    await expect(purchasedHeader).toBeVisible();
    // クリックで展開
    await purchasedHeader.click();
    await expect(page.getByText("ロジクール MX Master 3S")).toBeVisible();
  });

  test("検索ボックスで品名フィルタが効く", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("検索").fill("HHKB");
    await expect(
      page.getByText("HHKB Professional HYBRID Type-S 雪")
    ).toBeVisible();
    await expect(
      page.getByText("BenQ ScreenBar Halo モニターライト")
    ).toHaveCount(0);
  });
});

test.describe("PWA", () => {
  test("manifest.webmanifest が JSON で配信される", async ({ request }) => {
    const res = await request.get("/manifest.webmanifest");
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.name).toBe("Wishlist");
    expect(json.display).toBe("standalone");
    expect(Array.isArray(json.icons)).toBe(true);
    expect(json.icons.length).toBeGreaterThanOrEqual(3);
  });

  test('<link rel="manifest"> と theme-color が head にある', async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
      "href",
      "/manifest.webmanifest"
    );
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
      "content",
      "#0f172a"
    );
  });

  test("/offline ページが表示される", async ({ page }) => {
    await page.goto("/offline");
    await expect(
      page.getByRole("heading", { name: "オフラインです" })
    ).toBeVisible();
  });
});
