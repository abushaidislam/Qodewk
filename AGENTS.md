# AGENTS.md — Qodewk Engineering & Collaboration Guide

> **Notice for AI Coding Agents & Human Contributors:**  
> This file defines the architectural invariants, design token constraints, monorepo boundaries, and step-by-step roadmap for **Qodewk**. All autonomous agents operating in this workspace must strictly follow these instructions.

---

## 1. Project Mission & Identity

- **Canonical Product Name:** **Qodewk** (CLI command: `qodewk`, `npx qodewk`).
- **Core Thesis:** The Git revision graph and local filesystem constitute the single source of truth across all coding agents. Qodewk is an open-source, universal telemetry and digital receipt generator for the AI coding agent era.
- **Prime Directive:**
  > *"Git tells Qodewk what changed. Provider telemetry, when available, tells Qodewk what was consumed. Qodewk must never present an inference as exact usage."*

---

## 2. Invariant Engineering Rules (Non-Negotiable)

1. **Never Fake Precision:**
   - Always label metrics by provenance: `observed`, `estimated`, `imported`, `verified`, or `unknown`.
   - Never present a heuristic dollar amount without an explicit `~` or confidence range.
   - `confidence` must always be stored as a `0.0–1.0` numeric float in data contracts.
2. **Privacy by Construction (Zero Source Code Exfiltration):**
   - Raw source code and diff bodies **never** leave the developer's machine by default.
   - Public receipts transmit only metadata: file counts, line insertions/deletions, language ratios, token counts, estimated/verified cost, and salted cryptographic hashes (`HMAC-SHA256`).
   - The `/api/receipts` endpoint enforces a hard request body cap of **50 KB**.
3. **Monorepo Dependency Boundaries (Critical for Serverless/Edge):**
   - `apps/web` (Next.js Edge / Serverless) **MUST NEVER** import `packages/core` (which requires native Node.js filesystem, C-bindings, and local `git` binary).
   - `apps/web` can only import zero-native packages: `packages/protocol` and `packages/pricing`.
   - `packages/cli` can import `packages/core`, `packages/protocol`, and `packages/pricing`.
4. **Git Hooks Must Be Non-Blocking (< 5ms):**
   - Hooks (`post-commit`, `post-rewrite`) must spawn background processes detached from standard streams (`(qodewk record-event &) > /dev/null 2>&1`) and exit with `0` immediately.
   - Hooks must coexist non-destructively with Husky/Lefthook using boundary markers (`# --- BEGIN QODEWK HOOK ---`).
5. **Local Mode Must Remain Fully Functional:**
   - Qodewk must generate local terminal receipts and SQLite/Git Notes records without requiring network connectivity or a cloud account.
   - In CI environments (`CI=true` or `--no-db`), use in-memory mode (`:memory:`).
6. **CLI Command & Interactive Menu Parity (Full TUI Discovery):**
   - Whenever any new top-level CLI command (e.g. `doctor`, `audit`, `share`, `notes`) or major capability is added, it **MUST** be exposed on the interactive terminal control panel (`packages/cli/src/menu.ts`) with corresponding key mappings (`0–9`, quick jump), clear descriptions, and action handlers.
   - Developers launching `qodewk menu` or `npx qodewk -i` must have 100% feature discoverability without needing to memorize shell flags.
   - Unit tests (`packages/cli/test/menu.test.ts`) must be updated in lockstep to verify menu key parity, non-emoji Claude editorial formatting, and action integrity.

---

## 3. Design System & Aesthetic Mandate

