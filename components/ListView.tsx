"use client";

import { useState } from "react";
import type {
  WishItem,
  WishItemPatch,
  WishStatus,
} from "@/lib/types";
import { STATUSES } from "@/lib/types";
import { PriorityText, StatusDot } from "./Pill";
import { StatusMenu } from "./StatusMenu";

export function ListView({
  items,
  onPatch,
  onDelete,
  onAddInStatus,
  groupByStatus,
}: {
  items: WishItem[];
  onPatch: (id: string, patch: WishItemPatch) => void;
  onDelete: (id: string) => void;
  onAddInStatus: (status: WishStatus) => void;
  groupByStatus: boolean;
}) {
  if (!groupByStatus) {
    return (
      <div>
        {items.length === 0 ? <Empty /> : items.map((it) => (
          <Row
            key={it.id}
            item={it}
            onPatch={(p) => onPatch(it.id, p)}
            onDelete={() => onDelete(it.id)}
          />
        ))}
      </div>
    );
  }

  const groups = new Map<WishStatus | "未設定", WishItem[]>();
  for (const s of STATUSES) groups.set(s, []);
  groups.set("未設定", []);
  for (const it of items) {
    const key = (it.status ?? "未設定") as WishStatus | "未設定";
    groups.get(key)!.push(it);
  }

  const sections: Array<{
    key: WishStatus | "未設定";
    items: WishItem[];
    showAdd: boolean;
  }> = STATUSES.map((s) => ({
    key: s,
    items: groups.get(s)!,
    showAdd: true,
  }));
  const noStatus = groups.get("未設定")!;
  if (noStatus.length > 0) {
    sections.push({ key: "未設定", items: noStatus, showAdd: false });
  }

  return (
    <div className="space-y-4">
      {sections.map((sec) => (
        <Section
          key={sec.key}
          title={sec.key}
          items={sec.items}
          onPatch={onPatch}
          onDelete={onDelete}
          onAdd={
            sec.showAdd ? () => onAddInStatus(sec.key as WishStatus) : undefined
          }
        />
      ))}
    </div>
  );
}

