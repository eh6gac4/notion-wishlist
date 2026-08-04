import "./globals.css";
import type { Metadata, Viewport } from "next";
import { DotGothic16 } from "next/font/google";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import InstallPrompt from "@/components/InstallPrompt";
import AppleSplashScreens from "@/components/AppleSplashScreens";

const dotGothic16 = DotGothic16({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dot",
});

export const metadata: Metadata = {
  applicationName: "Wishlist",
  title: {
    default: "Wishlist",
    template: "%s | Wishlist",
  },
  description: "Notion で管理する欲しいものリスト",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "Wishlist",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#101010",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={dotGothic16.variable}>
      <head>
        <AppleSplashScreens />
      </head>
      <body className="min-h-screen font-sans">
        {children}
        <ServiceWorkerRegister />
        <InstallPrompt />
      </body>
    </html>
  );
}
