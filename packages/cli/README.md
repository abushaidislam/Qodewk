# Qodewk — Proof of Shipment for the AI Coding Agent Era

> **Universal telemetry, multi-platform agent footprint harvester, and digital receipt generator for autonomous software development.**  
> Built for Google Antigravity, Claude Code, Cursor, Copilot, Windsurf, Aider, and multi-agent Git workflows.

[![npm version](https://img.shields.io/npm/v/qodewk.svg?color=cc785c&label=npm%20package)](https://www.npmjs.com/package/qodewk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Turborepo](https://img.shields.io/badge/monorepo-Turborepo-ef4444.svg)](https://turbo.build)
[![Design: Claude Warm Editorial](https://img.shields.io/badge/design-Claude%20Editorial-cc785c.svg)](https://qodewk.dev)

---

## ⚡️ Quickstart (Zero Install)

Run directly from any Git repository without installing any packages globally:

```bash
# Generate monospace thermal receipt for latest commit / working tree
npx qodewk

# Harvest agent work for today (Chit-style proof of shipment)
npx qodewk --today

# Harvest agent work from the last 24 hours or 7 days
npx qodewk --since 24h
npx qodewk --since 7d

# Filter to a specific agent platform (antigravity, claude, cursor)
npx qodewk --platform antigravity

# Output machine-readable JSON telemetry
npx qodewk --json

# Publish privacy-safe receipt to web and get shareable URL
npx qodewk share

# Audit a PR branch diff range against base
npx qodewk audit --base origin/main --head HEAD --format markdown --out receipt.md
```

### Verified Thermal ASCII Receipt Preview
```text
  /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
  |                     Q O D E W K                      |
  |              *** PROOF OF SHIPMENT ***               |
  |                                                      |
  | ID:   rec_8381ef3792010f9a2cfe      DATE: 2026-09-28 |
  | REPO: qodewk                          BRANCH: master |
  | TASK: Antigravity Model Provider Issues              |
  | ==================================================== |
  | ITEMS CHANGED                                    QTY |
  | ---------------------------------------------------- |
  | Files Touched                                      1 |
  | Lines Inserted                                  + 50 |
  | Lines Deleted                                   - 58 |
  | Net Code Delta                                   - 8 |
  | ---------------------------------------------------- |
  | AI TELEMETRY & ATTRIBUTION                           |
  | Provider: antigravity · gemini-3                     |
  | AI Written Code                     88% (Human: 12%) |
  | Tokens:   935k in (654k cached) / 112k out           |
  | Total Tokens:                              1,046,640 |
  | ==================================================== |
  | VERIFIED AI COST                               $2.72 |
  | CONFIDENCE: 95%                     [Mode: verified] |
  | ==================================================== |
  |                                                      |
  |   ||| | ||||| ||| |||| |||||| |||| ||| ||||||| |||   |
  |   https://qodewk.dev/r/rec_8381ef3792010f9a2cfe52…   |
  |                                                      |
  |   [✓] Source code was never uploaded to Qodewk       |
  \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/
```

---

## 🌟 What's New: Universal Multi-Platform Footprint Harvester

Unlike single-vendor utilities (like Chit, which only support Claude Code CLI), **Qodewk operates globally across all major AI coding platforms**. It reads your local agent transcripts, matches them with your repository's Git revision graph, and proves what was actually shipped.

### Supported Platforms & Harvesters

| Platform | Local Data Source / Footprint | Captured Telemetry |
|---|---|---|
| **Google Antigravity** | `~/.gemini/antigravity/conversation_summaries.db` & `brain/<id>/.../transcript.jsonl` | Shipped task titles, exact models (`Claude Opus 4.6 Thinking`, `Gemini 3.8 Flash`, etc.), tool calls (`replace_file_content`, `write_to_file`), and multi-turn tokens |
| **Claude Code CLI** | `~/.claude/projects/<slug>/sessions/*.jsonl` | User prompts, exact input/output/cached token usage, and `Edit`/`Write` file mutations |
| **Cursor IDE** | `%APPDATA%\Cursor\User\workspaceStorage\*\state.vscdb` (Win) / `Library/Application Support/Cursor/...` (Mac) | Workspace session bubbles, model types (`claude-3-5-sonnet`, `gpt-4o`), and generation timestamps |
| **Aider** | `.aider.chat.history.md` (Repository root) | Session prompts, model IDs, and code file diffs |
| **GitHub Copilot** | Git commit revision graph trailers (`Co-authored-by: Copilot`) | Commit-level author attribution |

### Key Capabilities

1. **Date-wise & Duration Filtering:**
   Analyze agent output over arbitrary time windows (`--today`, `--since 24h`, `--since 7d`, `--since "2026-09-28"`).
2. **AI vs. Human Code Attribution:**
   Cross-references Git diff hunks against agent tool calls to calculate exact contribution percentages (e.g. `AI Written Code: 88% (Human: 12%)`).
3. **Shipped Task Recognition:**
   Extracts high-level task summaries and user prompts directly from session databases, so your receipt doubles as an instant standup or PR summary.
4. **Never Fake Precision (Dual-Engine Provenance):**
   - **`verified` (95% Confidence):** Harvested directly from local agent transcripts & SQLite databases.
   - **`estimated` (45–65% Confidence):** Contextual Git diff & AST complexity fallback when operating in closed/uninstrumented environments.
5. **Modern Frontier Rate Cards:**
   Built-in pricing cards with cache read/write rates for `claude-opus-4-6-thinking`, `claude-sonnet-4-6-thinking`, `gemini-3-8-flash`, `gemini-2-5-pro`, `gpt-4o`, `o3-mini`, `deepseek-v3`, and `deepseek-r1`.

---

## 💻 CLI Command Reference

| Command / Option | Description | Output / Example |
|---|---|---|
| `npx qodewk` | Harvest local agent footprints and inspect Git commit | Monospace thermal receipt |
| `npx qodewk --today` | Generate receipt for all agent sessions and code written today | Daily shipment receipt |
| `npx qodewk --since <duration>` | Filter agent work by duration (e.g. `24h`, `7d`, `2026-09-28`) | Time-bounded telemetry receipt |
| `npx qodewk --platform <platform>` | Filter telemetry to a specific platform (`antigravity`, `claude`, `cursor`, `all`) | Single-platform audit |
| `npx qodewk --json` | Export machine-readable telemetry conforming to canonical `ReceiptV1` schema | Formatted JSON output |
| `npx qodewk share` | Publish privacy-safe metadata to Qodewk Cloud and generate short link | `https://qodewk.dev/r/rec_...` |
| `npx qodewk share --today` | Share today's harvested footprint window | Public URL + claim token |
| `npx qodewk audit --base <branch>` | Calculate aggregate diff and telemetry across an entire PR branch range | Git revision delta receipt |
| `npx qodewk hook install` / `hooks install` | Install non-blocking `post-commit` + `post-rewrite` hooks | Local auto-record |
| `npx qodewk record` / `record-event` | Silent SQLite record (hook entrypoint) | exit 0 always |
| `npx qodewk -f markdown -o receipt.md` | Export sticky Markdown receipt directly formatted for GitHub PR comments | File `receipt.md` |
| `npx qodewk -p <provider> -m <model>` | Override detected provider & frontier model pricing rate card | Custom model cost estimate |
| `npx qodewk --anon` | Redact sensitive repository and branch identifiers | Privacy-hardened receipt |
| `npx qodewk --local` | Force local-only mode (no cloud sockets on share) | Local thermal receipt |

---

## 🔒 Privacy Invariant (Zero Source Exfiltration)

1. **No Code Leaves Your Machine:** Source code files and raw Git diff bodies **never** touch the network.
2. **Metadata Only:** Public receipts contain only file counts, line insertions/deletions, language ratios, token counts, task titles, and cryptographic hashes (`HMAC-SHA256`).
3. **Hard 50 KB Request Cap:** The `/api/receipts` endpoint enforces a strict `50 KB` request body ceiling.
4. **Kill Switch:** Set `QODEWK_TELEMETRY=off` to disable all cloud publishing permanently.
5. **Local SQLite Footprint Storage:** Telemetry remains strictly stored in local SQLite (`~/.qodewk/state.db`).

---

## 📄 License

MIT © [Qodewk Contributors](LICENSE)
