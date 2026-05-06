"use client";

import { useEffect, useRef, useState } from "react";
import type { WishItemInput, WishStatus, WishPriority } from "@/lib/types";
import { STATUSES, PRIORITIES } from "@/lib/types";

export function AddItemForm({
  open,
  onClose,
  onSubmit,
  pending,
  initialStatus,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: WishItemInput) => Promise<boolean>;
  pending: boolean;
  initialStatus?: WishStatus;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<WishStatus>("検討中");
  const [priority, setPriority] = useState<WishPriority>("中");
  const [purchaseDate, setPurchaseDate] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setStatus(initialStatus ?? "検討中");
      setTimeout(() => nameRef.current?.focus(), 10);
    }
  }, [open, initialStatus]);

  function reset() {
    setName("");
    setUrl("");
    setPrice("");
    setStatus(initialStatus ?? "検討中");
    setPriority("中");
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

  if (!open) return null;

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

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 text-[11.5px] ${className ?? ""}`}>
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "rounded border border-[var(--notion-border-strong)] bg-white px-2 py-1.5 text-[13px] outline-none focus:border-neutral-400 dark:bg-[#252525] dark:focus:border-neutral-500";
