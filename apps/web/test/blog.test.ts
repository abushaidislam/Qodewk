import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import matter from "gray-matter";

const blogsDir = join(__dirname, "..", "content", "blogs");

describe("Qodewk Blog Posts (`content/blogs`)", () => {
	it("contains exactly 13 blog posts matching user specification", () => {
		expect(existsSync(blogsDir)).toBe(true);
		const files = readdirSync(blogsDir).filter((f) => f.endsWith(".mdx"));
		expect(files.length).toBe(13);
	});

	it("validates that all 13 posts have required frontmatter fields", () => {
		const files = readdirSync(blogsDir).filter((f) => f.endsWith(".mdx"));
		for (const file of files) {
			const fullPath = join(blogsDir, file);
			const content = readFileSync(fullPath, "utf8");
			const { data } = matter(content);

			expect(data.title, `Missing title in ${file}`).toBeDefined();
			expect(typeof data.title).toBe("string");
			expect(data.title.length).toBeGreaterThan(5);

			expect(data.description, `Missing description in ${file}`).toBeDefined();
			expect(typeof data.description).toBe("string");
			expect(data.description.length).toBeGreaterThan(10);

			expect(data.date, `Missing date in ${file}`).toBeDefined();
			expect(data.author, `Missing author in ${file}`).toBeDefined();
			expect(data.author.name).toBe("Abushaid Islam");
			expect(data.author.twitter).toBe("qodewk");

			expect(Array.isArray(data.tags), `Missing tags in ${file}`).toBe(true);
			expect(data.tags.length).toBeGreaterThan(0);
		}
	});

	it("ensures zero legacy 'better-auth' references exist in blog articles", () => {
		const files = readdirSync(blogsDir).filter((f) => f.endsWith(".mdx"));
		for (const file of files) {
			const fullPath = join(blogsDir, file);
			const rawContent = readFileSync(fullPath, "utf8").toLowerCase();
			expect(rawContent).not.toContain("better-auth");
			expect(rawContent).not.toContain("better auth");
		}
	});

	it("verifies expected core telemetry topics are covered across the 13 articles", () => {
		const files = readdirSync(blogsDir).filter((f) => f.endsWith(".mdx"));
		const allContent = files
			.map((file) => readFileSync(join(blogsDir, file), "utf8"))
			.join("\n");

		expect(allContent).toContain("thermal receipt");
		expect(allContent).toContain("simple-git");
		expect(allContent).toContain("HMAC-SHA256");
		expect(allContent).toContain("post-commit");
		expect(allContent).toContain("Claude Code");
		expect(allContent).toContain("Cursor");
		expect(allContent).toContain("AI-Written Ratio");
		expect(allContent).toContain("Rate Card");
	});
});
