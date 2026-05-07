"use client";

import { useEffect, useState } from "react";
import type { WishItem, WishItemPatch } from "@/lib/types";
import { WishItemFields, type WishItemFieldsValues } from "./WishItemFields";

function analyzeButtonLabel(
  isAnalyzing: boolean,
  hasAnalysis: boolean
): string {
  if (isAnalyzing) return "分析中…";
  return hasAnalysis ? "再分析" : "分析する";
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
  onAnalyze: () => Promise<void>;
  onClose: () => void;
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
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
      await onAnalyze();
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-[var(--notion-border-strong)] bg-white p-4 shadow-lg dark:bg-[#202020]">
        <h2 className="mb-3 text-[14px] font-medium">詳細</h2>
        <WishItemFields
          values={values}
          onChange={(next) => setValues((v) => ({ ...v, ...next }))}
          nameRequired
          allowUnset
        />

        <section
          aria-label="AI 分析"
          className="mt-4 rounded border border-[var(--notion-border)] bg-neutral-50 p-2.5 dark:bg-white/[0.03]"
        >
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-neutral-600 dark:text-neutral-300">
              AI 分析
            </span>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="rounded border border-[var(--notion-border-strong)] px-2 py-0.5 text-[12px] text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-200 dark:hover:bg-white/5"
            >
              {analyzeButtonLabel(analyzing, !!item.analysis)}
            </button>
          </div>
          {analysisError && (
            <p className="mb-1.5 text-[12px] text-rose-600 dark:text-rose-400">
              {analysisError}
            </p>
          )}
          {item.analysis ? (
            <pre className="whitespace-pre-wrap break-words font-sans text-[12.5px] leading-relaxed text-neutral-800 dark:text-neutral-200">
              {item.analysis}
            </pre>
          ) : analyzing ? null : (
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
              未分析。ボタンを押すと Claude が「買うべきか」を判定します。
            </p>
          )}
        </section>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onDelete}
            className="rounded px-2 py-1 text-[12px] text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
          >
            削除
          </button>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-3 py-1.5 text-[13px] text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/5"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!values.name.trim()}
              className="rounded bg-neutral-900 px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
