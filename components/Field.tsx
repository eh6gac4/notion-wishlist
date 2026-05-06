export function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 text-[11.5px] ${className ?? ""}`}>
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "rounded border border-[var(--notion-border-strong)] bg-white px-2 py-1.5 text-[13px] outline-none focus:border-neutral-400 dark:bg-[#252525] dark:focus:border-neutral-500";

export const inputClsCompact =
  "rounded border border-[var(--notion-border-strong)] bg-white px-2 py-1 text-[12.5px] outline-none focus:border-neutral-400 dark:bg-[#252525] dark:focus:border-neutral-500";
