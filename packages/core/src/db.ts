import { DatabaseSync } from "node:sqlite";
import * as path from "node:path";
import * as fs from "node:fs";
import * as os from "node:os";
import { ReceiptV1 } from "@qodewk/protocol";

export class LocalStateDB {
  private db: DatabaseSync;

  constructor(inMemory: boolean = false) {
    if (inMemory || process.env.CI === "true" || process.env.QODEWK_NO_DB === "true") {
      this.db = new DatabaseSync(":memory:");
    } else {
      const qodewkDir = path.join(os.homedir(), ".qodewk");
      if (!fs.existsSync(qodewkDir)) {
        fs.mkdirSync(qodewkDir, { recursive: true });
      }
      const dbPath = path.join(qodewkDir, "state.db");
      this.db = new DatabaseSync(dbPath);
    }

    this.migrate();
  }

  private migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS repos (
        id TEXT PRIMARY KEY,
        repo_hash TEXT UNIQUE NOT NULL,
        root_path TEXT NOT NULL,
        alias TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_observed_at DATETIME
      );

      CREATE TABLE IF NOT EXISTS snapshots (
        id TEXT PRIMARY KEY,
        repo_id TEXT NOT NULL,
        branch TEXT NOT NULL,
        head_sha TEXT NOT NULL,
        base_sha TEXT,
        files_count INTEGER NOT NULL,
        insertions INTEGER NOT NULL,
        deletions INTEGER NOT NULL,
        captured_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS receipts (
        id TEXT PRIMARY KEY,
        public_id TEXT UNIQUE,
        repo_id TEXT NOT NULL,
        head_sha TEXT NOT NULL,
        base_sha TEXT,
        payload_json TEXT NOT NULL,
        claim_token TEXT,
        sync_status TEXT DEFAULT 'local',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  public saveReceipt(receipt: ReceiptV1, claimToken?: string) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO receipts (id, public_id, repo_id, head_sha, base_sha, payload_json, claim_token, sync_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      receipt.receipt.id,
      receipt.receipt.id,
      receipt.repository.repoHash,
      receipt.repository.headSha,
      receipt.repository.baseSha || null,
      JSON.stringify(receipt),
      claimToken || null,
      claimToken ? "synced" : "local"
    );
  }

  public getReceipt(id: string): ReceiptV1 | null {
    const row = this.db.prepare("SELECT payload_json FROM receipts WHERE id = ? OR public_id = ?").get(id, id) as { payload_json: string } | undefined;
    if (!row) return null;
    return JSON.parse(row.payload_json) as ReceiptV1;
  }

  public close() {
    this.db.close();
  }
}
