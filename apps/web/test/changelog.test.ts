import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Changelog Content & Structure", () => {
	it("verifies CHANGELOG.md exists and contains all major versions", () => {
		const changelogPath = path.resolve(__dirname, "../../../CHANGELOG.md");
		expect(fs.existsSync(changelogPath)).toBe(true);

		const content = fs.readFileSync(changelogPath, "utf-8");
		const expectedVersions = [
			"0.9.1",
			"0.9.0",
			"0.8.0",
			"0.7.0",
			"0.6.0",
			"0.5.0",
			"0.4.0",
			"0.3.0",
			"0.2.0",
			"0.1.0",
		];

		for (const ver of expectedVersions) {
			expect(content).toContain(`[${ver}]`);
		}
	});

	it("verifies changelog page component file exists and contains fallback releases", () => {
		const pagePath = path.resolve(__dirname, "../app/changelog/page.tsx");
		expect(fs.existsSync(pagePath)).toBe(true);

		const content = fs.readFileSync(pagePath, "utf-8");
		expect(content).toContain("FALLBACK_RELEASES");
		expect(content).toContain("v0.9.1");
		expect(content).toContain("v0.1.0");
	});
});
