# Changelog

All notable changes to the **Qodewk** monorepo are documented in this file.  
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.2] — 2026-10-08

### 🚀 Added
- **`qodewk doctor` System Health & Diagnostic Suite (`packages/core/src/doctor.ts`, `packages/cli/src/doctor-view.ts`):**
  - Added comprehensive terminal diagnostic auditor checking 7 AI agent storage environments (Antigravity, Claude Code, Cursor, Windsurf, Cline/Roo, Aider, OpenCode), Git repository readiness, non-blocking hook boundaries, SQLite storage health (`~/.qodewk/state.db`), and pricing registry sync.
  - Supports formatted editorial terminal view adhering strictly to Claude Warm Editorial design tokens (`#cc785c`, `#5db8a6`, `#8e8b82`) and machine-readable `--json` output (`overallStatus`, `version`, `agents`, `hooks`, `storage`, `pricing`, `benchmark`).
- **High-Resolution Non-Blocking Git Hook Latency Benchmark (`qodewk hook test` / `verify`):**
  - Added microsecond-accurate detached subprocess latency benchmarking using `process.hrtime.bigint()` to guarantee the core architectural invariant: Git hooks must be non-blocking (< 5ms overhead on developer commits).
  - Validates hook boundary markers (`# --- BEGIN QODEWK HOOK ---` ... `# --- END QODEWK HOOK ---`), coexistence with Lefthook/Husky, and script executable permissions (`0o755`).
  - Integrated into interactive terminal menu under `Manage Git Hooks` -> `[3] Test & benchmark hook latency`.
- **Engineering Blog: Inside `qodewk doctor` & Sub-5ms Git Hook Invariants (`apps/web/content/blogs/qodewk-doctor-and-hook-diagnostics.mdx`):**
  - Published deep-dive engineering devlog explaining agent session discovery across Windows/macOS/Linux, detached background hook execution architecture, and hardware timer benchmarking.
- **Universal Tier B Agent Harvesters (Cline / Roo Code & OpenCode CLI):**
  - Added native `harvestClineFootprints` (`packages/core/src/harvester/cline.ts`) extracting session telemetry, tasks, tool calls, edited files, and verified token usage from VS Code `globalStorage` and repository-local `.cline/tasks` / `.roo/tasks`.
  - Added native `harvestOpenCodeFootprints` (`packages/core/src/harvester/opencode.ts`) extracting pairing sessions from repo-local `.opencode/` and `~/.opencode/sessions`.
  - Expanded `parseGitTrailers` and `detectProviderFromCommit` in `@qodewk/core` to recognize `Cline`, `Roo Code`, `OpenCode`, and `Codex`.
  - Added model pricing aliases in `@qodewk/pricing` for provider-prefixed IDs (`anthropic/*`, `openai/*`, `openrouter/*`).
  - Registered full unit, edge-case, and disambiguation test suite in `packages/core/test/tier-b-harvesters.test.ts` (10/10 tests pass).
- **Native MDX Mermaid Architecture Diagramming (`apps/web/app/blog/[[...slug]]/page.tsx`):**
  - Registered client-side `<Mermaid chart="..." />` in MDX component map to support dynamic technical architecture, state machines, and sequence diagrams directly within engineering blog posts.
- **Engineering Devlog: Hardening Cross-Platform Turborepo Pipelines (`apps/web/content/blogs`):**
  - Authored and published devlog detailing cross-platform Node ESM clean scripts, monorepo dependency isolation boundaries, and native Mermaid diagramming.
- **13 In-Depth Qodewk Engineering Blogs (`apps/web/content/blogs`):**
  - Replaced legacy placeholders with authentic technical articles detailing the Git DAG telemetry architecture, zero-leak privacy mechanics, multi-model rate-card pricing, sub-5ms non-blocking git hooks, edge receipt cards, and the Qodewk v1.0 protocol specification.
- **1:1 Dot-Track Table of Contents (TOC) (`apps/web/components/blog/blog-toc.tsx`):**
  - Collapsed state displays a minimal, compact vertical dot-track on the right edge.
  - Hover state seamlessly expands into right-aligned section links ending in horizontal dashes (`—`) with an "≡ On this page" header matching Better Auth 1:1.
  - Real-time scroll observation with active section highlighting and smooth scrolling.

## [0.9.1] — 2026-10-03

