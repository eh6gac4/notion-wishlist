import type { WishPriority, WishStatus } from "@/lib/types";

const STATUS_DOT: Record<WishStatus, string> = {
  検討中: "bg-amber-400",
  購入予定: "bg-violet-500",
  購入済み: "bg-emerald-500",
  却下: "bg-neutral-400",
};

const PRIORITY_TEXT: Record<WishPriority, string> = {
  高: "text-rose-600 dark:text-rose-400",
  中: "text-neutral-600 dark:text-neutral-300",
  低: "text-neutral-400 dark:text-neutral-500",
};

export function StatusDot({ status }: { status: WishStatus | null }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${
        status ? STATUS_DOT[status] : "bg-neutral-300 dark:bg-neutral-600"
      }`}
      aria-label={status ?? "未設定"}
    />
  );
}

export function StatusPill({
  status,
  className = "",
}: {
  status: WishStatus | null;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[12.5px] ${className}`}
    >
      <StatusDot status={status} />
      <span className={status ? "" : "text-neutral-400 dark:text-neutral-500"}>
        {status ?? "未設定"}
      </span>
    </span>
  );
}

export function PriorityText({
  priority,
  className = "",
}: {
  priority: WishPriority | null;
  className?: string;
}) {
  if (!priority)
    return (
      <span className={`text-neutral-300 dark:text-neutral-600 ${className}`}>
        —
      </span>
    );
  return (
    <span
      className={`text-[12.5px] tabular-nums ${PRIORITY_TEXT[priority]} ${className}`}
    >
      {priority}
    </span>
  );
}