function Section({
  title,
  items,
  onPatch,
  onDelete,
  onAdd,
}: {
  title: WishStatus | "未設定";
  items: WishItem[];
  onPatch: (id: string, patch: WishItemPatch) => void;
  onDelete: (id: string) => void;
  onAdd?: () => void;
}) {
  const [collapsed, setCollapsed] = useState(
    title === "購入済み" || title === "却下"
  );
  return (
    <section>
      <div className="flex items-center gap-2 px-1 py-1.5">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="flex items-center gap-2 rounded px-1 py-0.5 text-[13px] font-medium hover:bg-neutral-100 dark:hover:bg-white/5"
          aria-expanded={!collapsed}
        >
          <Caret expanded={!collapsed} />
          {title !== "未設定" && <StatusDot status={title} />}
          <span>{title}</span>
          <span className="text-[12px] font-normal text-neutral-400 dark:text-neutral-500">
            {items.length}
          </span>
        </button>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="rounded p-1 text-neutral-400 opacity-0 transition group-hover:opacity-100 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-white/5 dark:hover:text-neutral-200"
            aria-label="このステータスに追加"
            title="このステータスに追加"
          >
            <PlusIcon />
          </button>
        )}
      </div>
      {!collapsed && (
        <div>
          {items.length === 0 ? (
            <p className="px-3 py-2 text-[12.5px] text-neutral-400 dark:text-neutral-500">
              なし
            </p>
          ) : (
            items.map((it) => (
              <Row
                key={it.id}
                item={it}
                onPatch={(p) => onPatch(it.id, p)}
                onDelete={() => onDelete(it.id)}
              />
            ))
          )}
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="flex w-full items-center gap-1.5 rounded px-3 py-1.5 text-left text-[12.5px] text-neutral-400 hover:bg-neutral-100/60 hover:text-neutral-700 dark:hover:bg-white/5 dark:hover:text-neutral-200"
            >
              <PlusIcon />新規
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function Row({
  item,
  onPatch,
  onDelete,
}: {
  item: WishItem;
  onPatch: (patch: WishItemPatch) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="group border-b border-[var(--notion-border)]">
      <div className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-50/70 dark:hover:bg-white/[0.03]">
        <StatusMenu
          value={item.status}
          onChange={(next) => onPatch({ status: next })}
        />
        <a
          href={item.url ?? undefined}
          target="_blank"
          rel="noreferrer"
          className={`min-w-0 flex-1 truncate text-[13.5px] ${
            item.url
              ? "text-neutral-900 hover:underline dark:text-neutral-100"
              : "pointer-events-none text-neutral-900 dark:text-neutral-100"
          }`}
          title={item.name}
        >
          {item.name}
        </a>
        <PriorityText priority={item.priority} className="w-6 text-center" />
        {item.purchaseDate && (
          <span className="hidden w-24 text-right text-[12px] text-neutral-500 sm:inline-block dark:text-neutral-400">
            {formatDate(item.purchaseDate)}
          </span>
        )}
        <span className="w-24 text-right text-[13px] tabular-nums text-neutral-600 dark:text-neutral-400">
          {item.price !== null ? `¥${item.price.toLocaleString()}` : ""}
        </span>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="rounded p-1 text-neutral-400 opacity-0 transition group-hover:opacity-100 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-white/5 dark:hover:text-neutral-200"
          aria-label={editing ? "閉じる" : "編集"}
          title={editing ? "閉じる" : "編集"}
        >
          <PencilIcon />
        </button>
      </div>
      {editing && (
        <EditPanel
          item={item}
          onPatch={(p) => {
            onPatch(p);
            setEditing(false);
          }}
          onDelete={() => {
            onDelete();
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}

function EditPanel({
  item,
  onPatch,
  onDelete,
  onClose,
}: {
  item: WishItem;
  onPatch: (patch: WishItemPatch) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [url, setUrl] = useState(item.url ?? "");
  const [price, setPrice] = useState(
    item.price !== null ? String(item.price) : ""
  );
  const [purchaseDate, setPurchaseDate] = useState(
    item.purchaseDate ? item.purchaseDate.slice(0, 10) : ""
  );
  return (
    <div className="grid grid-cols-1 gap-2 bg-neutral-50/60 px-3 py-3 sm:grid-cols-2 dark:bg-white/[0.02]">
      <Field label="品名" className="sm:col-span-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
        />
      </Field>
      <Field label="URL" className="sm:col-span-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className={inputCls}
        />
      </Field>
      <Field label="価格">
        <input
          type="number"
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
      <div className="flex items-center justify-between sm:col-span-2">
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
            className="rounded px-2 py-1 text-[12px] text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/5"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={() =>
              onPatch({
                name: name.trim(),
                url: url.trim() || null,
                price: price ? Number(price) : null,
                purchaseDate: purchaseDate || null,
              })
            }
            disabled={!name.trim()}
            className="rounded bg-neutral-900 px-2.5 py-1 text-[12px] font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            保存
          </button>
        </div>
      </div>
    </div>
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

function Empty() {
  return (
    <p className="border-t border-[var(--notion-border)] py-12 text-center text-[13px] text-neutral-400 dark:text-neutral-500">
      該当する項目がありません
    </p>
  );
}

function Caret({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      className={`text-neutral-400 transition-transform ${
        expanded ? "rotate-90" : ""
      }`}
      fill="currentColor"
    >
      <path d="M3 1.5L7 5L3 8.5V1.5Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M7.25 7.25V2.75a.75.75 0 0 1 1.5 0v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5Z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.082-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064L11.189 6.25Zm2.183-1.675a.25.25 0 0 0 0-.354l-1.086-1.086a.25.25 0 0 0-.354 0L10.811 3.75 12.25 5.189l1.122-1.114Z" />
    </svg>
  );
}

const inputCls =
  "rounded border border-[var(--notion-border-strong)] bg-white px-2 py-1 text-[12.5px] outline-none focus:border-neutral-400 dark:bg-[#252525] dark:focus:border-neutral-500";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