### 🚀 Added
- **Dedicated Model Rate Cards Page (`/rate-cards`):**
  - Standalone developer tool showcasing multi-model rate cards from `@qodewk/pricing` for Claude, OpenAI, Gemini, and DeepSeek.
  - Interactive Commit Diff Token Cost Simulator with live calculation for input, output, and prompt cached tokens.
  - Programmatic TypeScript SDK integration examples and provider filter tabs.
  - Added "Rate Cards" item with CPU icon into the top navigation Resources menu.
- **Revamped Pricing Page (`/pricing`):**
  - Rebranded pricing tiers for Qodewk: Open Source ($0 / free forever), Team Sync ($20 / month), and Enterprise (Custom / air-gapped VPC).
  - Added comprehensive capability matrix comparing telemetry engine, team governance, security, and support.
  - Integrated dedicated Pricing FAQ accordion clarifying free open-source status, external LLM billing separation, and zero code exfiltration guarantees.
- `registry/pricing.json`: the remote rate-card registry that `syncDynamicPricing` fetches (generated from the built-in `RATE_CARDS` / `MODEL_ALIASES`).
- `sanitizeRateCards` and `resetPricingRegistry` in `@qodewk/pricing`; remote registry entries are validated (finite, non-negative, bounded prices) before use.
- Aliases for Gemini 3.x ids and family fallbacks for any Sonnet generation and Haiku.
- **Zero-Dependency Env Loader & Dynamic Domain Resolver:**
  - Added `loadQodewkEnv`, `resolveAppUrl`, and `resolveApiUrl` in `@qodewk/core`.
  - CLI and sharing commands now automatically discover `.env`, `.env.local`, and `~/.qodewk/config.env` without requiring manual system environment variables.
  - Web API dynamically resolves host/origin from incoming HTTP request headers (`x-forwarded-host`, `host`) and `VERCEL_URL` when `NEXT_PUBLIC_APP_URL` is omitted.
  - Replaced all hardcoded fallback URLs across CLI, formatting, and web routes.

### 🛡️ Fixed & Changed
- Cursor commit-tracking footprints derive tokens from line counts, so they are now labeled `estimated` (confidence 0.55) instead of `verified`.
- Antigravity model detection now normalizes the selected model name and relies on pricing aliases/fallbacks, so newer models no longer resolve to the wrong rate card.
- Fixed `pricing-sync` tests to use the real `ModelRateCard` shape.
- **Dynamic Receipt OG Image & Social Preview Fix (`/api/og/[id]` & `/r/[id]`):**
  - Resolved dynamic OG image generation for seeded demo receipts (`rec_demo_cursor`, `demo-claude`, `demo-antigravity`) alongside stored receipts.
  - Replaced unsupported Satori layout styles with Claude editorial tokens and added robust local font loading with Node.js filesystem fallback.
  - Connected `metadataBase` across receipt pages so Twitter, LinkedIn, and OpenGraph crawlers resolve absolute image URLs.
  - Streamlined `/r/[id]` receipt page UX to focus on a single thermal receipt presentation with an interactive demo switcher and registered full Vitest regression tests.
- **Monorepo Pipeline Integrity & CLI Dependency Isolation:**
  - Added explicit `simple-git` dependency to `packages/cli/package.json` to eliminate undeclared phantom dependency imports in `menu.ts` and resolve `turbo typecheck` errors.
  - Exported testable `run()` function in `packages/action/src/index.ts` with test-runner environment guards and authored comprehensive unit tests in `packages/action/test/action.test.ts` covering outputs, error handling, and PR comment synchronization.
  - Standardized package-level Vitest configs with 30s timeouts across `packages/core`, `packages/cli`, and `apps/web` to ensure `turbo test` passes reliably across all monorepo workspaces.
- **Workspace Scope Standardization & Dependency Hoisting (Phase 2):**
  - Standardized web application package name from `web` to `@qodewk/web` across `apps/web/package.json`, `Dockerfile`, `vercel.json`, and deployment documentation.
  - Explicitly declared `vitest` in `devDependencies` across all workspace packages (`@qodewk/protocol`, `@qodewk/pricing`, `@qodewk/core`, `qodewk`, `@qodewk/action`, `@qodewk/web`) to eliminate phantom dependency hoisting.
- **Shared Workspace Configurations & Tooling Modernization (Phase 3):**
  - Created shared configuration package `@qodewk/tsconfig` (`packages/tsconfig/`) providing `base.json`, `node.json`, and `nextjs.json` presets to eliminate duplicate compiler configurations.
  - Refactored `tsconfig.json` across all applications (`apps/web`) and packages (`@qodewk/protocol`, `@qodewk/pricing`, `@qodewk/core`, `qodewk`, `@qodewk/action`) to extend `@qodewk/tsconfig`.
  - Established root ESLint flat configuration (`eslint.config.mjs`) and Prettier configs (`.prettierrc`, `.prettierignore`).
  - Repaired `turbo lint` by migrating `apps/web/package.json` from the deprecated Next.js 16 CLI command (`next lint`) to direct `eslint .`.
