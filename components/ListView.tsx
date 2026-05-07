"use client";

import { useMemo, useState } from "react";
import type {
  AnalysisResult,
  WishItem,
  WishItemPatch,
  WishStatus,
} from "@/lib/types";
import { STATUSES, TERMINAL_STATUSES } from "@/lib/types";
import { PriorityText, StatusDot } from "./Pill";
import { StatusMenu } from "./StatusMenu";
import { ItemDetailDialog } from "./ItemDetailDialog";

export function ListView({
  items,
  onPatch,
  onDelete,
  onAnalyze,
  onAddInStatus,
  groupByStatus,
  hideTerminalSections = false,
}: {
  items: WishItem[];
  onPatch: (id: string, patch: WishItemPatch) => void;
  onDelete: (id: string) => void;
  onAnalyze: (id: string) => Promise<AnalysisResult>;
  onAddInStatus: (status: WishStatus) => void;
  groupByStatus: boolean;
  hideTerminalSections?: boolean;
}) {
  const sections = useMemo(() => {
    if (!groupByStatus) return null;
    const groups = new Map<WishStatus | "未設定", WishItem[]>();
    for (const s of STATUSES) groups.set(s, []);
    groups.set("未設定", []);
    for (const it of items) {
      const key = (it.status ?? "未設定") as WishStatus | "未設定";
      groups.get(key)!.push(it);
    }
    const visibleStatuses = hideTerminalSections
      ? STATUSES.filter((s) => !TERMINAL_STATUSES.includes(s))
      : STATUSES;
    const result: Array<{
      key: WishStatus | "未設定";
      items: WishItem[];
      showAdd: boolean;
    }> = visibleStatuses.map((s) => ({
      key: s,
      items: groups.get(s)!,
      showAdd: true,
    }));
    const noStatus = groups.get("未設定")!;
    if (noStatus.length > 0) {
      result.push({ key: "未設定", items: noStatus, showAdd: false });
    }
    return result;
  }, [items, groupByStatus, hideTerminalSections]);

  if (!sections) {
    return (
      <div>
        {items.length === 0 ? (
          <Empty />
        ) : (
          items.map((it) => (
            <Row
              key={it.id}
              item={it}
              onPatch={(p) => onPatch(it.id, p)}
              onDelete={() => onDelete(it.id)}
              onAnalyze={() => onAnalyze(it.id)}
            />
          ))
        )}
      </div>
    );
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
          onAnalyze={onAnalyze}
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
  onAnalyze,
  onAdd,
}: {
  title: WishStatus | "未設定";
  items: WishItem[];
  onPatch: (id: string, patch: WishItemPatch) => void;
  onDelete: (id: string) => void;
  onAnalyze: (id: string) => Promise<AnalysisResult>;
  onAdd?: () => void;
}) {
  const [collapsed, setCollapsed] = useState(
    title !== "未設定" && TERMINAL_STATUSES.includes(title)
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
                onAnalyze={() => onAnalyze(it.id)}
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
  onAnalyze,
}: {
  item: WishItem;
  onPatch: (patch: WishItemPatch) => void;
  onDelete: () => void;
  onAnalyze: () => Promise<AnalysisResult>;
}) {
  const [open, setOpen] = useState(false);
  const hasMeta =
    item.priority || item.purchaseDate || item.price !== null;
  return (
    <div className="group border-b border-[var(--notion-border)]">
      <div className="flex items-center gap-1 px-3 py-2 hover:bg-neutral-50/70 dark:hover:bg-white/[0.03]">
        <StatusMenu
          value={item.status}
          onChange={(next) => onPatch({ status: next })}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded px-1.5 py-1 text-left hover:bg-neutral-100/60 dark:hover:bg-white/5"
          title={item.name}
          aria-label={`${item.name} の詳細を開く`}
        >
          <span className="break-words text-[13.5px] text-neutral-900 dark:text-neutral-100">
            {item.name}
          </span>
          {hasMeta && (
            <div className="flex items-center gap-3 text-[12px] text-neutral-500 dark:text-neutral-400">
              {item.priority && <PriorityText priority={item.priority} />}
              {item.purchaseDate && (
                <span>{formatDate(item.purchaseDate)}</span>
              )}
              {item.price !== null && (
                <span className="tabular-nums">
                  ¥{item.price.toLocaleString()}
                </span>
              )}
            </div>
          )}
        </button>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-white/5 dark:hover:text-neutral-200"
            aria-label="リンクを開く"
            title="リンクを開く"
          >
            <ExternalLinkIcon />
          </a>
        )}
      </div>
      {open && (
        <ItemDetailDialog
          item={item}
          onPatch={(p) => {
            onPatch(p);
            setOpen(false);
          }}
          onDelete={() => {
            onDelete();
            setOpen(false);
          }}
          onAnalyze={onAnalyze}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
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

function ExternalLinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M9 2.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V4.56l-4.72 4.72a.75.75 0 1 1-1.06-1.06L11.44 3.5H9.75A.75.75 0 0 1 9 2.75Z" />
      <path d="M3.75 3A1.75 1.75 0 0 0 2 4.75v7.5C2 13.216 2.784 14 3.75 14h7.5A1.75 1.75 0 0 0 13 12.25v-3.5a.75.75 0 0 0-1.5 0v3.5a.25.25 0 0 1-.25.25h-7.5a.25.25 0 0 1-.25-.25v-7.5a.25.25 0 0 1 .25-.25h3.5a.75.75 0 0 0 0-1.5h-3.5Z" />
    </svg>
  );
}

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return dateFormatter.format(d);
}
