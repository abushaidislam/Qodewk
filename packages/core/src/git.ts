import { simpleGit, SimpleGit } from "simple-git";
import * as crypto from "node:crypto";
import * as path from "node:path";

export interface GitDiffMetrics {
  files: number;
  insertions: number;
  deletions: number;
  netLines: number;
  renames: number;
  languages: Record<string, number>;
  branch: string;
  headSha: string;
  baseSha?: string;
  repoHash: string;
  projectAlias: string;
  commitMessage?: string;
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

  let headSha = options.headSha || "0000000000000000000000000000000000000000";
  let baseSha: string | undefined = options.baseSha;
  let commitMessage: string | undefined = undefined;
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
        if (!options.baseSha && log.all.length > 1 && log.all[1]) {
          baseSha = log.all[1].hash;
        }
      }
    } catch {
      // Fresh repo with no commits yet
    }
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
  let diffSummary;
  if (baseSha && headSha && baseSha !== headSha) {
    const status = await git.status();
    if (status.files.length > 0) {
      // Include unstaged/working tree modifications on top of base commit
      diffSummary = await git.diffSummary([baseSha]);
    } else {
      diffSummary = await git.diffSummary([`${baseSha}..${headSha}`]);
    }
  } else {
    const status = await git.status();
    if (status.files.length > 0) {
      // Diff of working tree changes
      diffSummary = await git.diffSummary(["HEAD"]);
    } else if (baseSha) {
      diffSummary = await git.diffSummary([`${baseSha}..${headSha}`]);
    } else if (headSha !== "0000000000000000000000000000000000000000") {
      // First commit
      diffSummary = await git.diffSummary([headSha]);
    } else {
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

  for (const f of diffSummary.files) {
    if (f.file.includes(" => ")) {
      renames++;
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
    branch,
    headSha,
    baseSha,
    repoHash,
    projectAlias,
    commitMessage,
    commitsCount
  };
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
