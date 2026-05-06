"use client";

import { useEffect, useRef, useState } from "react";
import type { WishStatus } from "@/lib/types";
import { STATUSES } from "@/lib/types";
import { StatusDot } from "./Pill";

export function StatusMenu({
  value,
  onChange,
}: {
  value: WishStatus | null;
  onChange: (next: WishStatus | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const label = value ?? "未設定";
  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-7 w-7 items-center justify-center rounded transition hover:bg-neutral-100 dark:hover:bg-white/5"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`ステータス: ${label}`}
        title={label}
      >
        <StatusDot status={value} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-20 mt-1 min-w-[140px] rounded-md border border-[var(--notion-border-strong)] bg-white p-1 shadow-md dark:bg-[#252525]"
        >
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              role="menuitem"
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[13px] hover:bg-neutral-100 dark:hover:bg-white/5"
            >
              <StatusDot status={s} />
              {s}
            </button>
          ))}
          <div className="my-1 border-t border-[var(--notion-border)]" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className="flex w-full items-center rounded px-2.5 py-2 text-left text-[12px] text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/5"
          >
            未設定
          </button>
        </div>
      )}
    </div>
  );
}
