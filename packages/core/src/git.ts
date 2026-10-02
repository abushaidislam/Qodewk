import { simpleGit, SimpleGit } from "simple-git";
import * as crypto from "node:crypto";
import * as path from "node:path";
import { ReceiptV1, ReceiptV1Schema } from "@qodewk/protocol";

export interface GitDiffMetrics {
  files: number;
  insertions: number;
  deletions: number;
  netLines: number;
  renames: number;
  languages: Record<string, number>;
  /** Relative paths of files in the inspected diff (for AI attribution overlap). */
  changedFiles: string[];
  branch: string;
  headSha: string;
  baseSha?: string;
  repoHash: string;
  projectAlias: string;
  commitMessage?: string;
  commitDate?: string;
  commitsCount?: number;
}

export function computeSaltedHash(value: string, salt: string = "qodewk-default-salt"): string {
  return crypto.createHmac("sha256", salt).update(value).digest("hex");
}

export interface ExtractGitMetricsOptions {
  repoPath?: string;
  baseSha?: string;
  headSha?: string;
  since?: string | Date;
}

function parseSinceOption(since?: string | Date): Date | undefined {
  if (!since) return undefined;
  if (since instanceof Date) return since;

  const s = since.trim().toLowerCase();
  const now = new Date();

  if (s === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  if (s === "yesterday") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  }

  const hoursMatch = s.match(/^(\d+)\s*h(?:ours?)?$/);
  if (hoursMatch && hoursMatch[1]) {
    const hours = parseInt(hoursMatch[1], 10);
    return new Date(now.getTime() - hours * 60 * 60 * 1000);
  }

  const daysMatch = s.match(/^(\d+)\s*d(?:ays?)?$/);
  if (daysMatch && daysMatch[1]) {
    const days = parseInt(daysMatch[1], 10);
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }

  const parsed = new Date(since);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return undefined;
}

