import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StaggeredNavFiles } from "@/components/landing/staggered-nav-files";
import { Providers } from "@/components/providers";
import { fontVariables } from "@/lib/fonts";
import { createMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = createMetadata({
	title: {
		template: "%s | Qodewk",
		default: "Qodewk — Universal Git Telemetry & Digital Receipts",
	},
	description:
		"Universal Git telemetry and digital receipt generator for the AI coding agent era",
});

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			className={cn(fontVariables, "antialiased")}
			suppressHydrationWarning
			data-scroll-behavior="smooth"
		>
			<body suppressHydrationWarning>
				<Providers>
					<div className="relative min-h-dvh">
						<StaggeredNavFiles />
						{children}
					</div>
				</Providers>
				<Analytics />
			</body>
		</html>
	);
}
