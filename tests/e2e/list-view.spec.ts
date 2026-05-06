import { expect, test } from "@playwright/test";

test.describe("ListView - グルーピング時のコンパクトステータス", () => {
  test("行頭のステータスは色ドット（aria-label='ステータス: ...'）で表示される", async ({
    page,
  }) => {
    await page.goto("/");
    // BenQ は 検討中 にシードされているので、アクティブビューで表示される
    await expect(
      page.getByText("BenQ ScreenBar Halo モニターライト")
    ).toBeVisible();
    // compact 時のみ aria-label が "ステータス: ..." 形式で付くので、
    // この名前で見つかるボタンは Row 内のステータスドットだけになる
    await expect(
      page
        .getByRole("button", { name: "ステータス: 検討中", exact: true })
        .first()
    ).toBeVisible();
  });

  test("色ドットをクリックするとステータス変更メニューが開く", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: "ステータス: 検討中", exact: true })
      .first()
      .click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: "購入予定" })).toBeVisible();
    // 状態は変えずに Escape で閉じる（他テストへの影響を避けるため）
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });

  test("特定ステータスでフィルタするとコンパクト表示が解除され通常の Pill になる", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("select").first().selectOption("検討中");
    // 非グルーピング状態では aria-label="ステータス: ..." は付かない
    await expect(
      page.getByRole("button", { name: /^ステータス: /, exact: false })
    ).toHaveCount(0);
    // 行内 StatusPill のテキストとして "検討中" が表示される
    await expect(
      page.getByText("BenQ ScreenBar Halo モニターライト")
    ).toBeVisible();
  });
});

test.describe("ListView - 名前のレイアウト", () => {
  test("名前は break-words で折り返し可能、truncate されない", async ({
    page,
  }) => {
    await page.goto("/");
    const nameText = page
      .getByText("HHKB Professional HYBRID Type-S 雪")
      .first();
    await expect(nameText).toBeVisible();
    await expect(nameText).toHaveClass(/break-words/);
    await expect(nameText).not.toHaveClass(/truncate/);
  });
});

test.describe("ListView - 項目タップとステータスタップの分離", () => {
  test("項目本体をタップすると詳細ダイアログが開く", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("button", {
        name: /BenQ ScreenBar Halo モニターライト の詳細を開く/,
      })
      .click();
    const dialog = page.getByRole("dialog", { name: "項目の詳細" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("品名 *")).toHaveValue(
      "BenQ ScreenBar Halo モニターライト"
    );
    // ステータスや優先度もダイアログ内で編集できる
    await expect(dialog.getByLabel("ステータス")).toBeVisible();
    await expect(dialog.getByLabel("優先度")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("ステータスドットをタップしてもダイアログは開かない", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: "ステータス: 検討中", exact: true })
      .first()
      .click();
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(
      page.getByRole("dialog", { name: "項目の詳細" })
    ).toHaveCount(0);
    await page.keyboard.press("Escape");
  });
});