export async function resolveGitSha(git: SimpleGit, ref: string): Promise<string> {
  const trimmed = ref.trim();
  if (!trimmed) {
    throw new Error("Git reference cannot be empty.");
  }

  // 1. Direct rev-parse (handles full SHAs, short SHAs, branch names, tags, HEAD, HEAD~1)
  try {
    const full = (await git.raw(["rev-parse", "--verify", trimmed])).trim();
    if (/^[0-9a-f]{40}$/i.test(full)) {
      return full.toLowerCase();
    }
  } catch {}

  try {
    const full = (await git.raw(["rev-parse", trimmed])).trim();
    if (/^[0-9a-f]{40}$/i.test(full)) {
      return full.toLowerCase();
    }
  } catch {}

  // 2. Check origin/<ref> in case user passed a branch name without origin/
  try {
    const fullOrigin = (await git.raw(["rev-parse", `origin/${trimmed}`])).trim();
    if (/^[0-9a-f]{40}$/i.test(fullOrigin)) {
      return fullOrigin.toLowerCase();
    }
  } catch {}

  // 3. Check refs/heads/<ref>
  try {
    const fullRef = (await git.raw(["rev-parse", `refs/heads/${trimmed}`])).trim();
    if (/^[0-9a-f]{40}$/i.test(fullRef)) {
      return fullRef.toLowerCase();
    }
  } catch {}

  // 4. If already looks like a valid 40-char SHA (fallback)
  if (/^[0-9a-f]{40}$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  throw new Error(`Unable to resolve git reference '${ref}' to a valid commit SHA.`);
}

export async function detectDefaultBaseBranch(repoPathOrGit: string | SimpleGit = process.cwd()): Promise<string> {
  const git = typeof repoPathOrGit === "string" ? simpleGit(repoPathOrGit) : repoPathOrGit;
  const candidates = ["origin/main", "main", "origin/master", "master"];
  for (const c of candidates) {
    try {
      const sha = (await git.raw(["rev-parse", "--verify", c])).trim();
      if (/^[0-9a-f]{40}$/i.test(sha)) {
        return c;
      }
    } catch {}
  }
  return "main";
}

export async function extractGitMetrics(
  optionsOrPath: string | ExtractGitMetricsOptions = process.cwd()
): Promise<GitDiffMetrics> {
  const options: ExtractGitMetricsOptions =
    typeof optionsOrPath === "string" ? { repoPath: optionsOrPath } : optionsOrPath;
  const repoPath = options.repoPath || process.cwd();
  const git: SimpleGit = simpleGit(repoPath);

  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    throw new Error(`Path ${repoPath} is not a valid Git repository.`);
  }

  // Branch & Commit SHAs
  const branchSummary = await git.branch();
  const branch = branchSummary.current || "HEAD";

  let headSha: string;
  if (options.headSha) {
    headSha = await resolveGitSha(git, options.headSha);
  } else {
    try {
      headSha = (await git.raw(["rev-parse", "HEAD"])).trim().toLowerCase();
    } catch {
      headSha = "0000000000000000000000000000000000000000";
    }
  }

  let baseSha: string | undefined = undefined;
  if (options.baseSha) {
    baseSha = await resolveGitSha(git, options.baseSha);
  }

  let commitMessage: string | undefined = undefined;
  let commitDate: string | undefined = undefined;
  let commitsCount = 1;

  // 1. Time-window aware commit range if 'since' option is specified
  const sinceDate = parseSinceOption(options.since);
  if (sinceDate && !options.baseSha) {
    try {
      const sinceIso = sinceDate.toISOString();
      const commitsRaw = await git.raw(["log", `--since=${sinceIso}`, "--format=%H"]);
      const commitShas = commitsRaw
        .split("\n")
        .map(s => s.trim())
        .filter(Boolean);

      if (commitShas.length > 0) {
        commitsCount = commitShas.length;
        if (!options.headSha) {
          headSha = commitShas[0];
        }
        const oldestSha = commitShas[commitShas.length - 1];
        try {
          const parentSha = (await git.raw(["rev-parse", `${oldestSha}^`])).trim();
          baseSha = parentSha;
        } catch {
          // If oldestSha is the root commit of the repository
          baseSha = oldestSha;
        }
      }
    } catch {
      // Fallback
    }
  }

  // 2. Default latest commit inspection if baseSha was not found via since window
  if (!baseSha) {
    try {
      const log = await git.log({ maxCount: 2 });
      if (log.latest) {
        if (!options.headSha) {
          headSha = log.latest.hash;
        }
        commitMessage = log.latest.message;
        commitDate = log.latest.date;
        if (!options.baseSha && log.all.length > 1 && log.all[1]) {
          baseSha = log.all[1].hash;
        }
      }
    } catch {
      // Fresh repo with no commits yet
    }
  }

  // Retrieve commit message for explicitly provided headSha
  if (!commitMessage && headSha && headSha !== "0000000000000000000000000000000000000000") {
    try {
      const headLog = await git.show(["-s", "--format=%B%x00%aI", headSha]);
      const parts = headLog.split("\0");
      if (parts[0]) commitMessage = parts[0].trim();
      if (parts[1]) commitDate = parts[1].trim();
    } catch {}
  }

  // Calculate commits count between baseSha and headSha if both are known
  if (baseSha && headSha && baseSha !== headSha) {
    try {
      const countRaw = await git.raw(["rev-list", "--count", `${baseSha}..${headSha}`]);
      const count = parseInt(countRaw.trim(), 10);
      if (!isNaN(count) && count > 0) {
        commitsCount = count;
      }
    } catch {}
  }

  // Repository Identity Hash
  let repoIdentifier = path.basename(path.resolve(repoPath));
  try {
    const remotes = await git.getRemotes(true);
    const origin = remotes.find(r => r.name === "origin") || remotes[0];
    if (origin && origin.refs && origin.refs.fetch) {
      repoIdentifier = origin.refs.fetch;
    }
  } catch {
    // Keep folder name as fallback
  }

  const projectAlias = path.basename(path.resolve(repoPath)).toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  const repoHash = computeSaltedHash(repoIdentifier);

  // Compute Diff
  let diffSummary: any;
  try {
    if (baseSha && headSha && baseSha !== headSha) {
      const status = await git.status();
      if (status.files.length > 0) {
        // Include unstaged/working tree modifications on top of base commit
        diffSummary = await git.diffSummary([baseSha]);
      } else {
        diffSummary = await git.diffSummary([`${baseSha}...${headSha}`]).catch(async () => {
          return await git.diffSummary([`${baseSha}..${headSha}`]);
        });
      }
    } else {
      const status = await git.status();
      if (status.files.length > 0) {
        // Diff of working tree changes
        diffSummary = await git.diffSummary(["HEAD"]);
      } else if (baseSha) {
        diffSummary = await git.diffSummary([`${baseSha}..${headSha}`]);
      } else if (headSha !== "0000000000000000000000000000000000000000") {
        // First commit or single commit
        diffSummary = await git.diffSummary([`${headSha}~1..${headSha}`]).catch(async () => {
          return await git.diffSummary([headSha]);
        });
      } else {
        diffSummary = { changed: 0, insertions: 0, deletions: 0, files: [] };
      }
    }
  } catch {
    try {
      diffSummary = await git.diffSummary(["HEAD"]);
    } catch {
      diffSummary = { changed: 0, insertions: 0, deletions: 0, files: [] };
    }
  }

  const files = diffSummary.changed || diffSummary.files.length || 0;
  const insertions = diffSummary.insertions || 0;
  const deletions = diffSummary.deletions || 0;
  const netLines = insertions - deletions;

  // Language Distribution & Renames
  let renames = 0;
  const extCounts: Record<string, number> = {};
  let totalTrackedFiles = 0;
  const changedFiles: string[] = [];

  for (const f of diffSummary.files) {
    if (f.file.includes(" => ")) {
      renames++;
      // Take the destination side of a rename for path matching
      const dest = f.file.split(" => ").pop()?.trim();
      if (dest) changedFiles.push(dest.replace(/\\/g, "/"));
    } else {
      changedFiles.push(f.file.replace(/\\/g, "/"));
    }
    const ext = path.extname(f.file).replace(/^\./, "").toLowerCase();
    const lang = mapExtensionToLanguage(ext);
    if (lang) {
      extCounts[lang] = (extCounts[lang] || 0) + 1;
      totalTrackedFiles++;
    }
  }

  const languages: Record<string, number> = {};
  if (totalTrackedFiles > 0) {
    for (const [lang, count] of Object.entries(extCounts)) {
      languages[lang] = Math.round((count / totalTrackedFiles) * 100);
    }
  } else {
    languages["Other"] = 100;
  }

  return {
    files,
    insertions,
    deletions,
    netLines,
    renames,
    languages,
    changedFiles,
    branch,
    headSha,
    baseSha,
    repoHash,
    projectAlias,
    commitMessage,
    commitDate,
    commitsCount
  };
}

