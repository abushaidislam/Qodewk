# Qodewk — Proof of Shipment for the AI Coding Agent Era

> **Universal telemetry and digital receipt generator for autonomous software development.**  
> Built for Claude Code, Cursor, Copilot, Codex, and multi-agent Git workflows.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Turborepo](https://img.shields.io/badge/monorepo-Turborepo-ef4444.svg)](https://turbo.build)
[![Design: Claude Warm Editorial](https://img.shields.io/badge/design-Claude%20Editorial-cc785c.svg)](docs/design-system.md)

---

## ⚡️ Quickstart (Zero Install)

Generate a digital proof-of-work receipt directly from any Git repository:

```bash
# Generate monospace thermal receipt in terminal
npx qodewk

# Output machine-readable JSON telemetry
npx qodewk --json

# Publish privacy-safe receipt to web and get shareable URL
npx qodewk share

# Audit a PR branch diff range against base
npx qodewk audit --base origin/main --head HEAD --format markdown --out receipt.md
```

### Thermal ASCII Receipt Preview
```text
  /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
  |                   Q O D E W K                        |
  |             *** PROOF OF SHIPMENT ***                |
  |                                                      |
  | ID:     rec_dd56d34a6bb4ff290b1d DATE: 2026-09-27    |
  | REPO:   qodewk             BRANCH: master            |
  | ==================================================== |
  | ITEMS CHANGED                                    QTY |
  | ---------------------------------------------------- |
  | Files Touched                                     40 |
  | Lines Inserted                                + 3952 |
  | Lines Deleted                                    - 0 |
  | Net Code Delta                                + 3952 |
  | ---------------------------------------------------- |
  | AI TELEMETRY                                         |
  | Provider: anthropic · claude-3-7-sonnet              |
  | Tokens:   200k in (120k cached) / 35k out            |
  | Total Tokens:                                234,580 |
  | ==================================================== |
  | ESTIMATED AI COST                             ~$0.79 |
  | CONFIDENCE: 45%    [Mode: unknown  ]                 |
  | ==================================================== |
  |                                                      |
  |   ||| | ||||| ||| |||| |||||| |||| ||| ||||||| |||   |
  |   https://qodewk.dev/r/rec_dd56d34a6bb4ff290b1d830   |
  |                                                      |
  |   [✓] Source code was never uploaded to Qodewk       |
  \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/
```

---

## 🔒 Privacy Invariant (Zero Source Exfiltration)

1. **No Code Leaves Your Machine:** Source code files and raw Git diff bodies **never** touch the network.
2. **Metadata Only:** Public receipts contain only file counts, line insertions/deletions, language ratios, token counts, and cryptographic hashes (`HMAC-SHA256`).
3. **Hard 50 KB Request Cap:** The `/api/receipts` endpoint enforces a strict `50 KB` request body ceiling.
4. **Kill Switch:** Set `QODEWK_TELEMETRY=off` to disable all cloud publishing permanently.

---

## 🏛️ Monorepo Structure

```text
Qodewk/
├── apps/
│   └── web/                   # Next.js 15 (App Router, Claude Warm Editorial, Satori OG)
├── packages/
│   ├── protocol/              # Canonical Zod schemas & TypeScript contracts (Receipt v1.0)
│   ├── pricing/               # Versioned frontier rate card registry (Claude, OpenAI, Gemini, DeepSeek)
│   ├── core/                  # Git engine (simple-git), dual-engine estimator, zero-native node:sqlite
│   ├── cli/                   # Self-contained bundled executable (`qodewk`, `npx qodewk`)
│   └── action/                # GitHub Action for automated sticky PR comment receipts
├── docs/                      # Architectural whitepaper, design specs, and deployment guides
├── .github/workflows/         # CI/CD & PR telemetry workflow
├── README.md
└── AGENTS.md                  # Strict contributor invariants & coding rules
```

---

## 📖 Documentation Map

### Architecture & Specs
- [`docs/blueprint.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/blueprint.md) — Master Architecture Blueprint (158KB Deep-Tech Whitepaper)
- [`docs/design-system.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/design-system.md) — Claude-inspired Warm Editorial Design System & Thermal Receipt Tokens
- [`docs/deployment.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/deployment.md) — Production Deployment (Vercel, Docker, Cloud Run) & NPM Publishing Guide
- [`AGENTS.md`](file:///c:/Users/ASUS/Desktop/Qodewk/AGENTS.md) — Strict Invariant Engineering Rules & Aesthetic Mandates

### Modular Deep Dives
- [`docs/00-product-thesis.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/00-product-thesis.md) — Product definition & market positioning
- [`docs/01-architecture.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/01-architecture.md) — System boundaries & capture pipelines
- [`docs/02-receipt-protocol.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/02-receipt-protocol.md) — Receipt v1.0 schema specification
- [`docs/03-token-cost-estimation.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/03-token-cost-estimation.md) — Dual-engine estimation & confidence scoring
- [`docs/04-privacy-security.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/04-privacy-security.md) — Threat model & 50 KB security boundaries
- [`docs/06-plg-growth.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/06-plg-growth.md) — Viral receipt loops & PR sticky comment integration
- [`docs/10-mvp-48h.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/10-mvp-48h.md) — 48-Hour MVP scope and verification criteria

---

## 🚀 Running Locally

```bash
# Install dependencies
pnpm install

# Build all packages with Turborepo
pnpm build

# Start web app in development
pnpm --filter web dev
# App is available at http://localhost:3000

# Run CLI directly
node packages/cli/dist/index.js
```

---

## 📄 License

MIT © [Qodewk Contributors](LICENSE)
