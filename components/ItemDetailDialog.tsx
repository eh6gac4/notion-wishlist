"use client";

import { useEffect, useState } from "react";
import type {
  AnalysisResult,
  WishItem,
  WishItemPatch,
} from "@/lib/types";
import { WishItemFields, type WishItemFieldsValues } from "./WishItemFields";
import { btnGhost, btnPrimary, cardCls, panelCls } from "@/lib/styles";

function analyzeButtonLabel(
  isAnalyzing: boolean,
  hasHistory: boolean
): string {
  if (isAnalyzing) return "分析中…";
  return hasHistory ? "再分析" : "分析する";
}

export function ItemDetailDialog({
  item,
  onPatch,
  onDelete,
  onAnalyze,
  onClose,
}: {
  item: WishItem;
  onPatch: (patch: WishItemPatch) => void;
  onDelete: () => void;
  onAnalyze: () => Promise<AnalysisResult>;
  onClose: () => void;
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisResult[] | null>(null);
  const [values, setValues] = useState<WishItemFieldsValues>(() => ({
    name: item.name,
    url: item.url ?? "",
    price: item.price !== null ? String(item.price) : "",
    status: item.status,
    priority: item.priority,
    purchaseDate: item.purchaseDate ? item.purchaseDate.slice(0, 10) : "",
    memo: item.memo ?? "",
  }));

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/items/${item.id}/analyses`);
        const data = (await res.json().catch(() => ({}))) as {
          analyses?: AnalysisResult[];
          error?: string;
        };
        if (!alive) return;
        if (!res.ok || !data.analyses) {
          setAnalysisError(data.error ?? "分析履歴の取得に失敗しました");
          setAnalyses([]);
          return;
        }
        setAnalyses(data.analyses);
      } catch (e) {
        if (!alive) return;
        setAnalysisError(
          e instanceof Error ? e.message : "分析履歴の取得に失敗しました"
        );
        setAnalyses([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [item.id]);

  function handleSave() {
    if (!values.name.trim()) return;
    onPatch({
      name: values.name.trim(),
      url: values.url.trim() || null,
      price: values.price ? Number(values.price) : null,
      status: values.status,
      priority: values.priority,
      purchaseDate: values.purchaseDate || null,
      memo: values.memo.trim() || null,
    });
  }

  async function handleAnalyze() {
    if (analyzing) return;
    setAnalysisError(null);
    setAnalyzing(true);
    try {
      const result = await onAnalyze();
      setAnalyses((prev) => [...(prev ?? []), result]);
    } catch (e) {
      setAnalysisError(e instanceof Error ? e.message : "分析に失敗しました");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="項目の詳細"
      className="fixed inset-0 z-50 flex items-center justify-center bg-fc-ink/70 px-4 py-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`max-h-[90vh] w-full max-w-md overflow-y-auto p-4 shadow-lg ${cardCls}`}>
        <h2 className="mb-3 text-lg">詳細</h2>
        <WishItemFields
          values={values}
          onChange={(next) => setValues((v) => ({ ...v, ...next }))}
          nameRequired
          allowUnset
        />

        <section aria-label="AI 分析" className={`mt-4 ${panelCls}`}>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-xs">AI 分析</span>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing}
              className={`${btnGhost} px-2 py-0.5 text-xs`}
            >
              {analyzeButtonLabel(analyzing, (analyses?.length ?? 0) > 0)}
            </button>
          </div>
          {analysisError && (
            <p className="mb-1.5 text-xs text-fc-red">{analysisError}</p>
          )}
          {analyses === null ? (
            <p className="text-xs text-[var(--fc-muted)]">履歴を読み込み中…</p>
          ) : analyses.length === 0 ? (
            analyzing ? null : (
              <p className="text-xs text-[var(--fc-muted)]">
                未分析。ボタンを押すと Gemini が判定し、Notion ページ本文に追記します。
              </p>
            )
          ) : (
            <ul className="space-y-2">
              {[...analyses].reverse().map((entry, i) => (
                <li
                  key={`${entry.analyzedAt}-${i}`}
                  className="border-2 border-fc-ink bg-[var(--fc-surface)] p-2"
                >
                  <p className="mb-1 text-xs text-[var(--fc-muted)]">
                    {entry.analyzedAt}
                    {i === 0 && analyses.length > 1 ? "（最新）" : ""}
                  </p>
                  <pre className="whitespace-pre-wrap break-words font-sans text-xs leading-relaxed">
                    {entry.analysis}
                  </pre>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onDelete}
            className={`${btnPrimary} px-2 py-1 text-xs`}
          >
            削除
          </button>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className={`${btnGhost} px-3 py-1.5 text-sm`}
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!values.name.trim()}
              className={`${btnPrimary} px-3.5 py-1.5 text-sm`}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
