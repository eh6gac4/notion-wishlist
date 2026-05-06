import path from "node:path";
import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const baseConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist(baseConfig);

// dev only: enables getCloudflareContext() bindings under `next dev`.
if (process.env.NODE_ENV === "development") {
  import("@opennextjs/cloudflare")
    .then(({ initOpenNextCloudflareForDev }) => initOpenNextCloudflareForDev())
    .catch((e) => console.error("[opennext dev init] failed:", e));
}
