# Changelog

All notable changes to the **Qodewk** monorepo are documented in this file.  
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.4.0] — 2026-10-02

### 🚀 Added
- **Commit-Bound Scored Attribution (P0):** Replaced timestamp heuristics with scored primary attribution (`scoreFootprint`, `selectPrimaryFootprint`), verifying exact commit binds (+1.00), path overlap ratios (0–0.40), and temporal proximity.
- **Universal Tier A Harvesters (P1):**
  - **Aider:** Local markdown history parser (`.aider.chat.history.md`) extracting auto-committed Git hashes, models, tokens, and file edits.
  - **Windsurf (Cascade):** Local SQLite workspace reader (`state.vscdb`) parsing Cascade chat sessions and model parameters.
  - **Git Commit Trailers:** Structured parser for `Co-authored-by: GitHub Copilot <...>`, Claude, Cursor, Aider, and Windsurf trailers.
  - **Model Rate Card Aliases:** Canonical alias mapping in `@qodewk/pricing` for Anthropic (Claude 3.7/3.5 variants, Claude Code), OpenAI (o1/o3/4o-latest), Google (Gemini 2/3), and DeepSeek (V3/R1).
- **Production Reliability & Storage Guard (P2):**
  - **Serverless Persistence Guard:** Strict enforcement of Supabase/PostgreSQL in production (`NODE_ENV === "production"`), returning HTTP 503 if unconfigured to prevent cold-start receipt loss.
  - **Sliding-Window Rate Limiter:** Edge-compatible token bucket abuse controls on `/api/receipts` returning HTTP 429 and `Retry-After`.
  - **Git Notes Engine:** Offline ledger storage under `refs/notes/qodewk` via `writeGitReceiptNote`, `readGitReceiptNote`, and CLI commands (`qodewk notes show`, `qodewk notes write`, `qodewk notes list`).
  - **Dedicated Privacy Regression Suite:** Strict zero-exfiltration automated tests verifying source code, diff hunks, and secrets never enter `ReceiptV1` payloads.
  - **Automated CI Quality Pipeline:** Monorepo workflow in `.github/workflows/ci.yml` verifying typecheck, 103+ unit tests, and CLI smoke tests on all PRs.
- **Distribution & PLG (P3):**
  - GitHub Marketplace Action branding and documentation in `packages/action`.
  - Seeded public proof-of-shipment demo receipts for Cursor, Claude Code, Antigravity, and Aider.

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
