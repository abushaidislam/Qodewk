# Qodewk GitHub Action

> **Universal telemetry and digital receipt generator for the AI coding agent era.**  
> Automatically audits Pull Requests and posts sticky PR markdown receipts detailing mutation metrics, detected AI coding agents, and token provenance.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Marketplace](https://img.shields.io/badge/Marketplace-Qodewk%20Digital%20Receipt-orange.svg)](https://github.com/marketplace/actions/qodewk-digital-receipt)

---

## 🔒 Privacy by Construction

- **Zero Source Code Exfiltration:** Raw code, diff bodies, and hunk contents **never leave your GitHub Action runner**.
- **Metadata Only:** Transmits only non-reversible metrics (file counts, insertions/deletions, language ratios, token counts, and HMAC-SHA256 salted hashes).
- **Hard 50 KB Request Cap:** Ingestion endpoints strictly reject oversized payloads.

---

## ⚡ Quick Start

Create `.github/workflows/qodewk.yml` in your repository:

```yaml
name: "Qodewk Telemetry Receipt"

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  receipt:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Codebase
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full history needed for diff attribution

      - name: Generate Qodewk PR Receipt
        uses: abushaidislam/Qodewk/packages/action@v0.4.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          base-ref: ${{ github.base_ref }}
          head-sha: ${{ github.sha }}
          publish-cloud: "true"
```

---

## 📥 Inputs

| Input | Description | Required | Default |
|---|---|---|---|
| `github-token` | GitHub token for reading PR context and posting comments | No | `${{ github.token }}` |
| `base-ref` | Target base git ref or commit SHA (e.g. `origin/main`) | No | `${{ github.base_ref }}` |
| `head-sha` | Head commit SHA being audited | No | `${{ github.sha }}` |
| `publish-cloud` | Whether to publish metadata to Qodewk cloud for public card link | No | `"true"` |
| `api-url` | Qodewk API ingestion endpoint | No | `https://qodewk.flinkeo.online/api/receipts` |
| `comment-pr` | Whether to upsert a sticky comment on the pull request | No | `"true"` |

---

## 📤 Outputs

| Output | Description | Example |
|---|---|---|
| `receipt-id` | Canonical receipt identifier | `rec_a1b2c3d4e5f6...` |
| `receipt-url` | Public verification URL of digital receipt | `https://qodewk.flinkeo.online/r/rec_...` |
| `cost` | Estimated or verified AI cost in USD | `0.18` |
| `tokens` | Total tokens consumed | `17500` |
| `markdown` | Formatted Markdown receipt comment body | `<!-- QODEWK_RECEIPT_START:...` |

---

## 🧾 Sticky PR Comment Example

When active, Qodewk posts an idempotent sticky comment that updates on subsequent commits rather than cluttering your PR discussion with duplicate messages:

```markdown
<!-- QODEWK_RECEIPT_START:rec_4892c90c8f12345678901234 -->
### 🧾 Qodewk Telemetry Receipt

| Metric | Value |
|---|---|
| **Primary Agent** | `claude` (claude-3-7-sonnet) |
| **Attribution Mode** | `observed` (90% confidence) |
| **Files Touched** | `4` (+120 / -15 lines) |
| **Estimated Cost** | `~$0.14` (8,500 tokens) |

> [!NOTE]  
> [✓] Source code was never uploaded to Qodewk.  
> [View Public Digital Receipt →](https://qodewk.flinkeo.online/r/rec_4892c90c8f12345678901234)
<!-- QODEWK_RECEIPT_END -->
```

---

## 📄 License

MIT © [Qodewk Contributors](https://github.com/abushaidislam/Qodewk)