/**
 * Fraction of changed files that also appear in agent footprint edit lists.
 * Returns undefined when either side is empty — never invents a ratio.
 */
export function computeAiWrittenRatio(
  changedFiles: string[],
  aiEditedFiles: string[]
): number | undefined {
  if (changedFiles.length === 0 || aiEditedFiles.length === 0) {
    return undefined;
  }

  const norm = (f: string) =>
    f.replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase();

  const aiNorm = aiEditedFiles.map(norm);
  let hit = 0;

  for (const cf of changedFiles) {
    const c = norm(cf);
    const matched = aiNorm.some(
      (a) =>
        a === c ||
        c.endsWith("/" + a) ||
        a.endsWith("/" + c) ||
        c.endsWith(a) ||
        a.endsWith(c)
    );
    if (matched) hit++;
  }

  return Math.round((hit / changedFiles.length) * 100) / 100;
}

function mapExtensionToLanguage(ext: string): string | null {
  const map: Record<string, string> = {
    ts: "TypeScript",
    tsx: "TypeScript",
    js: "JavaScript",
    jsx: "JavaScript",
    py: "Python",
    rs: "Rust",
    go: "Go",
    java: "Java",
    c: "C",
    cpp: "C++",
    cs: "C#",
    rb: "Ruby",
    php: "PHP",
    html: "HTML",
    css: "CSS",
    scss: "SCSS",
    json: "JSON",
    md: "Markdown",
    sql: "SQL",
    yaml: "YAML",
    yml: "YAML",
    sh: "Shell"
  };
  return map[ext] || (ext ? ext.toUpperCase() : null);
}

export const QODEWK_GIT_NOTES_REF = "refs/notes/qodewk";

export interface GitNotesOptions {
  repoPath?: string;
}

/**
 * Persists a ReceiptV1 as a Git Note on the specified commit SHA under refs/notes/qodewk.
 */
export async function writeGitReceiptNote(
  commitSha: string,
  receipt: ReceiptV1,
  options: GitNotesOptions & { force?: boolean } = {}
): Promise<void> {
  const repoPath = options.repoPath || process.cwd();
  const git = simpleGit(repoPath);

  const cleanSha = commitSha.trim();
  const notePayload = JSON.stringify(receipt, null, 2);

  const args = ["notes", `--ref=${QODEWK_GIT_NOTES_REF}`, "add"];
  if (options.force !== false) {
    args.push("-f");
  }
  args.push("-m", notePayload, cleanSha);

  await git.raw(args);
}

/**
 * Retrieves a ReceiptV1 from the Git Note on the specified commit SHA under refs/notes/qodewk.
 * Returns null if no note exists or if the note is not a valid ReceiptV1.
 */
export async function readGitReceiptNote(
  commitSha: string,
  options: GitNotesOptions = {}
): Promise<ReceiptV1 | null> {
  const repoPath = options.repoPath || process.cwd();
  const git = simpleGit(repoPath);

  const cleanSha = commitSha.trim();

  try {
    const rawNote = await git.raw(["notes", `--ref=${QODEWK_GIT_NOTES_REF}`, "show", cleanSha]);
    if (!rawNote || !rawNote.trim()) return null;

    const parsed = JSON.parse(rawNote.trim());
    const valid = ReceiptV1Schema.safeParse(parsed);
    if (valid.success) {
      return valid.data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Lists all commit SHAs that have an attached Qodewk Git Note under refs/notes/qodewk.
 */
export async function listGitReceiptNotes(
  options: GitNotesOptions = {}
): Promise<string[]> {
  const repoPath = options.repoPath || process.cwd();
  const git = simpleGit(repoPath);

  try {
    const output = await git.raw(["notes", `--ref=${QODEWK_GIT_NOTES_REF}`, "list"]);
    if (!output || !output.trim()) return [];

    // Output lines are in format: "<note_blob_sha> <commit_sha>"
    const lines = output.trim().split("\n");
    const commitShas: string[] = [];
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2 && parts[1]) {
        commitShas.push(parts[1]);
      }
    }
    return commitShas;
  } catch {
    return [];
  }
}
