import { describe, it, expect } from "vitest";
import {
  buildMenuFrame,
  computeMenuSubtitle,
  resolveMenuCliVersion,
  MENU_ITEMS,
  RECEIPT_HORIZON_ITEMS,
  SHARE_HORIZON_ITEMS,
  BANNER_LINES
} from "../src/menu.js";
import { checkHookStatus } from "../src/hooks.js";
import { stripAnsi } from "../src/theme.js";
import { execSync } from "node:child_process";
import path from "node:path";

const binPath = path.resolve(__dirname, "../dist/index.cjs");

// Pictographic emojis (e.g. 🧾, 🔍, 🌐, ⚓, ❌, 🚀, etc.)
const EMOJI_REGEX = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{274C}\u{274E}\u{2705}]/u;

describe("Qodewk CLI Menu System (`menu.test.ts`)", () => {
  describe("Menu Items Definition", () => {
    it("defines 9 core menu options covering 100% of CLI features", () => {
      expect(MENU_ITEMS).toHaveLength(9);
      const keys = MENU_ITEMS.map((item) => item.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(9);
      expect(keys).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "0"]);
      expect(MENU_ITEMS.map((m) => m.id)).toEqual([
        "receipt",
        "audit",
        "share",
        "hooks",
        "storage",
        "notes",
        "doctor",
        "chats",
        "exit"
      ]);
    });

    it("has labels and descriptions for all items without any cheap emojis", () => {
      for (const item of MENU_ITEMS) {
        expect(item.label.length).toBeGreaterThan(0);
        expect(item.description.length).toBeGreaterThan(0);
        expect(EMOJI_REGEX.test(item.label)).toBe(false);
        expect(EMOJI_REGEX.test(item.description)).toBe(false);
      }
    });

    it("defines 6 receipt time-horizon submenu options", () => {
      expect(RECEIPT_HORIZON_ITEMS).toHaveLength(6);
      const ids = RECEIPT_HORIZON_ITEMS.map((i) => i.id);
      expect(ids).toEqual(["latest", "today", "yesterday", "week", "custom", "back"]);
      for (const item of RECEIPT_HORIZON_ITEMS) {
        expect(item.label.length).toBeGreaterThan(0);
        expect(item.description.length).toBeGreaterThan(0);
        expect(EMOJI_REGEX.test(item.label)).toBe(false);
        expect(EMOJI_REGEX.test(item.description)).toBe(false);
      }
    });

    it("defines 6 cloud share time-horizon submenu options", () => {
      expect(SHARE_HORIZON_ITEMS).toHaveLength(6);
      const ids = SHARE_HORIZON_ITEMS.map((i) => i.id);
      expect(ids).toEqual(["latest", "today", "yesterday", "week", "custom", "back"]);
      for (const item of SHARE_HORIZON_ITEMS) {
        expect(item.label.length).toBeGreaterThan(0);
        expect(item.description.length).toBeGreaterThan(0);
        expect(EMOJI_REGEX.test(item.label)).toBe(false);
        expect(EMOJI_REGEX.test(item.description)).toBe(false);
      }
    });
  });

  describe("buildMenuFrame", () => {
    it("renders modern Clack-style left rail, banner, and Claude tokens", () => {
      const rendered = buildMenuFrame(0);
      const plain = stripAnsi(rendered);

      expect(plain).toContain("██████╗");
      expect(plain).toContain("┌");
      expect(plain).toContain("qodewk");
      expect(plain).toContain("v0.11.1");
      expect(plain).toContain("◇");
      expect(plain).toContain("Repository:");
      expect(plain).toContain("◆");
      expect(plain).toContain("Telemetry Control Panel");
      expect(plain).toContain("Description");
      expect(plain).toContain("Inspect git diff and print digital receipt");
      expect(plain).toContain("[✓] Source code was never uploaded to Qodewk");
      expect(plain).toContain("└");
    });

    it("does NOT contain any cheap/tacky emojis in the rendered terminal output", () => {
      for (let i = 0; i < MENU_ITEMS.length; i++) {
        const frame = buildMenuFrame(i);
        const plain = stripAnsi(frame);
        expect(EMOJI_REGEX.test(plain)).toBe(false);
      }
    });

    it("highlights pointer `›` on the currently selected item", () => {
      // Selected index 0 -> 1 Generate Local Receipt
      const frame0 = stripAnsi(buildMenuFrame(0));
      expect(frame0).toContain("› 1  Generate Local Receipt");
      expect(frame0).not.toContain("› 2  Audit Branch or Revision Range");

      // Selected index 1 -> 2 Audit Branch or Revision Range
      const frame1 = stripAnsi(buildMenuFrame(1));
      expect(frame1).toContain("› 2  Audit Branch or Revision Range");
      expect(frame1).not.toContain("› 1  Generate Local Receipt");

      // Selected index 5 -> 6 Git Notes Management
      const frame5 = stripAnsi(buildMenuFrame(5));
      expect(frame5).toContain("› 6  Git Notes Management");
      expect(frame5).not.toContain("› 5  Database & Storage Status");

      // Selected index 6 -> 7 System Health & Diagnostics
      const frame6 = stripAnsi(buildMenuFrame(6));
      expect(frame6).toContain("› 7  System Health & Diagnostics");
      expect(frame6).not.toContain("› 6  Git Notes Management");

      // Selected index 7 -> 8 Workspace Chats & Cost Ledger
      const frame7 = stripAnsi(buildMenuFrame(7));
      expect(frame7).toContain("› 8  Workspace Chats & Cost Ledger");
      expect(frame7).not.toContain("› 7  System Health & Diagnostics");

      // Selected index 8 -> 0 Exit
      const frame8 = stripAnsi(buildMenuFrame(8));
      expect(frame8).toContain("› 0  Exit");
      expect(frame8).not.toContain("› 8  Workspace Chats & Cost Ledger");
    });

    it("keeps line count stable across menu selection changes for flicker-free redraws", () => {
      const counts = [];
      for (let i = 0; i < MENU_ITEMS.length; i++) {
        const frame = buildMenuFrame(i);
        counts.push(frame.split("\n").length);
      }
      const allEqual = counts.every((c) => c === counts[0]);
      expect(allEqual).toBe(true);
    });

    it("dynamically calculates quick jump range in subtitle based on menu items", () => {
      // Main menu (keys 1-8 and 0) -> 0-8 quick jump
      const mainSub = computeMenuSubtitle(MENU_ITEMS, false);
      expect(mainSub).toBe("↑↓ move · enter select · 0-8 quick jump · q quit");

      // Submenu (keys 1-5 and 0) -> 0-5 quick jump
      const subSub = computeMenuSubtitle(RECEIPT_HORIZON_ITEMS, true);
      expect(subSub).toBe("↑↓ move · enter select · 0-5 quick jump · esc / 0 back");

      // Custom menu with 9 items -> 0-9 quick jump
      const extendedItems = [
        ...MENU_ITEMS.filter((i) => i.key !== "0"),
        { id: "extra", key: "9", label: "Extra Feature", description: "Test" },
        { id: "exit", key: "0", label: "Exit", description: "Return" }
      ];
      expect(computeMenuSubtitle(extendedItems, false)).toBe("↑↓ move · enter select · 0-9 quick jump · q quit");

      // Frame includes dynamic subtitle by default
      const frame = stripAnsi(buildMenuFrame(0));
      expect(frame).toContain("0-8 quick jump");
    });

    it("resolves CLI version dynamically from package manifest", () => {
      const ver = resolveMenuCliVersion();
      expect(ver).toMatch(/^\d+\.\d+\.\d+/);
      const frame = stripAnsi(buildMenuFrame(0));
      expect(frame).toContain(`v${ver}`);
    });
  });

  describe("Hooks Inspector (`hooks.ts`)", () => {
    it("reports hook status cleanly for null or invalid directories", () => {
      const status = checkHookStatus(null);
      expect(status.isGit).toBe(false);
      expect(status.hooksDir).toBeNull();
      expect(status.postCommitInstalled).toBe(false);
      expect(status.postRewriteInstalled).toBe(false);
    });
  });

  describe("CLI Command Integration", { timeout: 15000 }, () => {
    it("exposes `menu` command and `-i, --interactive` option in --help", () => {
      const help = execSync(`node "${binPath}" --help`, { encoding: "utf-8" });
      expect(help).toContain("menu");
      expect(help).toContain("-i, --interactive");
    });
  });
});
