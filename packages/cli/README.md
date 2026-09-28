# Qodewk — Proof of Shipment for the AI Coding Agent Era

> **Universal telemetry and digital receipt generator for autonomous software development.**  
> Built for Claude Code, Cursor, Copilot, Codex, and multi-agent Git workflows.

[![npm version](https://img.shields.io/npm/v/qodewk.svg?color=cc785c&label=npm%20package)](https://www.npmjs.com/package/qodewk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Turborepo](https://img.shields.io/badge/monorepo-Turborepo-ef4444.svg)](https://turbo.build)
[![Design: Claude Warm Editorial](https://img.shields.io/badge/design-Claude%20Editorial-cc785c.svg)](docs/design-system.md)

---

## ⚡️ Quickstart (Zero Install)

Run directly from any Git repository without installing any packages globally:

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

## 💻 CLI Command Reference

| Command / Option | Description | Output / Example |
|---|---|---|
| `npx qodewk` | Inspect latest Git commit and generate monospace thermal receipt | Monospace terminal box |
| `npx qodewk --json` | Export machine-readable telemetry conforming to canonical `ReceiptV1` schema | Formatted JSON output |
| `npx qodewk share` | Publish privacy-safe metadata to Qodewk Cloud and generate short link | `https://qodewk.dev/r/rec_...` |
| `npx qodewk audit --base <branch>` | Calculate aggregate diff and telemetry across an entire PR branch range | Git revision delta receipt |
| `npx qodewk -f markdown -o receipt.md` | Export sticky Markdown receipt directly formatted for GitHub PR comments | File `receipt.md` |
| `npx qodewk -p <provider> -m <model>` | Override detected provider & frontier model pricing rate card | Custom model cost estimate |
| `npx qodewk --anon` | Redact sensitive repository and branch identifiers | Privacy-hardened receipt |

---

## 🤖 GitHub Action (Automated PR Sticky Receipts)

Add Qodewk directly to your repository workflow to generate verifiable shipment receipts on every Pull Request:

```yaml
# .github/workflows/qodewk.yml
name: "Qodewk Telemetry Receipt"

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write

jobs:
  audit-receipt:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run Qodewk Audit
        uses: abushaidislam/Qodewk/packages/action@v0.1.6
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          base-ref: origin/${{ github.base_ref }}
          head-sha: ${{ github.sha }}
          publish-cloud: "true"
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

# Run CLI standalone bundle directly
node packages/cli/dist/index.cjs
```

---

## 📄 License

MIT © [Qodewk Contributors](LICENSE)
