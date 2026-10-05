import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { BrandClient } from "./brand-client";

export const metadata: Metadata = createMetadata({
	title: "Brand",
	description:
		"The Qodewk brand — logo, tokens, components, and voice used across our product and docs.",
});

export default function BrandPage() {
	return <BrandClient />;
}
