import Anthropic from "@anthropic-ai/sdk";
import type { WishItem } from "./types";

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  if (!_client) {
    // Workers の nodejs_compat では SDK 既定の経路が落ちるためグローバル fetch を渡す。
    _client = new Anthropic({
      apiKey,
      fetch: (url, init) => globalThis.fetch(url, init),
    });
  }
  return _client;
}

export function buildAnalysisPrompt(
  item: WishItem,
  now: Date = new Date()
): string {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
  }).format(now);
  const lines: string[] = [`今日の日付: ${today}`, `品名: ${item.name}`];
  if (item.price !== null) {
    lines.push(`価格: ¥${item.price.toLocaleString("ja-JP")}`);
  }
  if (item.url) lines.push(`URL: ${item.url}`);
  if (item.status) lines.push(`現在のステータス: ${item.status}`);
  if (item.priority) lines.push(`優先度: ${item.priority}`);
  if (item.purchaseDate) {
    lines.push(`購入予定日: ${item.purchaseDate.slice(0, 10)}`);
  }
  const created = new Date(item.createdAt).getTime();
  if (Number.isFinite(created)) {
    const days = Math.floor((now.getTime() - created) / 86_400_000);
    if (days >= 0) lines.push(`登録からの経過日数: ${days}日`);
  }
  if (item.memo) lines.push(`メモ: ${item.memo}`);

  return [
    "あなたはユーザーの「ほしいものリスト」のアイテムを分析し、買うべきかをアドバイスするアシスタントです。",
    "以下のアイテム情報を踏まえ、買うべきか・見送るべきかを判断してください。",
    "",
    lines.join("\n"),
    "",
    "出力フォーマット:",
    "・1 行目: 結論を「買う」「見送る」「保留」のいずれか一語で",
    "・2 行目以降: 理由を 2〜3 点、各行先頭に「・」を付けて簡潔に",
    "・全体で日本語 200〜400 字程度。推測の根拠は明示し、断定的すぎる助言は避けてください。",
  ].join("\n");
}

export async function analyzeWishItem(item: WishItem): Promise<string> {
  const client = getAnthropic();
  const model = process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;
  const res = await client.messages.create({
    model,
    max_tokens: 600,
    messages: [{ role: "user", content: buildAnalysisPrompt(item) }],
  });
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  if (!text) throw new Error("分析結果が空でした");
  return text;
}
