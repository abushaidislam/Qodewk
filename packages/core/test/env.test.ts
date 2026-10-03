import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { resolveAppUrl, resolveApiUrl, loadQodewkEnv } from "../src/env.js";

describe("Dynamic Environment & Domain Resolver", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset env
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.QODEWK_APP_URL;
    delete process.env.QODEWK_API_URL;
    delete process.env.VERCEL_URL;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should prioritize NEXT_PUBLIC_APP_URL when set", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://custom-domain.com/";
    expect(resolveAppUrl()).toBe("https://custom-domain.com");
    expect(resolveApiUrl()).toBe("https://custom-domain.com/api/receipts");
  });

  it("should support QODEWK_APP_URL when NEXT_PUBLIC_APP_URL is not set", () => {
    process.env.QODEWK_APP_URL = "https://my-team-portal.io";
    expect(resolveAppUrl()).toBe("https://my-team-portal.io");
    expect(resolveApiUrl()).toBe("https://my-team-portal.io/api/receipts");
  });

  it("should automatically detect VERCEL_URL on Vercel preview/production deployments", () => {
    process.env.VERCEL_URL = "qodewk-preview-abc123.vercel.app";
    expect(resolveAppUrl()).toBe("https://qodewk-preview-abc123.vercel.app");
    expect(resolveApiUrl()).toBe("https://qodewk-preview-abc123.vercel.app/api/receipts");
  });

  it("should allow explicit QODEWK_API_URL override", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://frontend.com";
    process.env.QODEWK_API_URL = "https://backend-api.com/v1/receipts";
    expect(resolveAppUrl()).toBe("https://frontend.com");
    expect(resolveApiUrl()).toBe("https://backend-api.com/v1/receipts");
  });

  it("should fallback to localhost:3000 when no domain is configured", () => {
    expect(resolveAppUrl()).toBe("http://localhost:3000");
    expect(resolveApiUrl()).toBe("http://localhost:3000/api/receipts");
  });
});
