import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { PricingContent } from "./_components/pricing-content";

export const metadata: Metadata = createMetadata({
	title: "Pricing — Qodewk",
	description:
		"Qodewk pricing — free and open-source universal Git telemetry engine with optional team sync, air-gapped enterprise VPC self-hosting, and live multi-model rate cards.",
});

export default function PricingPage() {
	return <PricingContent />;
}
