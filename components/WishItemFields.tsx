"use client";

import type { Ref } from "react";
import type { WishPriority, WishStatus } from "@/lib/types";
import { PRIORITIES, STATUSES } from "@/lib/types";
import { Field, inputCls } from "./Field";

export type WishItemFieldsValues = {
  name: string;
  url: string;
  price: string;
  status: WishStatus | null;
  priority: WishPriority | null;
  purchaseDate: string;
  memo: string;
};

export function WishItemFields({
  values,
  onChange,
  nameRef,
  namePlaceholder,
  nameRequired,
  allowUnset,
}: {
  values: WishItemFieldsValues;
  onChange: (next: Partial<WishItemFieldsValues>) => void;
  nameRef?: Ref<HTMLInputElement>;
  namePlaceholder?: string;
  nameRequired?: boolean;
  allowUnset?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label={nameRequired ? "品名 *" : "品名"} className="sm:col-span-2">
        <input
          ref={nameRef}
          value={values.name}
          onChange={(e) => onChange({ name: e.target.value })}
          required={nameRequired}
          placeholder={namePlaceholder}
          className={inputCls}
        />
      </Field>
      <Field label="URL" className="sm:col-span-2">
        <div className="relative">
          <input
            type="url"
            value={values.url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="https://..."
            className={`${inputCls} w-full pr-7`}
          />
          {values.url && (
            <button
              type="button"
              onClick={() => onChange({ url: "" })}
              aria-label="URL をクリア"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-neutral-400 hover:text-neutral-700 focus:text-neutral-700 focus:outline-none dark:hover:text-neutral-200 dark:focus:text-neutral-200"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 4 L12 12 M12 4 L4 12" />
              </svg>
            </button>
          )}
        </div>
      </Field>
      <Field label="価格 (円)">
        <input
          type="number"
          min={0}
          value={values.price}
          onChange={(e) => onChange({ price: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label="購入予定日">
        <input
          type="date"
          value={values.purchaseDate}
          onChange={(e) => onChange({ purchaseDate: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label="ステータス">
        <select
          value={values.status ?? ""}
          onChange={(e) =>
            onChange({ status: (e.target.value || null) as WishStatus | null })
          }
          className={inputCls}
        >
          {allowUnset && <option value="">未設定</option>}
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>
      <Field label="優先度">
        <select
          value={values.priority ?? ""}
          onChange={(e) =>
            onChange({
              priority: (e.target.value || null) as WishPriority | null,
            })
          }
          className={inputCls}
        >
          {allowUnset && <option value="">未設定</option>}
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>
      <Field label="メモ" className="sm:col-span-2">
        <textarea
          value={values.memo}
          onChange={(e) => onChange({ memo: e.target.value })}
          rows={3}
          placeholder="検討理由や型番、店舗候補など"
          className={`${inputCls} resize-y`}
        />
      </Field>
    </div>
  );
}
