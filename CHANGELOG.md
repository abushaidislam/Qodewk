# Changelog

All notable changes to the **Qodewk** monorepo are documented in this file.  
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.1] — 2026-10-03

### 🚀 Added
- **Remote Rate-Card Registry Sync:** `syncDynamicPricing` fetches versioned multi-model rate cards dynamically from `registry/pricing.json` hosted on CDN/GitHub.
- **Dynamic Pricing Validation:** `sanitizeRateCards` and `resetPricingRegistry` in `@qodewk/pricing` validate pricing bounds (finite, non-negative, sanity limits) before applying updates.
- **Extended Model Aliases:** Added alias mappings for Gemini 3.x IDs (`gemini-3.0-pro`, `gemini-3.0-flash`) and family fallbacks for Anthropic Sonnet and Haiku model generation strings.
- **Zero-Dependency Env Loader & Dynamic Domain Resolver:**
  - Added `loadQodewkEnv`, `resolveAppUrl`, and `resolveApiUrl` in `@qodewk/core`.
  - CLI and sharing commands now automatically discover `.env`, `.env.local`, and `~/.qodewk/config.env` without requiring manual system environment variables.
  - Web API dynamically resolves host/origin from incoming HTTP request headers (`x-forwarded-host`, `host`) and `VERCEL_URL` when `NEXT_PUBLIC_APP_URL` is omitted.
  - Replaced all hardcoded fallback URLs across CLI, formatting, and web routes.

### 🛡️ Fixed & Changed
- **Cursor Line-Count Confidence Refinement:** Cursor commit-tracking footprints derive tokens from line counts; labeled as `estimated` (confidence 0.55) instead of `verified`.
- **Antigravity Model Detection Normalization:** Antigravity model detection now normalizes the selected model name and relies on pricing aliases/fallbacks, preventing newer models from resolving to incorrect rate cards.
- **Pricing Sync Tests:** Fixed `pricing-sync` tests to use the real `ModelRateCard` schema type definition.

---

## [0.9.0] — 2026-10-02

### 🚀 Added
- **Dynamic Pricing Registry (Offline-first Edge-compatible):**
  - Implemented advanced 24-hour TTL file-system caching mechanism in `@qodewk/core` (`syncDynamicPricing`).
  - Silent airplane-mode network fallback ensures CLI sub-100ms execution times when offline.
  - Allows fetching live remote rate cards from cloud without triggering NPM package updates.
- **Strict Session Attribution & Penalty Filters:**
  - Added strict attribution filters (`score >= 0.10`) in `harvester/index.ts` to exclude stale or unrelated historical AI sessions.
  - Solved cross-session cost inflation where old background editor sessions leaked into current commit bounds.

### 🛡️ Fixed & Changed
- **Antigravity Regex Parser Fix:** Fixed severe Antigravity harvester Regex bug causing massive tool parameter strings to be misparsed as model names, defaulting to expensive rate cards.
- **Telemetry Precision Transparency:** Fixed Antigravity telemetry outputting false precision (`mode: verified`, `confidence: 95%`) by properly labeling heuristic data as `estimated` at `65%` confidence.
- **CLI Terminal UI Clarity:** Renamed the misleading `AI Written Code` CLI label to `AI Touched Files` for clear separation between terminal-generated codebase changes and explicit AI tool edits.

---

## [0.8.0] — 2026-10-02

### 🚀 Added
- **Modern Clack / Skills CLI Terminal Menu Architecture:**
  - Completely redesigned interactive TUI menu replacing dated MS-DOS ASCII cages with a high-end developer experience modeled after `@clack/prompts` and Skills CLI.
  - Multi-tier left-rail vertical guide (`┌`, `│`, `└`), hollow teal status diamonds (`◇`), and active warm coral diamonds (`◆`).
  - Layered ANSI shadow banner (`QODEWK`) with top-to-bottom tonal gradient.
  - High-contrast tinted pill badge (`┌ [ qodewk ] v0.8.0`) with live git repository and branch context detection.
  - Dedicated jitter-free description panel below a subtle hairline divider.
- **Default Bare Command Interactive Launch:**
  - Running bare `qodewk` or `npx qodewk` in an interactive terminal (TTY) now launches the Telemetry Control Panel by default without requiring `qodewk menu` or `-i`.
  - Headless execution automatically preserved when options/flags (e.g. `--json`, `-f markdown`, `--today`, `--since`, CI environment) are present.
- **Full Git Notes Management in TUI Menu:**
  - Added option `[6] Git Notes Management` (`refs/notes/qodewk`) allowing interactive listing of commits with receipts, inspecting receipt notes, and attaching receipt notes directly to git commits.
- **Test Concurrency & Windows Worker Optimization:**
  - Expanded unit and integration test suite across the monorepo to 104 passing tests (100% pass rate).
  - Configured robust Vitest timeouts and parallel isolation flags for high-concurrency Windows and Linux CI environments.

---

## [0.7.0] — 2026-10-02

### 🚀 Added
- **GitHub Marketplace Composite Action:**
  - Official GitHub Action workflow with `action.yml` metadata (`branding` icon `file-text`, color `orange`) and comprehensive `packages/action/README.md`.
  - Generates sticky PR comments with digital thermal receipts and SVG badge embeds upon pull request submission.
