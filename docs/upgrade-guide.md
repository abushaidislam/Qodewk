# Qodewk Upgrade & Migration Guide (v0.2.x → v0.4.0 / v1.0)

> This guide documents architectural improvements, new CLI commands, attribution modes, and migration steps for upgrading to **Qodewk v0.4.0+**.

---

## 🌟 Highlights of v0.4.0

1. **Commit-Bound Attribution Truth:** No more "newest timestamp wins" heuristic. Qodewk uses a scored primary selector evaluating exact Git commit binds, touched file overlap, and temporal proximity.
2. **Universal Agent Support (Tier A):** Native local adapters for Cursor, Claude Code, Google Antigravity / Gemini CLI, Aider, Windsurf, and Git commit trailers (`Co-authored-by`).
3. **Git Notes Offline Ledger:** Persist receipts directly into your local Git graph under `refs/notes/qodewk`. Receipts stay with your repo even without network access.
4. **Serverless Storage Protection:** Built-in safeguards against cold-start receipt loss when publishing in production.

---

## 🕹️ CLI Changes & New Commands

### New `--notes` Flag
Persists the generated receipt into a Git Note attached to the HEAD commit:
```bash
# Generate receipt and attach as Git Note under refs/notes/qodewk
qodewk --notes
```

### New `qodewk notes` Command Group
Manage and inspect local Git notes receipts:
```bash
# View receipt attached to HEAD commit (or pass a specific SHA)
qodewk notes show [commit-sha]

# View receipt in raw JSON
qodewk notes show --json

# Generate and attach receipt to a commit
qodewk notes write [commit-sha]

# List all commits in the repository with attached Qodewk notes
qodewk notes list
```

---

## 🏷️ Attribution Provenance Modes

In Qodewk v0.4.0+, every metric declares its exact derivation source. Heuristics are never presented as exact billing truth.

| Mode | Label | Explanation |
|---|---|---|
| `verified` | **Verified** | Cross-checked against local billing exports, provider transcripts with token usage, or Aider session stats. |
| `observed` | **Observed** | Harvested from structured Git commit trailers (`Co-authored-by: GitHub Copilot <...>`) or direct agent event markers. |
| `imported` | **Imported** | Extracted from agent SQLite databases (e.g. Cursor, Windsurf) without exact token counters. Token counts are computed from steps and diff mutations. |
| `estimated` | **Estimated (~)** | Heuristic derivation from Git diff mutations and versioned multi-model rate cards (`@qodewk/pricing`). Displayed with `~` and explicit confidence float (e.g. `0.75`). |
| `unknown` | **Unknown** | No agent telemetry discovered. Code mutation metrics are preserved, but cost remains unlabeled. |

---

## 📦 Monorepo Package Reference

| Package | Purpose | Serverless / Edge Safe? |
|---|---|---|
| `@qodewk/protocol` | Canonical Zod schemas & TypeScript types (`ReceiptV1`) | ✅ Yes |
| `@qodewk/pricing` | Multi-model rate cards & model alias resolution | ✅ Yes |
| `@qodewk/core` | Git diff engine, SQLite database, scoring & harvesters | ❌ Node.js only |
| `qodewk` (CLI) | Commander terminal binary & interactive TUI menu | ❌ Node.js only |
| `@qodewk/action` | GitHub Action for sticky PR comment receipts | ❌ GitHub Action runner |
| `web` (App) | Next.js 15 thermal receipt viewer & API endpoints | ✅ Yes |

---

## 🔒 Privacy Invariants

- **Source Code is NEVER Uploaded:** The CLI and GitHub Action only transmit non-reversible metadata (counts, hashes, tokens, costs).
- **Hard 50 KB Request Limit:** `/api/receipts` strictly rejects any payload exceeding 50 KB.
- **Path Sanitization:** When receipts are shared to the cloud, all local file paths (`filesTouched`) are automatically stripped.
