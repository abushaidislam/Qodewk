import { ReceiptV1 } from "@qodewk/protocol";

export const DEMO_RECEIPTS: Record<string, ReceiptV1> = {
  // 1. Cursor Modern Session
  "rec_demo_cursor": {
    version: "1.0",
    receipt: {
      id: "rec_demo_cursor",
      createdAt: "2026-10-02T10:30:00.000Z",
      contentHash: "c015e100123456789abcdef0123456789abcdef0123456789abcdef012345678"
    },
    repository: {
      repoHash: "1aae43678eec89514114cd1c1ccdec3ae6a6dedb5686d487e8afe7a2c28823df",
      projectAlias: "hyper-engine",
      branch: "feat/cursor-indexer",
      headSha: "7f8b2c1e4d3a5f6e7d8c9b0a1f2e3d4c5b6a7f8e",
      commitsCount: 2
    },
    mutation: {
      files: 8,
      insertions: 340,
      deletions: 45,
      netLines: 295,
      renames: 1,
      languages: {
        "TypeScript": 85,
        "Rust": 15
      }
    },
    ai: {
      provider: "cursor",
      model: "claude-3-5-sonnet",
      task: "Implement indexer concurrency with zero lock contention",
      aiWrittenRatio: 0.88,
      tokens: {
        input: 38000,
        output: 4800,
        cached: 21000
      },
      cost: 0.19,
      mode: "verified",
      confidence: 0.95,
      sessions: [
        {
          provider: "cursor",
          model: "claude-3-5-sonnet",
          task: "Implement indexer concurrency",
          tokens: { input: 38000, output: 4800, cached: 21000 },
          cost: 0.19,
          confidence: 0.95,
          mode: "verified"
        }
      ]
    },
    privacy: {
      sourceExcluded: true,
      isPublic: true,
      anonymizeBranch: false
    }
  },

  // 2. Claude Code Terminal Session
  "rec_demo_claude": {
    version: "1.0",
    receipt: {
      id: "rec_demo_claude",
      createdAt: "2026-10-02T11:15:00.000Z",
      contentHash: "c1a0de123456789abcdef0123456789abcdef0123456789abcdef0123456789a"
    },
    repository: {
      repoHash: "2bbe54789ffc90625225de2d2ddedf4bf7b7efec6797e598f9bfe8b3d39934ef",
      projectAlias: "auth-gateway",
      branch: "fix/jwt-rotation",
      headSha: "8a9c3d2e5f7b1a0e9c8b7a6f5e4d3c2b1a0f9e8d",
      commitsCount: 1
    },
    mutation: {
      files: 5,
      insertions: 185,
      deletions: 32,
      netLines: 153,
      renames: 0,
      languages: {
        "TypeScript": 92,
        "Shell": 8
      }
    },
    ai: {
      provider: "anthropic",
      model: "claude-3-7-sonnet",
      task: "Zero-downtime asymmetric JWT key rotation mechanism",
      aiWrittenRatio: 0.92,
      tokens: {
        input: 42000,
        output: 5100,
        cached: 26000
      },
      cost: 0.21,
      mode: "verified",
      confidence: 0.95,
      sessions: [
        {
          provider: "anthropic",
          model: "claude-3-7-sonnet",
          task: "Zero-downtime asymmetric JWT key rotation mechanism",
          tokens: { input: 42000, output: 5100, cached: 26000 },
          cost: 0.21,
          confidence: 0.95,
          mode: "verified"
        }
      ]
    },
    privacy: {
      sourceExcluded: true,
      isPublic: true,
      anonymizeBranch: false
    }
  },

  // 3. Google Antigravity Session
  "rec_demo_antigravity": {
    version: "1.0",
    receipt: {
      id: "rec_demo_antigravity",
      createdAt: "2026-10-02T11:45:00.000Z",
      contentHash: "a99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbba"
    },
    repository: {
      repoHash: "3cce65890aad01736336ef3e3eeff5cf8c8fffd7808f6090a0cfe9c4e40045f0",
      projectAlias: "tensor-pipeline",
      branch: "feat/model-telemetry",
      headSha: "9b0d4e3f6a8c2b1f0d9c8b7a6f5e4d3c2b1a0f9e",
      commitsCount: 3
    },
    mutation: {
      files: 12,
      insertions: 510,
      deletions: 95,
      netLines: 415,
      renames: 0,
      languages: {
        "Python": 78,
        "TypeScript": 22
      }
    },
    ai: {
      provider: "antigravity",
      model: "claude-sonnet-4-6-thinking",
      task: "Distributed tensor checkpointing and telemetry pipeline",
      aiWrittenRatio: 0.85,
      tokens: {
        input: 65000,
        output: 7200,
        cached: 40000
      },
      cost: 0.34,
      mode: "verified",
      confidence: 0.95,
      sessions: [
        {
          provider: "antigravity",
          model: "claude-sonnet-4-6-thinking",
          task: "Distributed tensor checkpointing",
          tokens: { input: 65000, output: 7200, cached: 40000 },
          cost: 0.34,
          confidence: 0.95,
          mode: "verified"
        }
      ]
    },
    privacy: {
      sourceExcluded: true,
      isPublic: true,
      anonymizeBranch: false
    }
  },

  // 4. Aider CLI Pairing Session
  "rec_demo_aider": {
    version: "1.0",
    receipt: {
      id: "rec_demo_aider",
      createdAt: "2026-10-02T12:00:00.000Z",
      contentHash: "f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2"
    },
    repository: {
      repoHash: "4ddf76901bbe12847447fe4f4ff006df9d9000e891907101b1d0fa0d5e115601",
      projectAlias: "design-system",
      branch: "feat/accessible-tabs",
      headSha: "a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9",
      commitsCount: 1
    },
    mutation: {
      files: 4,
      insertions: 96,
      deletions: 14,
      netLines: 82,
      renames: 0,
      languages: {
        "TypeScript": 80,
        "CSS": 20
      }
    },
    ai: {
      provider: "aider",
      model: "claude-3-5-sonnet",
      task: "WCAG AAA accessible tab panel with roving tabindex",
      aiWrittenRatio: 0.95,
      tokens: {
        input: 12500,
        output: 1800,
        cached: 7500
      },
      cost: 0.06,
      mode: "verified",
      confidence: 0.95,
      sessions: [
        {
          provider: "aider",
          model: "claude-3-5-sonnet",
          task: "WCAG AAA accessible tab panel",
          tokens: { input: 12500, output: 1800, cached: 7500 },
          cost: 0.06,
          confidence: 0.95,
          mode: "verified"
        }
      ]
    },
    privacy: {
      sourceExcluded: true,
      isPublic: true,
      anonymizeBranch: false
    }
  }
};
