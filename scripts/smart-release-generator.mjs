import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// ── Package Mapping Configuration ──────────────────────────────────────────
const PACKAGE_MAPPINGS = [
	{
		id: "cli",
		name: "qodewk",
		pathPrefix: "packages/cli",
		changelogPath: "packages/cli/CHANGELOG.md",
	},
	{
		id: "core",
		name: "@qodewk/core",
		pathPrefix: "packages/core",
		changelogPath: "packages/core/CHANGELOG.md",
	},
	{
		id: "web",
		name: "@qodewk/web",
		pathPrefix: "apps/web",
		changelogPath: "apps/web/CHANGELOG.md",
	},
	{
		id: "pricing",
		name: "@qodewk/pricing",
		pathPrefix: "packages/pricing",
		changelogPath: "packages/pricing/CHANGELOG.md",
	},
	{
		id: "protocol",
		name: "@qodewk/protocol",
		pathPrefix: "packages/protocol",
		changelogPath: "packages/protocol/CHANGELOG.md",
	},
	{
		id: "action",
		name: "@qodewk/action",
		pathPrefix: "packages/action",
		changelogPath: "packages/action/CHANGELOG.md",
	},
];

function execGit(cmd) {
	try {
		return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }).trim();
	} catch {
		return "";
	}
}

export function getRepoInfo() {
	const remote = execGit("git remote get-url origin");
	let owner = "abushaidislam";
	let repo = "Qodewk";

	if (remote) {
		const match = remote.match(/[:/]([^/]+)\/([^/.]+)(?:\.git)?$/);
		if (match) {
			owner = match[1];
			repo = match[2].replace(/\.git$/, "");
		}
	}
	return { owner, repo, baseUrl: `https://github.com/${owner}/${repo}` };
}

export function findPreviousTag(currentVersion) {
	const cleanVersion = currentVersion.replace(/^v/, "");
	const allTagsRaw = execGit("git tag -l --sort=-v:refname");
	const tags = allTagsRaw ? allTagsRaw.split("\n").map((t) => t.trim()).filter(Boolean) : [];

	for (const tag of tags) {
		const cleanTag = tag.replace(/^v/, "");
		if (cleanTag !== cleanVersion) {
			return tag;
		}
	}
	return "";
}

function parseCommitType(subject) {
	const match = subject.match(/^([a-z]+)(?:\(([^)]+)\))?!?:\s*(.+)$/i);
	if (!match) return { type: "other", scope: "", message: subject };

	const rawType = match[1].toLowerCase();
	const scope = match[2] ? match[2].toLowerCase() : "";
	const message = match[3].trim();

	let category = "other";
	if (["feat", "feature", "add"].includes(rawType)) category = "features";
	else if (["fix", "bug", "patch"].includes(rawType)) category = "bugfixes";
	else if (["perf", "refactor"].includes(rawType)) category = "perf";
	else if (["docs", "doc"].includes(rawType)) category = "docs";

	return { type: rawType, category, scope, message };
}

