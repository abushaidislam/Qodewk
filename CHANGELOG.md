# Changelog

All notable changes to the **Qodewk** monorepo are documented in this file.  
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
