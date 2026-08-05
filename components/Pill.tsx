import type { WishPriority, WishStatus } from "@/lib/types";

const STATUS_DOT: Record<WishStatus | "未設定", string> = {
  検討中: "bg-fc-yellow",
  保留: "bg-fc-blue",
  購入予定: "bg-fc-purple",
  購入済み: "bg-fc-green",
  却下: "bg-fc-graydk",
  未設定: "bg-fc-gray",
};

const PRIORITY_TEXT: Record<WishPriority | "未設定", string> = {
  高: "text-fc-red",
  中: "text-fc-ink",
  低: "text-[var(--fc-muted)]",
  未設定: "text-[var(--fc-muted)]",
};

export function StatusDot({ status }: { status: WishStatus | null }) {
  const key = status ?? "未設定";
  return (
    <span
      className={`inline-block h-2 w-2 ${STATUS_DOT[key]}`}
      aria-label={key}
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
    <span className={`inline-flex items-center gap-1.5 text-xs ${className}`}>
      <StatusDot status={status} />
      <span className={status ? "" : "text-[var(--fc-muted)]"}>
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
    return <span className={`${PRIORITY_TEXT["未設定"]} ${className}`}>—</span>;
  return (
    <span className={`text-xs tabular-nums ${PRIORITY_TEXT[priority]} ${className}`}>
      {priority}
    </span>
  );
}
