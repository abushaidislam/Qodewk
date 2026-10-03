import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

let isEnvLoaded = false;

/**
 * Automatically loads .env and .env.local files from the current repository,
 * apps/web directory, or global ~/.qodewk/config.env without any external dependencies.
 */
export function loadQodewkEnv(startDir: string = process.cwd()): void {
  if (isEnvLoaded) return;
  isEnvLoaded = true;

  const candidates = [
    path.join(startDir, ".env.local"),
    path.join(startDir, ".env"),
    path.join(startDir, "apps", "web", ".env.local"),
    path.join(startDir, "apps", "web", ".env"),
    path.join(os.homedir(), ".qodewk", "config.env")
  ];

  for (const envPath of candidates) {
    if (!fs.existsSync(envPath)) continue;
    try {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();

        // Strip single or double quotes
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }

        // Do not overwrite existing process.env values
        if (!process.env[key] && key) {
          process.env[key] = val;
        }
      }
    } catch {
      // Ignore read errors
    }
  }
}

/**
 * Resolves the canonical base public URL of the Qodewk deployment.
 * Priority:
 * 1. NEXT_PUBLIC_APP_URL
 * 2. QODEWK_APP_URL
 * 3. VERCEL_URL (auto-injected by Vercel deployments)
 * 4. Fallback to http://localhost:3000
 */
export function resolveAppUrl(): string {
  loadQodewkEnv();
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.QODEWK_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3000";

  return url.replace(/\/$/, "");
}

/**
 * Resolves the public receipt ingestion API endpoint.
 * Priority:
 * 1. QODEWK_API_URL
 * 2. {resolveAppUrl()}/api/receipts
 */
export function resolveApiUrl(): string {
  loadQodewkEnv();
  if (process.env.QODEWK_API_URL) {
    return process.env.QODEWK_API_URL.replace(/\/$/, "");
  }
  return `${resolveAppUrl()}/api/receipts`;
}
