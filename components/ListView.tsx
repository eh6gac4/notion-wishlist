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
import { PixelIcon } from "./PixelIcon";
import { rowHover } from "@/lib/styles";

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
      const rawKey = (it.status ?? "未設定") as WishStatus | "未設定";
      const bucket = groups.get(rawKey) ?? groups.get("未設定")!;
      bucket.push(it);
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
          className={`flex items-center gap-2 px-1 py-0.5 text-sm ${rowHover}`}
          aria-expanded={!collapsed}
        >
          <PixelIcon name={collapsed ? "caretRight" : "caretDown"} size={8} />
          {title !== "未設定" && <StatusDot status={title} />}
          <span>{title}</span>
          <span className="text-xs text-[var(--fc-muted)]">
            {items.length}
          </span>
        </button>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className={`p-1 text-[var(--fc-muted)] opacity-0 group-hover:opacity-100 ${rowHover}`}
            aria-label="このステータスに追加"
            title="このステータスに追加"
          >
            <PixelIcon name="plus" size={16} />
          </button>
        )}
      </div>
      {!collapsed && (
        <div>
          {items.length === 0 ? (
            <p className="px-3 py-2 text-xs text-[var(--fc-muted)]">なし</p>
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
              className={`flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-xs text-[var(--fc-muted)] ${rowHover}`}
            >
              <PixelIcon name="plus" size={16} />
              新規
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
    <div className="group border-b-2 border-fc-ink">
      <div className={`flex items-center gap-1 px-3 py-2 ${rowHover}`}>
        <StatusMenu
          value={item.status}
          onChange={(next) => onPatch({ status: next })}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-w-0 flex-1 flex-col items-start gap-0.5 px-1.5 py-1 text-left"
          title={item.name}
          aria-label={`${item.name} の詳細を開く`}
        >
          <span className="break-words text-sm">{item.name}</span>
          {hasMeta && (
            <div className="flex items-center gap-3 text-xs text-[var(--fc-muted)]">
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
            className={`p-1.5 text-[var(--fc-muted)] ${rowHover}`}
            aria-label="リンクを開く"
            title="リンクを開く"
          >
            <PixelIcon name="external" size={16} />
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
    <p className="border-t-2 border-fc-ink py-12 text-center text-sm text-[var(--fc-muted)]">
      該当する項目がありません
    </p>
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
