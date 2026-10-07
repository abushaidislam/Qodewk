import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { brandAssetPaths, brandLogoPreviews } from "../lib/brand-assets";

const publicDir = join(__dirname, "..", "public");

const allPaths = [
	brandAssetPaths.assetsZip,
	brandAssetPaths.mark.light.svg,
	brandAssetPaths.mark.light.png,
	brandAssetPaths.mark.dark.svg,
	brandAssetPaths.mark.dark.png,
	brandAssetPaths.wordmark.light.svg,
	brandAssetPaths.wordmark.light.png,
	brandAssetPaths.wordmark.dark.svg,
	brandAssetPaths.wordmark.dark.png,
];

describe("Brand assets (`lib/brand-assets.ts`)", () => {
	it("points every asset at a file that exists in /public", () => {
		for (const p of allPaths) {
			expect(existsSync(join(publicDir, p)), p).toBe(true);
		}
	});

	it("uses the Qodewk naming prefix and no legacy names", () => {
		for (const p of allPaths) {
			expect(p).toContain("qodewk-");
			expect(p).not.toContain("better-auth");
		}
	});

	it("ships SVGs with the coral receipt tail and no embedded fonts", () => {
		for (const l of brandLogoPreviews) {
			const svg = readFileSync(join(publicDir, l.src), "utf8");
			expect(svg).toContain("#cc785c");
			expect(svg).not.toContain("<text");
		}
	});

	it("previews sit on warm brand surfaces, never pure black or white", () => {
		for (const l of brandLogoPreviews) {
			expect(l.bg).not.toBe("bg-black");
			expect(l.bg).not.toBe("bg-white");
		}
	});
});
