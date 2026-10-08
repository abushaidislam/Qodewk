import fs from "node:fs";
import path from "node:path";

export function extractReleaseNotes(version, changelogPath = "CHANGELOG.md") {
	const cleanVersion = version.replace(/^v/, "").trim();
	const fullPath = path.resolve(process.cwd(), changelogPath);

	if (!fs.existsSync(fullPath)) {
		return `## Qodewk Release v${cleanVersion}\n\nNo CHANGELOG.md file found.`;
	}

	const content = fs.readFileSync(fullPath, "utf8");
	const lines = content.split("\n");

	let capturing = false;
	const capturedLines = [];

	// Target header regex: ## [0.10.0] or ## [v0.10.0] or ## 0.10.0
	const headerRegex = new RegExp(`^##\\s+\\[?v?${cleanVersion.replace(/\./g, "\\.")}\\]?`, "i");
	// Stop ONLY when hitting the next SemVer release heading (e.g. ## [0.9.2]), allowing package sub-headers (## `qodewk`, ## Contributors)
	const nextVersionRegex = /^##\s+\[?v?\d+\.\d+\.\d+\]?/i;

	for (const line of lines) {
		if (!capturing) {
			if (headerRegex.test(line.trim())) {
				capturing = true;
			}
		} else {
			// Stop if we hit the next version heading
			if (nextVersionRegex.test(line.trim()) && !headerRegex.test(line.trim())) {
				break;
			}
			capturedLines.push(line);
		}
	}

	let notes = capturedLines.join("\n").trim();

	if (!notes) {
		notes = `Release v${cleanVersion}`;
	}

	// Add quick installation & verification footer
	const footer = [
		"",
		"### 📦 Quick Install",
		"```bash",
		`npm install -g qodewk@${cleanVersion}`,
		"# or run instantly via npx:",
		"npx qodewk@latest",
		"```",
	].join("\n");

	return `${notes}\n\n${footer}\n`;
}

// CLI execution
if (process.argv[1] && process.argv[1].endsWith("extract-release-notes.mjs")) {
	const version = process.argv[2] || process.env.CLI_VERSION;
	if (!version) {
		console.error("Usage: node scripts/extract-release-notes.mjs <version>");
		process.exit(1);
	}

	const notes = extractReleaseNotes(version);
	const outputPath = process.argv[3] || "RELEASE_NOTES.md";
	fs.writeFileSync(outputPath, notes, "utf8");
	console.log(`Successfully extracted release notes for v${version} -> ${outputPath}`);
}
