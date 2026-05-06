import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Notion で管理する欲しいものリスト",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
