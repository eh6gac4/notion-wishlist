import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wishlist",
    short_name: "Wishlist",
    description: "Notion で管理する欲しいものリスト",
    start_url: "/",
    id: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#101010",
    theme_color: "#101010",
    lang: "ja",
    categories: ["productivity", "utilities"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/maskable-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
