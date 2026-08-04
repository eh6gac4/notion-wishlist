"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "./PixelIcon";
import { btnPrimary, cardCls } from "@/lib/styles";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BeforeInstallPromptEvent = any;

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // もし過去に閉じていれば表示しない
    if (localStorage.getItem("pwa-install-dismissed") === "true") {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  if (!isVisible) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  return (
    <div
      className={`fixed left-4 right-4 z-50 flex flex-col gap-3 p-4 md:left-auto md:right-4 md:w-80 ${cardCls}`}
      style={{ bottom: "max(calc(env(safe-area-inset-bottom) + 1rem), 1rem)" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm">アプリとしてインストール</h3>
          <p className="mt-1 text-xs text-[var(--fc-muted)]">
            ホーム画面に追加すると、より快適にアクセスできます。
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-[var(--fc-muted)] hover:text-fc-ink"
          aria-label="閉じる"
        >
          <PixelIcon name="close" size={16} />
        </button>
      </div>
      <button
        onClick={handleInstall}
        className={`${btnPrimary} w-full justify-center text-sm`}
      >
        インストールする
      </button>
    </div>
  );
}