- **Turborepo Task Graph Hardening & CI/CD Pipeline Modernization (Phase 4):**
  - Modernized cross-platform `clean` scripts (`node --input-type=module -e fs.rmSync`) across all applications and packages (`apps/web`, `@qodewk/protocol`, `@qodewk/pricing`, `@qodewk/core`, `qodewk`, `@qodewk/action`), eliminating ESM `require` scope resolution failures.
  - Added `refactor/**` branch pattern to `.github/workflows/ci.yml` push triggers to ensure automated verification of refactoring branches.
  - Hardened `turbo.json` pipeline configuration with deterministic input hashes (`tsconfig*.json`, `eslint.config.*`, `.prettier*`, `vitest.config.*`) and complete build outputs (`.source/**`, `.next/**`, `dist/**`).
  - Stabilized Next.js 16 production build (`next build --webpack`) and MDX generation across all 80 static/dynamic application routes.
  - Hardened CI quality workflow (`.github/workflows/ci.yml`) by introducing `pnpm lint` as a mandatory pre-build verification gate alongside typechecking, testing, and CLI smoke tests.

## [0.9.0] — 2026-10-02

### 🚀 Added
- **Dynamic Pricing Registry (Offline-first Edge-compatible):**
  - Implemented advanced 24-hour TTL file-system caching mechanism in `@qodewk/core` (`syncDynamicPricing`).
  - Added silent airplane-mode network fallback to ensure CLI speeds remain < 100ms.
  - Allowed fetching live remote rate cards from cloud without triggering NPM updates.
- **Session Scoping & Penalty Filters:**
  - Added strict attribution filters (`score >= 0.10`) in `harvester/index.ts` to exclude stale or unrelated historical AI sessions (solving the cross-session cost inflation bug).

### 🛡️ Fixed & Changed
- Fixed severe Antigravity harvester Regex bug causing massive tool parameters to be parsed as model names, defaulting to expensive rate cards.
- Fixed Antigravity telemetry outputting false precision (`mode: verified`, `confidence: 95%`) by properly labeling heuristic data as `estimated` at `65%` confidence.
- Renamed the misleading `AI Written Code` CLI label to `AI Touched Files` for clear separation between terminal-generated codebase changes and explicit AI tool edits.

---

## [0.8.0] — 2026-10-02

### 🚀 Added
- **Modern Clack / Skills CLI Terminal Menu Architecture:**
  - Completely redesigned interactive TUI menu replacing dated MS-DOS ASCII cages with a high-end developer experience modeled after `@clack/prompts` and Skills CLI.
  - Multi-tier left-rail vertical guide (`┌`, `│`, `└`), hollow teal status diamonds (`◇`), and active warm coral diamonds (`◆`).
  - Layered ANSI shadow banner (`QODEWK`) with top-to-bottom tonal gradient.
  - High-contrast tinted pill badge (`┌  [ qodewk ] v0.8.0`) with live git repository and branch context detection.
  - Dedicated jitter-free description panel below a subtle hairline divider.
- **Default Bare Command Interactive Launch:**
  - Running bare `qodewk` or `npx qodewk` in an interactive terminal (TTY) now launches the Telemetry Control Panel by default without requiring `qodewk menu` or `-i`.
  - Headless execution automatically preserved when options/flags (e.g. `--json`, `-f markdown`, `--today`, `--since`, CI environment) are present.
- **Full Git Notes Management in TUI Menu:**
  - Added option `[6] Git Notes Management` (`refs/notes/qodewk`) allowing interactive listing of commits with receipts, inspecting receipt notes, and attaching receipt notes.
- **Test Concurrency & Windows Worker Optimization:**
  - Expanded unit and integration test suite across the monorepo to 104 passing tests (100% pass rate).
  - Configured robust Vitest timeouts for high-concurrency Windows test environments.

---

## [0.7.0] — 2026-10-02

