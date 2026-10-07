import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { RateCardsClient } from "./rate-cards-client";

export const metadata: Metadata = createMetadata({
	title: "Model Rate Cards",
	description:
		"Live multi-model rate card registry from @qodewk/pricing — token benchmarks for Claude, OpenAI, Gemini, and DeepSeek with interactive diff cost simulator.",
});

export default function RateCardsPage() {
	return <RateCardsClient />;
}
