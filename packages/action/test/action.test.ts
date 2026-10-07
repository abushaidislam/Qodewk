import { describe, it, expect, vi, beforeEach } from "vitest";
import * as core from "@actions/core";
import * as github from "@actions/github";
import * as qodewkCore from "@qodewk/core";
import { run } from "../src/index.js";

vi.mock("@actions/core", () => ({
  getInput: vi.fn(),
  setOutput: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  setFailed: vi.fn()
}));

vi.mock("@actions/github", () => ({
  context: {
    payload: {},
    repo: { owner: "test-owner", repo: "test-repo" }
  },
  getOctokit: vi.fn()
}));

vi.mock("@qodewk/core", () => ({
  generateReceipt: vi.fn(),
  formatMarkdownReceipt: vi.fn()
}));

describe("@qodewk/action", () => {
  const mockReceipt = {
    receipt: {
      id: "rec_mock123456789",
      timestamp: "2026-10-07T12:00:00Z"
    },
    ai: {
      cost: 0.042,
      tokens: { input: 1200, output: 450 }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.GITHUB_TOKEN;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.QODEWK_APP_URL;

    vi.mocked(core.getInput).mockImplementation((name: string) => {
      if (name === "github-token") return "mock-token";
      if (name === "publish-cloud") return "false";
      if (name === "comment-pr") return "false";
      return "";
    });

    vi.mocked(qodewkCore.generateReceipt).mockResolvedValue(mockReceipt as any);
    vi.mocked(qodewkCore.formatMarkdownReceipt).mockReturnValue("<!-- QODEWK_RECEIPT_START -->\n### Mock Receipt");
  });

  it("successfully generates receipt and sets action outputs", async () => {
    await run();

    expect(qodewkCore.generateReceipt).toHaveBeenCalled();
    expect(core.setOutput).toHaveBeenCalledWith("receipt-id", "rec_mock123456789");
    expect(core.setOutput).toHaveBeenCalledWith("receipt-url", "https://qodewk.flinkeo.online/r/rec_mock123456789");
    expect(core.setOutput).toHaveBeenCalledWith("cost", "0.042");
    expect(core.setOutput).toHaveBeenCalledWith("tokens", "1650");
    expect(core.setOutput).toHaveBeenCalledWith("markdown", expect.stringContaining("Mock Receipt"));
    expect(core.setFailed).not.toHaveBeenCalled();
  });

  it("handles errors gracefully and calls core.setFailed", async () => {
    vi.mocked(qodewkCore.generateReceipt).mockRejectedValueOnce(new Error("Git tree unreachable"));

    await run();

    expect(core.setFailed).toHaveBeenCalledWith("Qodewk Action failed: Git tree unreachable");
  });

  it("creates a new sticky comment when no existing receipt comment is found", async () => {
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      if (name === "github-token") return "gh-token";
      if (name === "comment-pr") return "true";
      if (name === "publish-cloud") return "false";
      return "";
    });

    // Mock PR context
    (github.context as any).payload = { pull_request: { number: 42 } };

    const mockCreateComment = vi.fn().mockResolvedValue({});
    const mockListComments = vi.fn().mockResolvedValue({
      data: [{ id: 101, body: "Standard bot comment" }]
    });

    vi.mocked(github.getOctokit).mockReturnValue({
      rest: {
        issues: {
          listComments: mockListComments,
          createComment: mockCreateComment,
          updateComment: vi.fn()
        }
      }
    } as any);

    await run();

    expect(mockListComments).toHaveBeenCalledWith({
      owner: "test-owner",
      repo: "test-repo",
      issue_number: 42
    });
    expect(mockCreateComment).toHaveBeenCalledWith({
      owner: "test-owner",
      repo: "test-repo",
      issue_number: 42,
      body: expect.stringContaining("<!-- QODEWK_RECEIPT_START -->")
    });
  });

  it("updates an existing sticky comment when a previous receipt comment is found", async () => {
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      if (name === "github-token") return "gh-token";
      if (name === "comment-pr") return "true";
      if (name === "publish-cloud") return "false";
      return "";
    });

    (github.context as any).payload = { pull_request: { number: 99 } };

    const mockUpdateComment = vi.fn().mockResolvedValue({});
    const mockListComments = vi.fn().mockResolvedValue({
      data: [
        { id: 202, body: "<!-- QODEWK_RECEIPT_START -->\nOld receipt content" }
      ]
    });

    vi.mocked(github.getOctokit).mockReturnValue({
      rest: {
        issues: {
          listComments: mockListComments,
          createComment: vi.fn(),
          updateComment: mockUpdateComment
        }
      }
    } as any);

    await run();

    expect(mockUpdateComment).toHaveBeenCalledWith({
      owner: "test-owner",
      repo: "test-repo",
      comment_id: 202,
      body: expect.stringContaining("<!-- QODEWK_RECEIPT_START -->")
    });
  });
});