### 🚀 Added
- **Distribution & PLG (Phase P3):**
  - **GitHub Marketplace Action Listing:** Added official `branding` (icon `file-text`, color `orange`) in `packages/action/action.yml` and authored comprehensive `packages/action/README.md`.
  - **Proof-of-Shipment Seeded Receipts:** Created realistic demo receipts in `apps/web/lib/demo-receipts.ts` for Cursor, Claude Code, Google Antigravity, and Aider.
  - **Interactive Multi-Agent Homepage Links:** Linked agent chips in `apps/web/app/page.tsx` directly to their respective live receipt demos.
  - **Canonical Domain & Environment Overrides:** Standardized API endpoints to default to `https://qodewk.flinkeo.online` with `QODEWK_API_URL` overrides.
  - **Upgrade & Migration Guide:** Published `docs/upgrade-guide.md` with provenance mode breakdowns, CLI command references, and architectural changes.

---

## [0.6.0] — 2026-10-02

### 🚀 Added
- **Production Reliability & Storage Guard (Phase P2):**
  - **Serverless Persistence Guard:** Strict enforcement of Supabase/PostgreSQL in production (`NODE_ENV === "production"`), returning HTTP 503 if unconfigured to prevent cold-start receipt loss.
  - **Sliding-Window Rate Limiter:** Edge-compatible token bucket abuse controls on `/api/receipts` returning HTTP 429 and `Retry-After`.
  - **Git Notes Engine:** Offline ledger storage under `refs/notes/qodewk` via `writeGitReceiptNote`, `readGitReceiptNote`, and CLI commands (`qodewk notes show`, `qodewk notes write`, `qodewk notes list`).
  - **Dedicated Privacy Regression Suite:** Strict zero-exfiltration automated tests verifying source code, diff hunks, and secrets never enter `ReceiptV1` payloads (`packages/core/test/privacy.test.ts`).
  - **Automated CI Quality Pipeline:** Monorepo workflow in `.github/workflows/ci.yml` verifying typecheck, 103+ unit tests, and CLI smoke tests on all PRs.
  - **Release Automation:** Configured `.github/workflows/release.yml` with OIDC npm provenance.

---

## [0.5.0] — 2026-10-02

### 🚀 Added
- **Universal Tier A Harvesters (Phase P1):**
  - **Aider:** Local markdown history parser (`.aider.chat.history.md`) extracting auto-committed Git hashes, models, tokens, and file edits.
  - **Windsurf (Cascade):** Local SQLite workspace reader (`state.vscdb`) parsing Cascade chat sessions and model parameters.
  - **Git Commit Trailers:** Structured parser for `Co-authored-by: GitHub Copilot <...>`, Claude, Cursor, Aider, and Windsurf trailers.
  - **Model Rate Card Aliases:** Canonical alias mapping in `@qodewk/pricing` for Anthropic (Claude 3.7/3.5 variants, Claude Code), OpenAI (o1/o3/4o-latest), Google (Gemini 2/3), and DeepSeek (V3/R1).
  - **Expanded Platform Footprints:** Added typed support for `aider`, `copilot`, `windsurf`, `opencode`, `kilo`, `codex`, and `cline`.

---

## [0.4.0] — 2026-10-02

### 🚀 Added
- **Commit-Bound Scored Attribution (Phase P0):** Replaced timestamp heuristics with scored primary attribution (`scoreFootprint`, `selectPrimaryFootprint`), verifying exact commit binds (+1.00), path overlap ratios (0–0.40), and temporal proximity.

### 🛡️ Fixed & Changed
- Fixed Cursor URI decoding and path normalizations for Windows and POSIX file comparisons.
- Enforced hard 50 KB body size cap across all receipt ingestion endpoints.
- Aligned monorepo workspace dependencies to Node.js 22+ and pnpm 10.5.2.

---

## [0.3.0] — 2026-10-01

### 🚀 Added
- Versioned rate card registry (`@qodewk/pricing`) covering Anthropic Claude, OpenAI, Google Gemini, and DeepSeek token rates (input, output, cache read, cache write).
- Vitest comprehensive unit test suite across `@qodewk/protocol`, `@qodewk/core`, and `@qodewk/pricing`.
- Salted HMAC-SHA256 non-reversible project alias and repository hashing.

---

## [0.2.0] — 2026-09-30

### 🚀 Added
- Interactive TUI menu panel (`qodewk menu`, `qodewk -i`) with clean box-drawing UI and full terminal controls.
- Fast non-blocking Git hooks installer (`qodewk hook install`, `qodewk hook uninstall`) spawning background detached workers (< 5ms execution).

---

## [0.1.0] — 2026-09-27

### 🚀 Added
- Initial open-source release of Qodewk monorepo.
- Next.js 15 App Router web application with thermal receipt card styling and SVG serrated cut edges.
- CLI receipt generator (`qodewk`, `npx qodewk`).
