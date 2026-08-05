"use client";

import type { WishStatus } from "@/lib/types";
import { STATUSES } from "@/lib/types";
import { btnPrimary, inputClsCompact, selectGhost } from "@/lib/styles";
import { PixelIcon } from "./PixelIcon";

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
    <div className="flex flex-wrap items-center gap-2 border-b-2 border-fc-ink pb-2 text-xs text-[var(--fc-muted)]">
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
        className={`h-8 w-44 ${inputClsCompact}`}
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
          className={`${btnPrimary} h-8 text-sm`}
        >
          <PixelIcon name="plus" size={16} />
          新規
        </button>
      </div>
    </div>
  );
}
