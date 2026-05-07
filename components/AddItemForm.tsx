"use client";

import { useEffect, useRef, useState } from "react";
import type { WishItemInput, WishStatus } from "@/lib/types";
import { DEFAULT_PRIORITY, DEFAULT_STATUS } from "@/lib/types";
import {
  WishItemFields,
  type WishItemFieldsValues,
} from "./WishItemFields";

export type AddState = WishStatus | "default" | null;

const initialValues = (status: WishStatus): WishItemFieldsValues => ({
  name: "",
  url: "",
  price: "",
  status,
  priority: DEFAULT_PRIORITY,
  purchaseDate: "",
  memo: "",
});

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
  const [values, setValues] = useState<WishItemFieldsValues>(() =>
    initialValues(DEFAULT_STATUS)
  );
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addState === null) return;
    setValues(
      initialValues(addState === "default" ? DEFAULT_STATUS : addState)
    );
    const t = setTimeout(() => nameRef.current?.focus(), 10);
    return () => clearTimeout(t);
  }, [addState]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name.trim()) return;
    const ok = await onSubmit({
      name: values.name.trim(),
      url: values.url.trim() || null,
      price: values.price ? Number(values.price) : null,
      status: values.status,
      priority: values.priority,
      purchaseDate: values.purchaseDate || null,
      memo: values.memo.trim() || null,
    });
    if (ok) {
      setValues(initialValues(DEFAULT_STATUS));
      onClose();
    }
  }

  if (addState === null) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-[var(--notion-border-strong)] bg-white p-4 dark:bg-[#202020]"
    >
      <WishItemFields
        values={values}
        onChange={(next) => setValues((v) => ({ ...v, ...next }))}
        nameRef={nameRef}
        namePlaceholder="新しい欲しいもの"
        nameRequired
      />
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setValues(initialValues(DEFAULT_STATUS));
            onClose();
          }}
          className="rounded px-3 py-1.5 text-[13px] text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/5"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={pending || !values.name.trim()}
          className="rounded bg-neutral-900 px-3.5 py-1.5 text-[13px] font-medium text-white shadow-sm hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {pending ? "追加中..." : "追加"}
        </button>
      </div>
    </form>
  );
}
