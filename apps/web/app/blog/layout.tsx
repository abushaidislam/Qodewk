import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";

const description =
	"Engineering updates, telemetry deep-dives, and architectural insights from the Qodewk team.";

export const metadata: Metadata = createMetadata({
	title: "Blog - Qodewk",
	description,
	openGraph: {
		url: "/blog",
		title: "Blog - Qodewk",
		description,
		images: ["/api/og-release?heading=Qodewk%20Blog"],
	},
	twitter: {
		images: ["/api/og-release?heading=Qodewk%20Blog"],
		title: "Blog - Qodewk",
		description,
	},
	alternates: {
		types: {
			"application/rss+xml": [
				{
					title: "Qodewk Blog",
					url: "https://qodewk.dev/blog/rss.xml",
				},
			],
		},
	},
});

export default function BlogLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<RootProvider theme={{ enabled: false }}>
			<div className="relative flex min-h-screen flex-col">
				<main className="flex-1">{children}</main>
			</div>
		</RootProvider>
	);
}
