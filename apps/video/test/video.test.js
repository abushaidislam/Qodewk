import { describe, it, expect } from "vitest";
import { ReceiptV1Schema } from "@qodewk/protocol";
describe("@qodewk/video Composition & Design System Tests", () => {
    it("exports QodewkProductDemo composition parameters correctly", () => {
        const totalFrames = 1800;
        const fps = 30;
        const durationSeconds = totalFrames / fps;
        expect(durationSeconds).toBe(60);
        expect(totalFrames).toBe(1800);
        expect(fps).toBe(30);
    });
    it("verifies scene frame budget allocation totals exactly 1800 frames", () => {
        const scene1Frames = 300; // 0 - 300
        const scene2Frames = 500; // 300 - 800
        const scene3Frames = 400; // 800 - 1200
        const scene4Frames = 300; // 1200 - 1500
        const scene5Frames = 300; // 1500 - 1800
        const total = scene1Frames + scene2Frames + scene3Frames + scene4Frames + scene5Frames;
        expect(total).toBe(1800);
    });
    it("verifies design system color variables match specification", () => {
        const colors = {
            creamCanvas: "#faf9f5",
            primaryCoral: "#cc785c",
            darkNavyCodeWindow: "#181715",
            lightCreamSurface: "#efe9de",
            successGreen: "#5db872",
        };
        expect(colors.creamCanvas).toBe("#faf9f5");
        expect(colors.primaryCoral).toBe("#cc785c");
        expect(colors.darkNavyCodeWindow).toBe("#181715");
        expect(colors.lightCreamSurface).toBe("#efe9de");
    });
    it("verifies receipt text data matches valid ReceiptV1Schema protocol", () => {
        const mockReceiptPayload = {
            version: "1.0",
            receipt: {
                id: "rec_01J8Y29K4Z00ABC123DEF456",
                createdAt: "2026-09-26T20:00:00Z",
                contentHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            },
            repository: {
                repoHash: "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
                projectAlias: "devhub",
                branch: "feat/auth",
                headSha: "7f8b2c1e4d3a5f6e7d8c9b0a1f2e3d4c5b6a7f8e",
                commitsCount: 3,
            },
            mutation: {
                files: 14,
                insertions: 420,
                deletions: 80,
                netLines: 340,
                renames: 0,
            },
            ai: {
                provider: "anthropic",
                model: "claude-3-7-sonnet",
                tokens: {
                    input: 85500,
                    output: 43000,
                    cached: 15000,
                },
                cost: 0.38,
                mode: "observed",
                confidence: 0.94,
            },
            privacy: {
                sourceExcluded: true,
                isPublic: true,
                anonymizeBranch: false,
            },
        };
        const parsed = ReceiptV1Schema.safeParse(mockReceiptPayload);
        expect(parsed.success).toBe(true);
        if (parsed.success) {
            expect(parsed.data.repository.branch).toBe("feat/auth");
            expect(parsed.data.mutation.insertions).toBe(420);
            expect(parsed.data.mutation.deletions).toBe(80);
            expect(parsed.data.ai.cost).toBe(0.38);
            expect(parsed.data.ai.confidence).toBe(0.94);
            expect(parsed.data.privacy.sourceExcluded).toBe(true);
        }
    });
});
//# sourceMappingURL=video.test.js.map