function formatSentence(str) {
	if (!str) return str;
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function generateSmartReleaseNotes(currentVersion, previousTagInput) {
	const cleanVersion = currentVersion.replace(/^v/, "");
	const prevTag = previousTagInput || findPreviousTag(cleanVersion) || "HEAD~10";
	const repoInfo = getRepoInfo();

	// Check if CHANGELOG.md already has a well-formed Better Auth entry for this version
	const rootChangelogPath = path.resolve(process.cwd(), "CHANGELOG.md");
	if (fs.existsSync(rootChangelogPath)) {
		const changelog = fs.readFileSync(rootChangelogPath, "utf8");
		const versionRegex = new RegExp(`^##\\s+\\[?v?${cleanVersion.replace(/\\./g, "\\.")}\\]?[^\\n]*\\n([\\s\\S]*?)(?=\\n##\\s+\\[?v?\\d+\\.\\d+\\.\\d+|$)`, "mi");
		const match = changelog.match(versionRegex);

		if (match && match[1] && match[1].includes("## `")) {
			// Rich Better Auth style notes already exist in CHANGELOG.md!
			let notes = match[1].trim();
			const quickInstall = [
				"",
				"### 📦 Quick Install",
				"```bash",
				`npm install -g qodewk@${cleanVersion}`,
				"# or run instantly via npx:",
				"npx qodewk@latest",
				"```",
			].join("\n");
			return `${notes}\n\n${quickInstall}\n`;
		}
	}

	// Dynamic git harvesting
	const revRange = prevTag ? `${prevTag}..HEAD` : "HEAD~10..HEAD";
	const logOutput = execGit(`git log ${revRange} --pretty=format:"%H|%an|%ae|%s"`);
	if (!logOutput) {
		return `## Qodewk Release v${cleanVersion}\n\nNo git changes detected between ${prevTag} and HEAD.`;
	}

	const commitLines = logOutput.split("\n").filter(Boolean);
	const contributors = new Set();
	const packageChanges = {};

	for (const pkg of PACKAGE_MAPPINGS) {
		packageChanges[pkg.name] = { features: [], bugfixes: [], perf: [], docs: [] };
	}

	let latestPrNumber = "";

	for (const line of commitLines) {
		const [hash, author, email, rawSubject] = line.split("|");
		if (!hash || !rawSubject) continue;

		// Extract PR numbers from merge commits (e.g. Merge pull request #16 from ...)
		const prMergeMatch = rawSubject.match(/Merge pull request #(\d+)/i);
		if (prMergeMatch) {
			latestPrNumber = prMergeMatch[1];
			continue;
		}

		// Filter out noise commits
		if (/^chore\(release\):/i.test(rawSubject) || /^Merge branch/i.test(rawSubject)) {
			continue;
		}

		// Add contributor username if present, or author name
		if (author && !author.toLowerCase().includes("bot")) {
			contributors.add(author.replace(/\s+/g, "").toLowerCase());
		}

		// Detect changed files to determine affected packages
		const changedFilesRaw = execGit(`git diff-tree --no-commit-id --name-only -r ${hash}`);
		const changedFiles = changedFilesRaw ? changedFilesRaw.split("\n").filter(Boolean) : [];

		const affectedPackages = new Set();
		for (const file of changedFiles) {
			for (const pkg of PACKAGE_MAPPINGS) {
				if (file.startsWith(pkg.pathPrefix)) {
					affectedPackages.add(pkg.name);
				}
			}
		}

		const parsed = parseCommitType(rawSubject);

		// If no specific package path matched, use scope heuristic
		if (affectedPackages.size === 0) {
			if (parsed.scope.includes("cli")) affectedPackages.add("qodewk");
			else if (parsed.scope.includes("core")) affectedPackages.add("@qodewk/core");
			else if (parsed.scope.includes("web")) affectedPackages.add("@qodewk/web");
			else affectedPackages.add("qodewk"); // default to core CLI
		}

		// Extract inline PR or use latest PR
		let prLink = "";
		const inlinePrMatch = rawSubject.match(/\(#(\d+)\)/);
		const prNum = inlinePrMatch ? inlinePrMatch[1] : latestPrNumber;
		if (prNum) {
			prLink = ` ([#${prNum}](${repoInfo.baseUrl}/pull/${prNum}))`;
		}

		const cleanedMessage = formatSentence(parsed.message.replace(/\s*\(#\d+\)\s*$/, ""));
		const itemText = `${cleanedMessage}.${prLink}`;

		for (const pkgName of affectedPackages) {
			const targetPkg = packageChanges[pkgName] || (packageChanges[pkgName] = { features: [], bugfixes: [], perf: [], docs: [] });
			if (parsed.category === "bugfixes") {
				targetPkg.bugfixes.push(itemText);
			} else if (parsed.category === "perf") {
				targetPkg.perf.push(itemText);
			} else {
				targetPkg.features.push(itemText);
			}
		}
	}

	// Build Better Auth 1:1 structured markdown output
	const output = [];

	for (const pkg of PACKAGE_MAPPINGS) {
		const changes = packageChanges[pkg.name];
		const hasChanges = changes && (changes.features.length > 0 || changes.bugfixes.length > 0 || changes.perf.length > 0);
		if (!hasChanges) continue;

		output.push(`## \`${pkg.name}\`\n`);

		if (changes.features.length > 0) {
			output.push("### Features\n");
			for (const f of changes.features) {
				output.push(`- ${f}`);
			}
			output.push("");
		}

		if (changes.bugfixes.length > 0) {
			output.push("### Bug Fixes\n");
			for (const b of changes.bugfixes) {
				output.push(`- ${b}`);
			}
			output.push("");
		}

		if (changes.perf.length > 0) {
			output.push("### Performance & Refactoring\n");
			for (const p of changes.perf) {
				output.push(`- ${p}`);
			}
			output.push("");
		}

		output.push(`For detailed changes, see [\`CHANGELOG\`](${repoInfo.baseUrl}/blob/master/${pkg.changelogPath})\n`);
	}

	// Contributors section
	output.push("## Contributors\n");
	output.push("Thanks to everyone who contributed to this release:\n");
	if (contributors.size > 0) {
		const handles = Array.from(contributors).map((c) => (c.startsWith("@") ? c : `@${c}`));
		output.push(handles.join(", ") + "\n");
	} else {
		output.push("@abushaidislam\n");
	}

	if (prevTag) {
		output.push(`**Full changelog:** [\`${prevTag}...v${cleanVersion}\`](${repoInfo.baseUrl}/compare/${prevTag}...v${cleanVersion})\n`);
	}

	// Quick install instructions
	output.push("### 📦 Quick Install\n```bash");
	output.push(`npm install -g qodewk@${cleanVersion}`);
	output.push("# or run instantly via npx:");
	output.push("npx qodewk@latest\n```\n");

	return output.join("\n");
}

// CLI entry point
if (process.argv[1] && process.argv[1].endsWith("smart-release-generator.mjs")) {
	const version = process.argv[2] || process.env.CLI_VERSION || "0.10.0";
	const outputPath = process.argv[3] || "RELEASE_NOTES.md";
	const prevTag = process.argv[4] || "";

	const notes = generateSmartReleaseNotes(version, prevTag);
	fs.writeFileSync(outputPath, notes, "utf8");
	console.log(`[Smart Release] Generated Better Auth release notes for v${version} -> ${outputPath}`);
}
