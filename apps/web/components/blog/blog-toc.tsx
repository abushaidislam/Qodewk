"use client";

import type { TOCItemType } from "fumadocs-core/toc";
import { TOCProvider, TOCScrollArea } from "fumadocs-ui/components/toc";
import { TOCItems } from "fumadocs-ui/components/toc/default";

interface BlogTOCProps {
	items: TOCItemType[];
}

export function BlogTOC({ items }: BlogTOCProps) {
	const topLevelItems = items.filter((item) => item.depth <= 2);
	if (topLevelItems.length === 0) return null;

	return (
		<TOCProvider toc={topLevelItems}>
			<TOCScrollArea className="blog-toc">
				<TOCItems />
			</TOCScrollArea>
		</TOCProvider>
	);
}
