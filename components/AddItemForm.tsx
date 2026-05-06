"use client";

import { useEffect, useRef, useState } from "react";
import type { WishItemInput, WishStatus, WishPriority } from "@/lib/types";
import {
  STATUSES,
  PRIORITIES,
  DEFAULT_STATUS,
  DEFAULT_PRIORITY,
} from "@/lib/types";
import { Field, inputCls } from "./Field";

export type AddState = WishStatus | "default" | null;

export function AddItemForm({
  addState,
  onClose,
  onSubmit,
  pending,
}: {
  addState: AddState;
  onClose: () => void;
  onSubmit: (input: WishItemInput) => Promise<boolean>;
  pending: boolean;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<WishStatus>(DEFAULT_STATUS);
  const [priority, setPriority] = useState<WishPriority>(DEFAULT_PRIORITY);
  const [purchaseDate, setPurchaseDate] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addState === null) return;
    setStatus(addState === "default" ? DEFAULT_STATUS : addState);
    const t = setTimeout(() => nameRef.current?.focus(), 10);
    return () => clearTimeout(t);
  }, [addState]);

  function reset() {
    setName("");
    setUrl("");
    setPrice("");
    setStatus(DEFAULT_STATUS);
    setPriority(DEFAULT_PRIORITY);
    setPurchaseDate("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const ok = await onSubmit({
      name: name.trim(),
      url: url.trim() || null,
      price: price ? Number(price) : null,
      status,
      priority,
      purchaseDate: purchaseDate || null,
    });
    if (ok) {
      reset();
      onClose();
    }
  }

  if (addState === null) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-[var(--notion-border-strong)] bg-white p-4 dark:bg-[#202020]"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="品名 *" className="sm:col-span-2">
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputCls}
            placeholder="新しい欲しいもの"
          />
        </Field>
        <Field label="URL" className="sm:col-span-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={inputCls}
            placeholder="https://..."
          />
        </Field>
        <Field label="価格 (円)">
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="購入予定日">
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="ステータス">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as WishStatus)}
            className={inputCls}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="優先度">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as WishPriority)}
            className={inputCls}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            reset();
            onClose();
          }}
          className="rounded px-3 py-1.5 text-[13px] text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/5"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={pending || !name.trim()}
          className="rounded bg-neutral-900 px-3.5 py-1.5 text-[13px] font-medium text-white shadow-sm hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {pending ? "追加中..." : "追加"}
        </button>
      </div>
    </form>
  );
}
