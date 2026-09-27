import { ReceiptV1 } from "@qodewk/protocol";

/**
 * Formats a ReceiptV1 as a GitHub PR-ready Markdown comment.
 * Conforms strictly to privacy guarantees and provenance labelling.
 */
export function formatMarkdownReceipt(receipt: ReceiptV1, publicUrl?: string): string {
  const url = publicUrl || `https://qodewk.dev/r/${receipt.receipt.id}`;
  const totalTokens = (receipt.ai.tokens.input + receipt.ai.tokens.output).toLocaleString();
  const costPrefix = receipt.ai.mode === "verified" ? "$" : "~$";
  const confidencePercent = `${Math.round(receipt.ai.confidence * 100)}%`;
  const confidenceTier =
    receipt.ai.confidence >= 0.8 ? "High" : receipt.ai.confidence >= 0.4 ? "Medium" : "Low";

  const lines = [
    `<!-- QODEWK_RECEIPT_START:${receipt.receipt.id} -->`,
    `### 🧾 Qodewk Telemetry Receipt`,
    ``,
    `| Metric | Measurement | Provenance |`,
    `| :--- | :--- | :--- |`,
    `| **Files Touched** | \`${receipt.mutation.files}\` | Observed |`,
    `| **Lines Inserted** | \`+${receipt.mutation.insertions}\` | Observed |`,
    `| **Lines Deleted** | \`-${receipt.mutation.deletions}\` | Observed |`,
    `| **Net Delta** | \`${receipt.mutation.netLines >= 0 ? "+" : ""}${receipt.mutation.netLines}\` | Observed |`,
    `| **AI Model** | \`${receipt.ai.provider} · ${receipt.ai.model || "Unknown"}\` | ${receipt.ai.mode} |`,
    `| **Tokens Consumed** | \`~${totalTokens}\` | Estimated |`,
    `| **AI Spend** | \`${costPrefix}${receipt.ai.cost.toFixed(2)}\` | Estimated |`,
    `| **Confidence** | \`${confidencePercent}\` (${confidenceTier}) | Dual-Engine |`,
    ``,
    `> 🔒 **Privacy Guarantee:** *Source code was never uploaded to Qodewk. Telemetry computed strictly from cryptographic Git metadata.*`,
    ``,
    `🔗 [**View Full Digital Receipt →**](${url})`,
    `<!-- QODEWK_RECEIPT_END -->`
  ];

  return lines.join("\n");
}
