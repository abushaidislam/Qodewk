import Link from "next/link";
import Footer from "@/components/landing/footer";
import { HalftoneBackground } from "@/components/landing/halftone-bg";
import { SignatureMark } from "@/components/landing/signature-mark";
import { createMetadata } from "@/lib/metadata";
import { ChangelogContent } from "./changelog-content";

export const dynamic = "force-static";

interface GitHubRelease {
	id: number;
	tag_name: string;
	name: string;
	body: string;
	html_url: string;
	prerelease: boolean;
	published_at: string;
}

const GITHUB_USERNAME_REGEX =
	/(?:^|[^\w.+-])@([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)(?![A-Za-z0-9-]|[./][A-Za-z])/g;

function getMentionUsernames(line: string) {
	return Array.from(
		new Set(
			Array.from(line.matchAll(GITHUB_USERNAME_REGEX), (match) => match[1]),
		),
	);
}

function getContributorAvatarLinks(usernames: string[]) {
	return usernames
		.map((username) => {
			const avatarUrl = `https://github.com/${username}.png?size=48`;
			return `[![${username}](${avatarUrl})](https://github.com/${username})`;
		})
		.join("");
}

function getContent(content: string) {
	const lines = content.split("\n");
	let inContributorsSection = false;
	const newContext = lines.map((line) => {
		if (line.trim().startsWith("## ") || line.trim().startsWith("### ")) {
			const heading = line.split("date=")[0].trim();
			if (heading.startsWith("## ")) {
				inContributorsSection = heading.toLowerCase().includes("contributors");
			}
			return heading;
		}
		if (inContributorsSection) {
			const usernames = getMentionUsernames(line);
			if (usernames.length > 0) {
				return getContributorAvatarLinks(usernames);
			}
		}
		if (line.trim().startsWith("- ")) {
			const [mainContent, , context] = line.split(";");
			const cleanedContent = (mainContent || line).replace(/&nbsp/g, "");
			const usernames = context ? getMentionUsernames(context) : [];
			if (usernames.length === 0) {
				return cleanedContent;
			}
			return `${cleanedContent} – ${getContributorAvatarLinks(usernames)}`;
		}
		return line;
	});
	return newContext.join("\n");
}

const FALLBACK_RELEASES: GitHubRelease[] = [
	{
		id: 91,
		tag_name: "v0.9.1",
		name: "v0.9.1 — Remote Pricing Registry & Dynamic Env Resolution",
		published_at: "2026-10-03T18:00:00Z",
		prerelease: false,
		html_url: "https://github.com/abushaidislam/Qodewk/releases/tag/v0.9.1",
		body: `### 🚀 Added
- **Remote Rate-Card Registry Sync:** \`syncDynamicPricing\` fetches versioned multi-model rate cards dynamically from \`registry/pricing.json\` hosted on CDN/GitHub.
- **Dynamic Pricing Validation:** \`sanitizeRateCards\` and \`resetPricingRegistry\` in \`@qodewk/pricing\` validate pricing bounds (finite, non-negative, sanity limits) before applying updates.
- **Extended Model Aliases:** Added alias mappings for Gemini 3.x IDs (\`gemini-3.0-pro\`, \`gemini-3.0-flash\`) and family fallbacks for Anthropic Sonnet and Haiku model generation strings.
- **Zero-Dependency Env Loader & Dynamic Domain Resolver:**
  - Added \`loadQodewkEnv\`, \`resolveAppUrl\`, and \`resolveApiUrl\` in \`@qodewk/core\`.
  - CLI and sharing commands now automatically discover \`.env\`, \`.env.local\`, and \`~/.qodewk/config.env\` without requiring manual system environment variables.
  - Web API dynamically resolves host/origin from incoming HTTP request headers (\`x-forwarded-host\`, \`host\`) and \`VERCEL_URL\` when \`NEXT_PUBLIC_APP_URL\` is omitted.
  - Replaced all hardcoded fallback URLs across CLI, formatting, and web routes.

### 🛡️ Fixed & Changed
- **Cursor Line-Count Confidence Refinement:** Cursor commit-tracking footprints derive tokens from line counts; labeled as \`estimated\` (confidence 0.55) instead of \`verified\`.
- **Antigravity Model Detection Normalization:** Antigravity model detection now normalizes the selected model name and relies on pricing aliases/fallbacks, preventing newer models from resolving to incorrect rate cards.
- **Pricing Sync Tests:** Fixed \`pricing-sync\` tests to use the real \`ModelRateCard\` schema type definition.`,
	},
	{
		id: 90,
		tag_name: "v0.9.0",
		name: "v0.9.0 — Dynamic Pricing & Strict Session Attribution",
		published_at: "2026-10-02T20:00:00Z",
		prerelease: false,
		html_url: "https://github.com/abushaidislam/Qodewk/releases/tag/v0.9.0",
		body: `### 🚀 Added
- **Dynamic Pricing Registry (Offline-first Edge-compatible):**
  - Implemented advanced 24-hour TTL file-system caching mechanism in \`@qodewk/core\` (\`syncDynamicPricing\`).
  - Silent airplane-mode network fallback ensures CLI sub-100ms execution times when offline.
  - Allows fetching live remote rate cards from cloud without triggering NPM package updates.
- **Strict Session Attribution & Penalty Filters:**
  - Added strict attribution filters (\`score >= 0.10\`) in \`harvester/index.ts\` to exclude stale or unrelated historical AI sessions.
  - Solved cross-session cost inflation where old background editor sessions leaked into current commit bounds.

### 🛡️ Fixed & Changed
- **Antigravity Regex Parser Fix:** Fixed severe Antigravity harvester Regex bug causing massive tool parameter strings to be misparsed as model names, defaulting to expensive rate cards.
- **Telemetry Precision Transparency:** Fixed Antigravity telemetry outputting false precision (\`mode: verified\`, \`confidence: 95%\`) by properly labeling heuristic data as \`estimated\` at \`65%\` confidence.
- **CLI Terminal UI Clarity:** Renamed the misleading \`AI Written Code\` CLI label to \`AI Touched Files\` for clear separation between terminal-generated codebase changes and explicit AI tool edits.`,
	},
	{
		id: 80,
		tag_name: "v0.8.0",
		name: "v0.8.0 — Clack/Skills Terminal Menu & Git Notes Management",
		published_at: "2026-10-02T16:00:00Z",
		prerelease: false,
		html_url: "https://github.com/abushaidislam/Qodewk/releases/tag/v0.8.0",
		body: `### 🚀 Added
- **Modern Clack / Skills CLI Terminal Menu Architecture:**
  - Completely redesigned interactive TUI menu replacing dated MS-DOS ASCII cages with a high-end developer experience modeled after \`@clack/prompts\` and Skills CLI.
  - Multi-tier left-rail vertical guide (\`┌\`, \`│\`, \`└\`), hollow teal status diamonds (\`◇\`), and active warm coral diamonds (\`◆\`).
  - Layered ANSI shadow banner (\`QODEWK\`) with top-to-bottom tonal gradient.
  - High-contrast tinted pill badge (\`┌ [ qodewk ] v0.8.0\`) with live git repository and branch context detection.
  - Dedicated jitter-free description panel below a subtle hairline divider.
- **Default Bare Command Interactive Launch:**
  - Running bare \`qodewk\` or \`npx qodewk\` in an interactive terminal (TTY) now launches the Telemetry Control Panel by default without requiring \`qodewk menu\` or \`-i\`.
  - Headless execution automatically preserved when options/flags (e.g. \`--json\`, \`-f markdown\`, \`--today\`, \`--since\`, CI environment) are present.
- **Full Git Notes Management in TUI Menu:**
  - Added option \`[6] Git Notes Management\` (\`refs/notes/qodewk\`) allowing interactive listing of commits with receipts, inspecting receipt notes, and attaching receipt notes directly to git commits.
- **Test Concurrency & Windows Worker Optimization:**
  - Expanded unit and integration test suite across the monorepo to 104 passing tests (100% pass rate).
  - Configured robust Vitest timeouts and parallel isolation flags for high-concurrency Windows and Linux CI environments.`,
	},
	{
		id: 70,
		tag_name: "v0.7.0",
		name: "v0.7.0 — GitHub Marketplace Action & Seeded Demo Receipts",
		published_at: "2026-10-02T12:00:00Z",
		prerelease: false,
		html_url: "https://github.com/abushaidislam/Qodewk/releases/tag/v0.7.0",
		body: `### 🚀 Added
- **GitHub Marketplace Composite Action:**
  - Official GitHub Action workflow with \`action.yml\` metadata (\`branding\` icon \`file-text\`, color \`orange\`) and comprehensive \`packages/action/README.md\`.
  - Generates sticky PR comments with digital thermal receipts and SVG badge embeds upon pull request submission.
- **Proof-of-Shipment Seeded Receipts:**
  - Created realistic interactive demo receipts in \`apps/web/lib/demo-receipts.ts\` covering Cursor, Claude Code, Google Antigravity, and Aider.
- **Interactive Multi-Agent Homepage Showcase:**
  - Linked agent chips on \`apps/web/app/page.tsx\` directly to live interactive receipt card demos.
- **Canonical API Endpoints & Upgrade Guide:**
  - Standardized API endpoints to default to \`https://qodewk.flinkeo.online\` with \`QODEWK_API_URL\` overrides.
  - Published \`docs/upgrade-guide.md\` with provenance mode breakdowns, CLI command references, and architectural changes.`,
	},
	{
		id: 60,
		tag_name: "v0.6.0",
		name: "v0.6.0 — Production Reliability & Storage Guard",
		published_at: "2026-10-02T08:00:00Z",
		prerelease: false,
		html_url: "https://github.com/abushaidislam/Qodewk/releases/tag/v0.6.0",
		body: `### 🚀 Added
- **Serverless Persistence Guard:**
  - Strict validation for durable PostgreSQL/Supabase storage in production (\`NODE_ENV === "production"\`), returning HTTP 503 if unconfigured to prevent cold-start receipt loss.
- **Sliding-Window Rate Limiter:**
  - Edge-compatible token bucket abuse controls on \`/api/receipts\` returning HTTP 429 and \`Retry-After\` headers.
- **Git Notes Engine:**
  - Offline ledger storage under \`refs/notes/qodewk\` via \`writeGitReceiptNote\`, \`readGitReceiptNote\`, and CLI commands (\`qodewk notes show\`, \`qodewk notes write\`, \`qodewk notes list\`).
- **Privacy Regression Suite:**
  - Automated zero-exfiltration tests in \`packages/core/test/privacy.test.ts\` verifying source code, diff hunks, file paths, and secret keys never leak into \`ReceiptV1\` JSON payloads.
- **Automated Monorepo CI/CD Pipeline:**
  - Monorepo workflow in \`.github/workflows/ci.yml\` verifying typecheck, unit tests, and CLI smoke tests on all PRs.
  - Release workflow \`.github/workflows/release.yml\` with npm OIDC provenance signatures.`,
	},
	{
		id: 50,
		tag_name: "v0.5.0",
		name: "v0.5.0 — Universal Tier A Harvesters",
		published_at: "2026-10-02T04:00:00Z",
		prerelease: false,
		html_url: "https://github.com/abushaidislam/Qodewk/releases/tag/v0.5.0",
		body: `### 🚀 Added
- **Universal Tier A Harvesters:**
  - **Aider Harvester:** Markdown history parser (\`.aider.chat.history.md\`) extracting auto-committed Git hashes, models, tokens, and file edits.
  - **Windsurf (Cascade) Harvester:** Local SQLite workspace reader (\`state.vscdb\`) parsing Cascade chat sessions, model parameters, and message turns.
  - **Git Commit Trailers Parser:** Structured extractor for \`Co-authored-by: GitHub Copilot <...>\`, Claude Code, Cursor, Aider, and Windsurf trailers.
- **Canonical Model Rate Cards:**
  - Added alias mappings in \`@qodewk/pricing\` for Anthropic (Claude 3.7/3.5 variants, Claude Code), OpenAI (o1/o3/4o-latest), Google (Gemini 2/3), and DeepSeek (V3/R1).
  - Supported token metrics: prompt input, completion output, cache read, and cache creation.
- **Expanded Platform Support:**
  - Typed footprint support for \`aider\`, \`copilot\`, \`windsurf\`, \`opencode\`, \`kilo\`, \`codex\`, and \`cline\`.`,
	},
	{
		id: 40,
		tag_name: "v0.4.0",
		name: "v0.4.0 — Commit-Bound Scored Attribution",
		published_at: "2026-10-02T02:00:00Z",
		prerelease: false,
		html_url: "https://github.com/abushaidislam/Qodewk/releases/tag/v0.4.0",
		body: `### 🚀 Added
- **Commit-Bound Scored Attribution Engine:**
  - Replaced timestamp-only heuristics with scored primary attribution (\`scoreFootprint\`, \`selectPrimaryFootprint\`).
  - Verifies exact commit binds (+1.00 score), path overlap ratios (0–0.40 score), and temporal window proximity.
- **Path Normalization & Security:**
  - Improved Cursor URI decoding and path normalizations for cross-platform compatibility across Windows (unc/backslashes) and POSIX file systems.
  - Enforced a hard 50 KB body size cap across all receipt ingestion endpoints.
- **Monorepo Tooling Alignment:**
  - Aligned monorepo workspace dependencies to Node.js 22+ and pnpm 10.5.2 with Turbo 2.x orchestration.`,
	},
	{
		id: 30,
		tag_name: "v0.3.0",
		name: "v0.3.0 — Pricing Registry & HMAC Anonymization",
		published_at: "2026-10-01T12:00:00Z",
		prerelease: false,
		html_url: "https://github.com/abushaidislam/Qodewk/releases/tag/v0.3.0",
		body: `### 🚀 Added
- **Versioned Rate Card Registry:**
  - Dedicated \`@qodewk/pricing\` package managing real-time model pricing cards across major LLM providers.
- **Cryptographic Anonymization:**
  - Salted HMAC-SHA256 non-reversible project alias and repository hashing to protect private codebase identity.
- **Comprehensive Unit Test Suite:**
  - Vitest test suite across \`@qodewk/protocol\`, \`@qodewk/core\`, and \`@qodewk/pricing\` validating schema serialization and token calculations.`,
	},
	{
		id: 20,
		tag_name: "v0.2.0",
		name: "v0.2.0 — TUI Menu & Non-blocking Git Hooks",
		published_at: "2026-09-30T12:00:00Z",
		prerelease: false,
		html_url: "https://github.com/abushaidislam/Qodewk/releases/tag/v0.2.0",
		body: `### 🚀 Added
- **Interactive TUI Menu Panel:**
  - Early terminal menu (\`qodewk menu\`, \`qodewk -i\`) providing guided command execution and terminal inspection.
- **Fast Non-Blocking Git Hooks Installer:**
  - Automated Git hook installer (\`qodewk hook install\`, \`qodewk hook uninstall\`) spawning background detached workers executing in under 5ms without slowing git commit workflows.`,
	},
	{
		id: 10,
		tag_name: "v0.1.0",
		name: "v0.1.0 — Initial Open Source Release",
		published_at: "2026-09-27T00:00:00Z",
		prerelease: false,
		html_url: "https://github.com/abushaidislam/Qodewk/releases/tag/v0.1.0",
		body: `### 🚀 Added
- **Initial Open Source Release:**
  - Universal Git telemetry engine and digital receipt generator for AI-assisted software development.
- **Next.js Web Application:**
  - Monospace thermal receipt card visualizer with serrated top/bottom SVG cut edges, dark/light theme toggle, and dynamic Opengraph image generation (\`/api/og\`).
- **Terminal CLI Engine:**
  - Bare \`qodewk\` command execution, \`--json\` schema export, \`--today\` / \`--since\` filter options, and \`qodewk share\` URL generation workflow.`,
	},
];

export default async function ChangelogPage() {
	let releases: GitHubRelease[] = [];
	try {
		const res = await fetch(
			"https://api.github.com/repos/abushaidislam/Qodewk/releases",
			{
				next: { revalidate: 3600 },
				headers: {
					Accept: "application/vnd.github.v3+json",
					...(process.env.GITHUB_TOKEN && {
						Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
					}),
				},
			},
		);
		if (res.ok) {
			releases = await res.json();
		}
	} catch {
		// Fallback to static releases on error or rate-limit
	}

	if (releases && releases.length > 0) {
		releases = releases.map((rel) => {
			const fallback = FALLBACK_RELEASES.find((f) => f.tag_name === rel.tag_name);
			if (fallback && (!rel.body || rel.body.length < fallback.body.length)) {
				return { ...rel, body: fallback.body, name: fallback.name };
			}
			return rel;
		});
	} else {
		releases = FALLBACK_RELEASES;
	}

	const EXPANDABLE_LINE_THRESHOLD = 15;

	const messages = releases
		?.filter((release) => !release.prerelease)
		.map((release) => {
			const content = getContent(release.body);
			const lineCount = content
				.split("\n")
				.filter((l) => l.trim().length > 0).length;
			return {
				tag: release.tag_name,
				title: release.name,
				content,
				date: new Date(release.published_at).toLocaleDateString("en-US", {
					year: "numeric",
					month: "short",
					day: "numeric",
				}),
				url: release.html_url,
				expandable: lineCount > EXPANDABLE_LINE_THRESHOLD,
			};
		});

	return (
		<div className="flex flex-col lg:flex-row min-h-dvh pt-14 lg:pt-0">
			{/* Left panel — sticky */}
			<div className="hidden lg:block relative w-full lg:w-[30%] lg:h-dvh shrink-0 border-b lg:border-b-0 lg:border-r border-foreground/[0.06] overflow-clip px-5 sm:px-6 lg:px-10 lg:sticky lg:top-0">
				<HalftoneBackground />
				<div className="absolute left-10 right-6 bottom-4 z-[3]">
					<SignatureMark compact />
				</div>
				<div className="relative w-full pt-6 md:pt-10 pb-6 lg:pb-0 flex flex-col justify-center lg:h-full">
					<div className="space-y-1">
						<div className="flex items-center gap-1.5">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="0.9em"
								height="0.9em"
								viewBox="0 0 24 24"
								className="text-foreground/60"
								aria-hidden="true"
							>
								<path
									fill="currentColor"
									d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89l.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7s-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54l.72-1.21l-3.5-2.08V8H12z"
								/>
							</svg>
							<span className="text-sm text-foreground/60">Changelog</span>
						</div>
						<h1 className="text-2xl md:text-3xl xl:text-4xl text-neutral-800 dark:text-neutral-200 tracking-tight leading-tight">
							All changes, fixes, and updates
						</h1>
						<p className="text-sm text-foreground/70 dark:text-foreground/50 leading-relaxed max-w-[240px]">
							Every release shipped to Qodewk, straight from GitHub.
						</p>
					</div>

					<div className="border-t border-foreground/10 pt-4 mt-5 space-y-0">
						<div className="flex items-baseline justify-between py-1.5 border-b border-dashed border-foreground/[0.06]">
							<span className="text-xs text-foreground/70 dark:text-foreground/50 uppercase tracking-wider">
								Latest
							</span>
							<span className="text-xs text-foreground/85 dark:text-foreground/75 font-mono">
								{messages?.[0]?.tag ?? "\u2014"}
							</span>
						</div>
					</div>

					<div className="flex items-center gap-3 pt-4">
						<Link
							href="https://github.com/abushaidislam/Qodewk/releases"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 text-[12px] text-foreground/70 dark:text-foreground/50 hover:text-foreground/80 font-mono uppercase tracking-wider transition-colors"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								className="h-3 w-3 opacity-50"
							>
								<path
									fill="currentColor"
									d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
								/>
							</svg>
							GitHub Releases
						</Link>
					</div>
				</div>
			</div>

			{/* Right panel — releases */}
			<div className="w-full lg:w-[70%] flex flex-col">
				{/* Mobile header */}
				<div className="lg:hidden relative border-b border-foreground/[0.06] overflow-hidden px-5 sm:px-6">
					<HalftoneBackground />
					<div className="relative space-y-2 py-16">
						<div className="flex items-center gap-1.5">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="0.9em"
								height="0.9em"
								viewBox="0 0 24 24"
								className="text-foreground/60"
								aria-hidden="true"
							>
								<path
									fill="currentColor"
									d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89l.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7s-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54l.72-1.21l-3.5-2.08V8H12z"
								/>
							</svg>
							<span className="text-sm text-foreground/60">Changelog</span>
						</div>
						<h1 className="text-2xl md:text-3xl xl:text-4xl text-neutral-800 dark:text-neutral-200 tracking-tight leading-tight">
							All changes, fixes, and updates
						</h1>
						<p className="text-sm text-foreground/70 dark:text-foreground/50 leading-relaxed">
							Every release shipped to Qodewk, straight from GitHub.
						</p>
					</div>
				</div>

				<div className="px-5 pt-5 lg:p-8 lg:pt-20">
					<h2 className="flex items-center gap-3 text-sm sm:text-[15px] font-mono text-neutral-900 dark:text-neutral-100">
						CHANGELOG
						<span className="flex-1 h-px bg-foreground/15" />
					</h2>
				</div>

				<ChangelogContent messages={messages ?? []} />

				<div className="lg:hidden">
					<Footer />
				</div>
			</div>
		</div>
	);
}

export const metadata = createMetadata({
	title: "Changelog",
	description: "Latest changes, fixes, and updates to Qodewk",
});
