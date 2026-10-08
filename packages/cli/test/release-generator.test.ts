import { describe, expect, it } from "vitest";
import { generateSmartReleaseNotes, getRepoInfo } from "../../../scripts/smart-release-generator.mjs";

describe("Smart Release Notes Generator (`smart-release-generator.mjs`)", () => {
  it("resolves repository owner and name from git remote", () => {
    const info = getRepoInfo();
    expect(info).toHaveProperty("owner");
    expect(info).toHaveProperty("repo");
    expect(info.baseUrl).toContain("github.com");
  });

  it("generates Better Auth structured release notes with packages and contributors", () => {
    const notes = generateSmartReleaseNotes("0.10.0", "v0.9.2");
    expect(notes).toBeDefined();
    // Verify Better Auth format elements
    expect(notes).toContain("## `");
    expect(notes).toContain("## Contributors");
    expect(notes).toContain("### 📦 Quick Install");
    expect(notes).toContain("npx qodewk@latest");
    expect(notes).toContain("**Full changelog:**");
  });
});
