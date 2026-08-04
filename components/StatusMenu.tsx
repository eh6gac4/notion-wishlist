"use client";

import { useEffect, useRef, useState } from "react";
import type { WishStatus } from "@/lib/types";
import { STATUSES } from "@/lib/types";
import { StatusDot } from "./Pill";
import { btnIcon, menuCls, rowHover } from "@/lib/styles";

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
        className={btnIcon}
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
          className={`absolute left-0 top-full z-20 mt-1 min-w-[140px] ${menuCls}`}
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
              className={`flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm ${rowHover}`}
            >
              <StatusDot status={s} />
              {s}
            </button>
          ))}
          <div className="my-1 border-t-2 border-fc-ink" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className={`flex w-full items-center px-2.5 py-2 text-left text-xs text-[var(--fc-muted)] ${rowHover}`}
          >
            未設定
          </button>
        </div>
      )}
    </div>
  );
}
