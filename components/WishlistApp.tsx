"use client";

import { useMemo, useState, useTransition } from "react";
import type {
  WishItem,
  WishItemInput,
  WishItemPatch,
  WishStatus,
} from "@/lib/types";
import { PRIORITIES, TERMINAL_STATUSES } from "@/lib/types";
import { Toolbar } from "./Toolbar";
import type { StatusFilter, SortKey } from "./Toolbar";
import { ListView } from "./ListView";
import { AddItemForm, type AddState } from "./AddItemForm";

export function WishlistApp({ initialItems }: { initialItems: WishItem[] }) {
  const [items, setItems] = useState<WishItem[]>(initialItems);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [sort, setSort] = useState<SortKey>("priority");
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [addState, setAddState] = useState<AddState>(null);

  const groupByStatus = statusFilter === "all" || statusFilter === "active";

  const visible = useMemo(() => {
    let arr = items.slice();
    if (statusFilter === "active") {
      arr = arr.filter(
        (it) => !it.status || !TERMINAL_STATUSES.includes(it.status)
      );
    } else if (statusFilter !== "all") {
      arr = arr.filter((it) => it.status === statusFilter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      arr = arr.filter((it) => it.name.toLowerCase().includes(q));
    }
    arr.sort((a, b) => {
      switch (sort) {
        case "priority": {
          const pa = priorityIndex(a.priority);
          const pb = priorityIndex(b.priority);
          if (pa !== pb) return pa - pb;
          return b.updatedAt.localeCompare(a.updatedAt);
        }
        case "price-asc":
          return (a.price ?? Infinity) - (b.price ?? Infinity);
        case "price-desc":
          return (b.price ?? -Infinity) - (a.price ?? -Infinity);
        case "purchase-date":
          return (a.purchaseDate ?? "9999").localeCompare(
            b.purchaseDate ?? "9999"
          );
        case "updated":
          return b.updatedAt.localeCompare(a.updatedAt);
      }
    });
    return arr;
  }, [items, statusFilter, sort, query]);

  const totalPrice = useMemo(
    () => visible.reduce((sum, it) => sum + (it.price ?? 0), 0),
    [visible]
  );

  async function handleCreate(input: WishItemInput) {
    setError(null);
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "作成に失敗しました");
      return false;
    }
    setItems((prev) => [data.item as WishItem, ...prev]);
    return true;
  }

  async function handlePatch(id: string, patch: WishItemPatch) {
    setError(null);
    const prev = items;
    setItems((curr) =>
      curr.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
    const res = await fetch(`/api/items/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "更新に失敗しました");
      setItems(prev);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("この項目をアーカイブしますか？")) return;
    setError(null);
    const prev = items;
    setItems((curr) => curr.filter((it) => it.id !== id));
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "削除に失敗しました");
      setItems(prev);
    }
  }

  return (
    <div className="space-y-3">
      <Toolbar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sort={sort}
        onSortChange={setSort}
        query={query}
        onQueryChange={setQuery}
        count={visible.length}
        totalPrice={totalPrice}
        onAddClick={() => setAddState("default")}
      />

      {error && (
        <div className="rounded border border-rose-300 bg-rose-50 px-3 py-2 text-[13px] text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      <AddItemForm
        addState={addState}
        onClose={() => setAddState(null)}
        pending={pending}
        onSubmit={(input) =>
          new Promise<boolean>((resolve) => {
            startTransition(async () => {
              resolve(await handleCreate(input));
            });
          })
        }
      />

      <ListView
        items={visible}
        groupByStatus={groupByStatus}
        onPatch={handlePatch}
        onDelete={handleDelete}
        onAddInStatus={(s) => setAddState(s)}
      />
    </div>
  );
}

function priorityIndex(p: WishItem["priority"]): number {
  if (!p) return 99;
  const i = PRIORITIES.indexOf(p);
  return i === -1 ? 99 : i;
}
