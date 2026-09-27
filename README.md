# Qodewk Documentation

Qodewk is an open-source, universal telemetry and digital receipt layer for the AI coding agent era.

## Documentation map

### Core Specifications & Systems
- [`docs/blueprint.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/blueprint.md) — Master Architecture & Strategy Blueprint (deep-tech whitepaper, data contracts, and market strategy)
- [`docs/design-system.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/design-system.md) — Claude-inspired Warm Editorial Design System, Design Tokens & Thermal Receipt Aesthetics

### Modular Architectural Chapters
- [`docs/00-product-thesis.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/00-product-thesis.md) — Product definition, thesis, positioning, non-goals
- [`docs/01-architecture.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/01-architecture.md) — System architecture, local collector, Git/filesystem capture, cloud boundary
- [`docs/02-receipt-protocol.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/02-receipt-protocol.md) — Receipt schema, event model, versioning, interoperability
- [`docs/03-token-cost-estimation.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/03-token-cost-estimation.md) — Token/cost estimation, confidence model, pricing registry
- [`docs/04-privacy-security.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/04-privacy-security.md) — Privacy-first guarantees, threat model, data minimization
- [`docs/05-competitive-landscape.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/05-competitive-landscape.md) — Chit/Claude receipts, WakaTime, Cursor, Copilot and defensibility
- [`docs/06-plg-growth.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/06-plg-growth.md) — Receipt cards, GitHub Action, sharing loops, PLG
- [`docs/07-business-model.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/07-business-model.md) — Free, Pro and Team/Enterprise monetization
- [`docs/08-edge-cases.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/08-edge-cases.md) — Monorepos, rebases, squash merges, attribution and performance risks
- [`docs/09-tech-stack.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/09-tech-stack.md) — Recommended implementation stack and tradeoffs
- [`docs/10-mvp-48h.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/10-mvp-48h.md) — Concrete weekend build plan and scope cut
- [`docs/11-development-rules.md`](file:///c:/Users/ASUS/Desktop/Qodewk/docs/11-development-rules.md) — Engineering rules for future contributors/AI coding agents

## Core product principle

> Git tells Qodewk what changed. Provider telemetry, when available, tells Qodewk what was consumed. Qodewk must never present an inference as exact usage.

## Product name

The product is **Qodewk**. The workspace folder, package names, CLI commands, and documentation all use this canonical name.

## Suggested initial repository shape

```text
qodewk/
├── apps/
│   └── web/
├── packages/
│   ├── cli/
│   ├── core/
│   ├── protocol/
│   ├── pricing/
│   └── providers/
├── docs/
└── README.md
```

## MVP

The first vertical slice is intentionally small:

```text
Git repo
  -> Qodewk CLI
  -> observed Git metrics
  -> estimated tokens/cost
  -> receipt JSON
  -> shareable web receipt
  -> OG image
  -> GitHub PR comment
```

Do not build a team dashboard, universal exact attribution, desktop app, Rust core, or agent kill-switch in the first 48 hours.
