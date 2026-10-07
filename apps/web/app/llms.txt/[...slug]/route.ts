import { getLegacyMarkdownTarget, getLLMNotFound } from "@/lib/llm-text";
import { createMarkdownResponse } from "@/lib/markdown-response";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ slug: string[] }> },
) {
	const slug = (await params).slug;
	const target = getLegacyMarkdownTarget(slug);
	if (!target) {
		return createMarkdownResponse(
			getLLMNotFound(`/llms.txt/${slug.join("/")}`),
			{ status: 404 },
		);
	}

	const redirectUrl = new URL(request.url);
	redirectUrl.pathname = target;
	return Response.redirect(redirectUrl, 308);
}
