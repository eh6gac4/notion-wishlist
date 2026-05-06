/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import {
  CacheableResponsePlugin,
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  Serwist,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const apiItemsCaching: RuntimeCaching = {
  matcher: ({ url, request, sameOrigin }) =>
    sameOrigin &&
    request.method === "GET" &&
    url.pathname.startsWith("/api/items"),
  handler: new NetworkFirst({
    cacheName: "wishlist-api",
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 60 }),
      {
        // セッション切れで /login に redirect された HTML や非 JSON を誤キャッシュしない
        cacheWillUpdate: async ({ response }) => {
          if (!response) return null;
          if (response.redirected) return null;
          if (response.type !== "basic") return null;
          const ct = response.headers.get("content-type") ?? "";
          if (!ct.includes("application/json")) return null;
          return response;
        },
      },
    ],
  }),
};

const imageCaching: RuntimeCaching = {
  matcher: ({ request }) => request.destination === "image",
  handler: new CacheFirst({
    cacheName: "wishlist-images",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 64,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  }),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [apiItemsCaching, imageCaching, ...defaultCache],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
