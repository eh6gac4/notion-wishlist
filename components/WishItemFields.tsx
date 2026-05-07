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
        <input
          type="url"
          value={values.url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="https://..."
          className={inputCls}
        />
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
