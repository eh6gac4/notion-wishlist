import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";

describe("manifest", () => {
  const m = manifest();

  it("名前と short_name が定義されている", () => {
    expect(m.name).toBe("Wishlist");
    expect(m.short_name).toBe("Wishlist");
  });

  it("PWA 必須 (192/512) icon を含む", () => {
    const sizes = (m.icons ?? []).map((i) => i.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
  });

  it("maskable purpose の icon を含む", () => {
    const maskable = (m.icons ?? []).find((i) => i.purpose === "maskable");
    expect(maskable).toBeDefined();
    expect(maskable?.sizes).toBe("512x512");
  });

  it("display は standalone", () => {
    expect(m.display).toBe("standalone");
  });

  it("start_url と scope が / を指す", () => {
    expect(m.start_url).toBe("/");
    expect(m.scope).toBe("/");
  });
});
