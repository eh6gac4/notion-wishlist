"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type {
  WishItem,
  WishItemInput,
  WishItemPatch,
  WishStatus,
} from "@/lib/types";
import { PRIORITIES, TERMINAL_STATUSES } from "@/lib/types";
import type { AnalysisResult } from "@/lib/types";
import { Toolbar } from "./Toolbar";
import type { StatusFilter, SortKey } from "./Toolbar";
import { ListView } from "./ListView";
import { AddItemForm, type AddState } from "./AddItemForm";

export function WishlistApp() {
  const [items, setItems] = useState<WishItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [sort, setSort] = useState<SortKey>("priority");
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [addState, setAddState] = useState<AddState>(null);

  useEffect(() => {
    async function loadItems() {
      try {
        const res = await fetch("/api/items");
        if (!res.ok) {
          throw new Error("アイテムの読み込みに失敗しました");
        }
        const data = await res.json();
        if (data.items) {
          setItems(data.items);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "読み込みエラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    }
    loadItems();
  }, []);

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
    const data = (await res.json()) as { item?: WishItem; error?: string };
    if (!res.ok) {
      setError(data.error ?? "作成に失敗しました");
      return false;
    }
    if (data.item) {
      const created = data.item;
      setItems((prev) => [created, ...prev]);
    }
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
      const data = (await res.json().catch(() => ({}))) as { error?: string };
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
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "削除に失敗しました");
      setItems(prev);
    }
  }

  async function handleAnalyze(id: string): Promise<AnalysisResult> {
    const res = await fetch(`/api/items/${id}/analyze`, { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as Partial<
      AnalysisResult & { error: string }
    >;
    if (!res.ok || !data.analysis || !data.analyzedAt) {
      throw new Error(data.error ?? "分析に失敗しました");
    }
    return { analysis: data.analysis, analyzedAt: data.analyzedAt };
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

      {isLoading ? (
        <SkeletonList />
      ) : (
        <ListView
          items={visible}
          groupByStatus={groupByStatus}
          hideTerminalSections={statusFilter === "active"}
          onPatch={handlePatch}
          onDelete={handleDelete}
          onAnalyze={handleAnalyze}
          onAddInStatus={(s) => setAddState(s)}
        />
      )}
    </div>
  );
}

function priorityIndex(p: WishItem["priority"]): number {
  if (!p) return 99;
  const i = PRIORITIES.indexOf(p);
  return i === -1 ? 99 : i;
}

function SkeletonList() {
  return (
    <div className="space-y-4 mt-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm animate-pulse">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mt-2"></div>
          <div className="flex gap-2 mt-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
