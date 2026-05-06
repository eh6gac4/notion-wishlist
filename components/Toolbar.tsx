"use client";

import type { WishStatus } from "@/lib/types";
import { STATUSES } from "@/lib/types";

export type StatusFilter = WishStatus | "all" | "active";
export type SortKey =
  | "priority"
  | "price-asc"
  | "price-desc"
  | "purchase-date"
  | "updated";

export function Toolbar({
  statusFilter,
  onStatusFilterChange,
  sort,
  onSortChange,
  query,
  onQueryChange,
  count,
  totalPrice,
  onAddClick,
}: {
  statusFilter: StatusFilter;
  onStatusFilterChange: (v: StatusFilter) => void;
  sort: SortKey;
  onSortChange: (v: SortKey) => void;
  query: string;
  onQueryChange: (v: string) => void;
  count: number;
  totalPrice: number;
  onAddClick: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[var(--notion-border)] pb-2 text-[12.5px] text-neutral-500 dark:text-neutral-400">
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
        className={selectGhost}
      >
        <option value="active">アクティブ</option>
        <option value="all">すべて</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortKey)}
        className={selectGhost}
      >
        <option value="priority">優先度順</option>
        <option value="purchase-date">購入予定日順</option>
        <option value="updated">更新日順</option>
        <option value="price-asc">価格 ↑</option>
        <option value="price-desc">価格 ↓</option>
      </select>

      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="検索"
        className="h-7 w-44 rounded border border-transparent bg-transparent px-2 outline-none placeholder:text-neutral-400 hover:bg-neutral-100/70 focus:border-[var(--notion-border-strong)] focus:bg-white dark:hover:bg-white/5 dark:focus:bg-[#202020]"
      />

      <div className="ml-auto flex items-center gap-3">
        <span>
          {count} 件
          {totalPrice > 0 && (
            <span className="ml-1.5">合計 ¥{totalPrice.toLocaleString()}</span>
          )}
        </span>
        <button
          type="button"
          onClick={onAddClick}
          className="inline-flex h-7 items-center rounded bg-neutral-900 px-2.5 text-[13px] font-medium text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <span className="mr-1 text-base leading-none">+</span>新規
        </button>
      </div>
    </div>
  );
}

const selectGhost =
  "h-7 rounded border border-transparent bg-transparent px-1.5 text-neutral-700 outline-none hover:bg-neutral-100/70 focus:border-[var(--notion-border-strong)] focus:bg-white dark:text-neutral-200 dark:hover:bg-white/5 dark:focus:bg-[#202020]";
