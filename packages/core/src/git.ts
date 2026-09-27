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
}

export function computeSaltedHash(value: string, salt: string = "qodewk-default-salt"): string {
  return crypto.createHmac("sha256", salt).update(value).digest("hex");
}

export interface ExtractGitMetricsOptions {
  repoPath?: string;
  baseSha?: string;
  headSha?: string;
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
    // Explicit base and head comparison (e.g. PR branch against target base)
    diffSummary = await git.diffSummary([`${baseSha}...${headSha}`]);
  } else {
    const status = await git.status();
    if (status.files.length > 0) {
      // Diff of working tree changes
      diffSummary = await git.diffSummary(["HEAD"]);
    } else if (baseSha) {
      diffSummary = await git.diffSummary([`${baseSha}...${headSha}`]);
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
    commitMessage
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