- **Proof-of-Shipment Seeded Receipts:**
  - Created realistic interactive demo receipts in `apps/web/lib/demo-receipts.ts` covering Cursor, Claude Code, Google Antigravity, and Aider.
- **Interactive Multi-Agent Homepage Showcase:**
  - Linked agent chips on `apps/web/app/page.tsx` directly to live interactive receipt card demos.
- **Canonical API Endpoints & Upgrade Guide:**
  - Standardized API endpoints to default to `https://qodewk.flinkeo.online` with `QODEWK_API_URL` overrides.
  - Published `docs/upgrade-guide.md` with provenance mode breakdowns, CLI command references, and architectural changes.

---

## [0.6.0] — 2026-10-02

### 🚀 Added
- **Serverless Persistence Guard:**
  - Strict validation for durable PostgreSQL/Supabase storage in production (`NODE_ENV === "production"`), returning HTTP 503 if unconfigured to prevent cold-start receipt loss.
- **Sliding-Window Rate Limiter:**
  - Edge-compatible token bucket abuse controls on `/api/receipts` returning HTTP 429 and `Retry-After` headers.
- **Git Notes Engine:**
  - Offline ledger storage under `refs/notes/qodewk` via `writeGitReceiptNote`, `readGitReceiptNote`, and CLI commands (`qodewk notes show`, `qodewk notes write`, `qodewk notes list`).
- **Privacy Regression Suite:**
  - Automated zero-exfiltration tests in `packages/core/test/privacy.test.ts` verifying source code, diff hunks, file paths, and secret keys never leak into `ReceiptV1` JSON payloads.
- **Automated Monorepo CI/CD Pipeline:**
  - Monorepo workflow in `.github/workflows/ci.yml` verifying typecheck, unit tests, and CLI smoke tests on all PRs.
  - Release workflow `.github/workflows/release.yml` with npm OIDC provenance signatures.

---

## [0.5.0] — 2026-10-02

### 🚀 Added
- **Universal Tier A Harvesters:**
  - **Aider Harvester:** Markdown history parser (`.aider.chat.history.md`) extracting auto-committed Git hashes, models, tokens, and file edits.
  - **Windsurf (Cascade) Harvester:** Local SQLite workspace reader (`state.vscdb`) parsing Cascade chat sessions, model parameters, and message turns.
  - **Git Commit Trailers Parser:** Structured extractor for `Co-authored-by: GitHub Copilot <...>`, Claude Code, Cursor, Aider, and Windsurf trailers.
- **Canonical Model Rate Cards:**
  - Added alias mappings in `@qodewk/pricing` for Anthropic (Claude 3.7/3.5 variants, Claude Code), OpenAI (o1/o3/4o-latest), Google (Gemini 2/3), and DeepSeek (V3/R1).
  - Supported token metrics: prompt input, completion output, cache read, and cache creation.
- **Expanded Platform Support:**
  - Typed footprint support for `aider`, `copilot`, `windsurf`, `opencode`, `kilo`, `codex`, and `cline`.

---

## [0.4.0] — 2026-10-02

### 🚀 Added
- **Commit-Bound Scored Attribution (Phase P0):**
  - Replaced timestamp-only heuristics with scored primary attribution (`scoreFootprint`, `selectPrimaryFootprint`).
  - Verifies exact commit binds (+1.00 score), path overlap ratios (0–0.40 score), and temporal window proximity.
- **Path Normalization & Security:**
  - Improved Cursor URI decoding and path normalizations for cross-platform compatibility across Windows (unc/backslashes) and POSIX file systems.
  - Enforced a hard 50 KB body size cap across all receipt ingestion endpoints.
- **Monorepo Tooling Alignment:**
  - Aligned monorepo workspace dependencies to Node.js 22+ and pnpm 10.5.2 with Turbo 2.x orchestration.

---

## [0.3.0] — 2026-10-01

### 🚀 Added
- **Versioned Rate Card Registry:**
  - Dedicated `@qodewk/pricing` package managing real-time model pricing cards across major LLM providers.
- **Cryptographic Anonymization:**
  - Salted HMAC-SHA256 non-reversible project alias and repository hashing to protect private codebase identity.
- **Comprehensive Unit Test Suite:**
  - Vitest test suite across `@qodewk/protocol`, `@qodewk/core`, and `@qodewk/pricing` validating schema serialization and token calculations.

---

## [0.2.0] — 2026-09-30

### 🚀 Added
- **Interactive TUI Menu Panel:**
  - Early terminal menu (`qodewk menu`, `qodewk -i`) providing guided command execution and terminal inspection.
- **Fast Non-Blocking Git Hooks Installer:**
  - Automated Git hook installer (`qodewk hook install`, `qodewk hook uninstall`) spawning background detached workers executing in under 5ms without slowing git commit workflows.

---

## [0.1.0] — 2026-09-27

### 🚀 Added
- **Initial Open Source Release:**
  - Universal Git telemetry engine and digital receipt generator for AI-assisted software development.
- **Next.js Web Application:**
  - Monospace thermal receipt card visualizer with serrated top/bottom SVG cut edges, dark/light theme toggle, and dynamic Opengraph image generation (`/api/og`).
- **Terminal CLI Engine:**
  - Bare `qodewk` command execution, `--json` schema export, `--today` / `--since` filter options, and `qodewk share` URL generation workflow.