> [!CRITICAL]
> ### 🚨 STRICT ZERO-TOLERANCE POLICY ON "GENERIC / AI-STYLE" DESIGNS
> **Autonomous agents and human contributors MUST NEVER invent ad-hoc styles, generic modern SaaS tropes, or stereotypical "AI-style" designs (e.g. purple/violet gradients, glowing neon cyan outlines, cool slate gray backgrounds, or pure white `#ffffff` canvas).**
>
> **MANDATORY RULE:** Before writing or touching ANY frontend component, page layout, CSS file, or receipt generator, **YOU MUST READ AND STRICTLY ADHERE TO [`docs/design-system.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/design-system.md)**. Every color, font, spacing unit, and component state MUST be an exact match to the tokens specified in that file.

### Color Palette (Claude Warm Editorial — Exact Hex Enforcement)
- **Canvas (`canvas`):** `#faf9f5` (Warm tinted cream — **NEVER** pure white `#ffffff` or cool gray `#f8fafc`).
- **Primary / Coral (`primary`):** `#cc785c` (Signature warm coral CTA).
- **Active Coral (`primary-active`):** `#a9583e` (Darker press state).
- **Disabled Coral (`primary-disabled`):** `#e6dfd8`.
- **Ink (`ink`):** `#141413` (Warm dark primary text).
- **Body (`body`):** `#3d3d3a` / **Body Strong (`body-strong`):** `#252523`.
- **Muted (`muted`):** `#6c6a64` / **Muted Soft (`muted-soft`):** `#8e8b82`.
- **Surfaces:**
  - `surface-card`: `#efe9de` (Light cream feature cards).
  - `surface-cream-strong`: `#e8e0d2`.
  - `surface-dark`: `#181715` (Deep obsidian for code blocks, terminal chrome, dark mockups).
  - `surface-dark-elevated`: `#252320`.
  - `surface-dark-soft`: `#1f1e1b`.
- **Hairlines:** `#e6dfd8` (1px subtle border on cream surfaces) / `#ebe6df` (hairline soft).
- **Accents:** Teal `#5db8a6` (status dots), Amber `#e8a55a` (subtle highlight tags).

### Typography Stack
- **Display Headlines (h1/h2):** `Copernicus`, `Tiempos Headline`, or `Cormorant Garamond` (Serif, weight 400, negative letter-spacing `-0.5px` to `-1.5px`). **NEVER** use bold sans-serif for display headings.
- **Body & UI:** `StyreneB` or `Inter` (Humanist sans, weight 400/500).
- **Code & Telemetry Data:** `JetBrains Mono` or `ui-monospace` (Monospace with `font-variant-numeric: tabular-nums`).

### Thermal Receipt Styling & Mechanics
- **Edges:** Serrated / jagged zig-zag cut edges at the top and bottom of the receipt card (via SVG / CSS mask).
- **Pacing:** Alternate surface rhythm: `cream` → `cream-card` → `dark-mockup` → `coral-callout` → `dark-footer`. Never place identical surface bands consecutively.
- **Verification:** Dynamic inline Code 128 barcode at the bottom linking to `https://qodewk.dev/r/[id]`.
- **Trust Badge:** Always show `[✓] Source code was never uploaded to Qodewk`.

---

## 4. Repository & Monorepo Shape

```text
Qodewk/
├── apps/
│   └── web/                   # Next.js 15 (App Router, Tailwind v4, shadcn/ui, Satori + resvg-js)
├── packages/
│   ├── protocol/              # Canonical Zod schemas & TypeScript contracts (Receipt v1.0)
│   ├── pricing/               # Versioned multi-model rate card registry (Claude, OpenAI, Gemini, DeepSeek)
│   ├── core/                  # Git engine (simple-git), AST complexity, dual-engine estimation, SQLite (~/.qodewk)
│   ├── cli/                   # Commander/Citty terminal binary (`qodewk`, `npx qodewk`)
│   └── action/                # GitHub Action composite workflow for sticky PR comments
├── docs/                      # Institutional whitepaper, design system, and architectural specs
├── .gitignore
├── README.md
└── AGENTS.md
```

---

## 5. Execution Plan & Step-by-Step Roadmap

When prompted to build or expand the codebase, execute according to this structured sequence:

### Phase 1: Workspace & Core Contracts (Foundation)
1. **Initialize Git & Workspace:** Run `git init`, create `pnpm-workspace.yaml`, and root `package.json`.
2. **`packages/protocol`:** Implement `ReceiptV1Schema`, `AttributionModeSchema`, and payload validators in Zod.
3. **`packages/pricing`:** Implement the multi-model rate card with per-million token pricing (input, output, cache read, cache write).

### Phase 2: Core Engine & Local State
4. **`packages/core`:**
   - Git diff extractor via `simple-git` (`git diff-tree --numstat --summary`).
   - SQLite state storage in `~/.qodewk/state.db` (with `:memory:` fallback for CI).
   - Dual-engine cost estimator (deterministic JSONL/SQLite harvesting + AST/Git multiplier fallback).
   - Git Notes integration (`refs/notes/qodewk`).

### Phase 3: Terminal CLI
5. **`packages/cli`:**
   - `qodewk` — Monospace box-drawing terminal receipt.
   - `qodewk --json` — Machine-readable JSON output.
   - `qodewk share` — Sanitize payload, POST to `/api/receipts`, save claim token, return public link.

### Phase 4: Web Application & Receipt Card
6. **`apps/web`:**
   - Next.js 15 App Router setup with Tailwind CSS v4 and Claude design tokens.
   - Route `/r/[id]` — Interactive thermal receipt card with serrated edges, paper grain, and dark code mockup surfaces.
   - Dynamic OG image route `/api/og/[id]` using Satori and resvg-js for 35ms Twitter/LinkedIn card generation.
   - Endpoint `/api/receipts` with 50KB payload cap, rate limiting, and author claim tokens.

### Phase 5: GitHub Action & Distribution
7. **`packages/action` & CI/CD:** Composite action for pull request synchronization with sticky markdown comment receipts.

---

## 6. Coding Standards for Autonomous Agents

- **TypeScript:** Strict mode enabled (`"strict": true`, `"noImplicitAny": true`).
- **Package Manager:** `pnpm` exclusively. Never run `npm install` or `yarn` inside subdirectories.
- **Node.js Target:** Node.js 22+.
- **Formatting & Style:** ESLint + Prettier. Clean code without trailing spaces or messy comments.
- **Reference Files:**
 - Master Architecture Blueprint: [`docs/blueprint.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/blueprint.md)
 - Design Tokens & Specs: [`docs/design-system.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/design-system.md)
 - 48-Hour MVP Scope: [`docs/10-mvp-48h.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/10-mvp-48h.md)
 - Production Maturity & Roadmap: [`docs/12-production-roadmap.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/12-production-roadmap.md)

---

## 7. Testing Mandate & Test Registration Guidelines

> [!IMPORTANT]
> ### 🚨 MANDATORY TEST REGISTRATION FOR NEW FEATURES & REGRESSION SAFETY
> All autonomous agents and human contributors adding or modifying features in Qodewk **MUST** write and register corresponding test cases. Under no circumstances should business logic or data contracts be modified without updating or expanding unit/edge-case tests.

### Test Execution & Framework
- **Test Runner:** `vitest` (configured at monorepo root and executable via `pnpm test` / `npm test`).
- **Location Rules:**
  - Place unit and edge-case tests in `test/` or `tests/` directories within the target package (or app).
  - Test files must follow TypeScript naming conventions (e.g. `*.test.ts`).

### Package Test Requirements
1. **`packages/protocol` (`packages/protocol/test/protocol.test.ts`):**
   - Whenever Zod schemas (`ReceiptV1Schema`, `ProviderSessionSchema`, `AttributionModeSchema`) are updated, unit tests MUST verify both happy-path parsing and rejection of invalid payloads (boundary checks, string formats, length constraints, regex patterns).
2. **`packages/pricing` (`packages/pricing/test/pricing.test.ts`):**
   - When new model rate cards or provider rate cards are added to `RATE_CARDS`, tests MUST verify exact key lookup, fuzzy matching fallbacks, and mathematical correctness of `computeCost` (including zero tokens and high cache-hit ratios).
3. **`packages/core` (`packages/core/test/core.test.ts` & `attribution.test.ts`):**
   - Every harvester (`antigravity`, `claude`, `cursor`, etc.) MUST have tests verifying graceful handling of missing transcripts/databases.
   - Any modification to scoring heuristics (`scoreFootprint`, `selectPrimaryFootprint`), cost estimation multipliers (`estimateCost`), or Git diff parsing (`computeAiWrittenRatio`, `extractGitMetrics`) MUST include unit and edge-case tests.
4. **`packages/cli` (`packages/cli/test/cli.test.ts` & `smoke.test.ts`):**
   - CLI flags, barcode generation (`barcode.ts`), and QR rendering (`qr.ts`) MUST be tested for correct string encoding and output formatting.
5. **`apps/web` (`apps/web/test/web.test.ts`):**
   - Edge/Serverless storage adapters and API handlers MUST have unit tests verifying in-memory storage behavior and payload constraint enforcement.

---

## 8. Versioning & Changelog Mandate (Non-Negotiable)

> [!CRITICAL]
> ### 🚨 MANDATORY CHANGELOG MAINTENANCE ON EVERY VERSION BUMP
> Whenever any package version is bumped, features are added, or bug fixes are applied across the Qodewk monorepo, autonomous agents and human contributors **MUST** document all changes in [`CHANGELOG.md`](file:///c:/Users/ASUS/Desktop/Qodewk/CHANGELOG.md) adhering to the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standard.
>
> **Requirements:**
> 1. **Synchronized Version Bump:** When bumping versions, update all package manifests (`packages/*/package.json`, `apps/*/package.json`, and CLI internal version constants) uniformly.
> 2. **Changelog Section:** Add a new version header `## [X.Y.Z] — YYYY-MM-DD` at the top of `CHANGELOG.md`.
> 3. **Structured Categories:** Group entries under standard categories:
>    - `### 🚀 Added` for new features or capabilities.
>    - `### 🛡️ Fixed & Changed` for bug fixes, performance improvements, or refactoring.
>    - `### ⚠️ Breaking Changes` for any breaking protocol or API changes.
> 4. **No Version Change Without Changelog:** Never push code with a version change or new release without an accompanying `CHANGELOG.md` update.

