import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkRateLimit,
  recordFailure,
  recordSuccess,
} from "@/lib/rate-limit";

const PROD_IP = "203.0.113.1";

describe("rate-limit", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
    recordSuccess(PROD_IP);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("dev/localhost is never blocked", () => {
    vi.stubEnv("NODE_ENV", "development");
    for (let i = 0; i < 10; i++) recordFailure("any");
    expect(checkRateLimit("any").blocked).toBe(false);
  });

  it("locks after 5 consecutive failures", () => {
    for (let i = 0; i < 4; i++) {
      const r = recordFailure(PROD_IP);
      expect(r.blocked).toBe(false);
    }
    const fifth = recordFailure(PROD_IP);
    expect(fifth.blocked).toBe(true);

    const check = checkRateLimit(PROD_IP);
    expect(check.blocked).toBe(true);
    expect(check.unlocksAt).toBeInstanceOf(Date);
  });

  it("recordSuccess resets the counter", () => {
    recordFailure(PROD_IP);
    recordFailure(PROD_IP);
    recordSuccess(PROD_IP);
    const check = checkRateLimit(PROD_IP);
    expect(check.blocked).toBe(false);
    expect(check.remaining).toBe(5);
  });
});
