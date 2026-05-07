import { expect, test } from "@playwright/test";

test.describe("AI 分析機能", () => {
  test("詳細ダイアログから分析を実行すると結果が表示される", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("button", {
        name: /BenQ ScreenBar Halo モニターライト の詳細を開く/,
      })
      .click();

    const dialog = page.getByRole("dialog", { name: "項目の詳細" });
    await expect(dialog).toBeVisible();

    const analysisSection = dialog.getByRole("region", { name: "AI 分析" });
    await expect(analysisSection).toBeVisible();
    // 履歴の取得が完了するまで「未分析。」プレースホルダが出る
    await expect(
      analysisSection.getByText("未分析。", { exact: false })
    ).toBeVisible();

    await analysisSection
      .getByRole("button", { name: "分析する" })
      .click();

    // 分析結果には結論語のいずれかが含まれる（モック実装）
    await expect(
      analysisSection.getByText(/買う|見送る|保留/)
    ).toBeVisible();
    // タイムスタンプ（YYYY-MM-DD HH:MM）が表示される
    await expect(
      analysisSection.getByText(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)
    ).toBeVisible();
    // ボタンは「再分析」に変わる
    await expect(
      analysisSection.getByRole("button", { name: "再分析" })
    ).toBeVisible();
  });
});
