// ピクセルUIの共有クラス定数。見た目の変更はここに集約する。

export const focusCls =
  "focus:border-fc-bluedk focus:shadow-sm";

export const inputCls =
  `border-2 border-fc-ink bg-[var(--fc-surface)] px-2 py-1.5 text-base outline-none ${focusCls}`;

export const inputClsCompact =
  `border-2 border-fc-ink bg-[var(--fc-surface)] px-2 py-1 text-xs outline-none ${focusCls}`;

// ネイティブ <select> 用。カスタムドロップダウン化はしない。
export const selectGhost =
  `h-8 border-2 border-fc-ink bg-[var(--fc-surface)] px-1.5 text-xs outline-none ${focusCls}`;

const btnBase =
  "inline-flex items-center gap-1 border-2 border-fc-ink px-3 py-1 text-base " +
  "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none " +
  "disabled:opacity-50 disabled:shadow-none";

export const btnPrimary =
  `${btnBase} bg-fc-red text-fc-paper shadow-sm`;

export const btnGhost =
  `${btnBase} bg-[var(--fc-surface)] text-fc-ink shadow-sm`;

export const btnIcon =
  "inline-flex h-8 w-8 items-center justify-center border-2 border-transparent hover:border-fc-ink hover:bg-[var(--fc-hover)]";

export const cardCls =
  "border-2 border-fc-ink bg-[var(--fc-surface)] p-4 shadow";

export const panelCls =
  "border-2 border-fc-ink bg-[var(--fc-surface-2)] p-3";

export const menuCls =
  "border-2 border-fc-ink bg-[var(--fc-surface)] p-1 shadow";

export const rowHover =
  "hover:bg-[var(--fc-hover)] hover:text-fc-ink";

export const alertCls =
  "border-2 border-fc-ink bg-fc-red p-3 text-sm text-fc-paper";
