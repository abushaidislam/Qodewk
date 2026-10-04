import { unstable_cache } from "next/cache";
import staticContributors from "./contributors-data.json";

export interface CommunityStats {
	npmDownloads: number;
	npmWeeklyHistory: number[];
	githubStars: number;
	contributors: number;
	discordMembers: number;
}

export interface ContributorInfo {
	login: string;
	avatar_url: string;
	html_url: string;
}

export function getContributors(): ContributorInfo[] {
	return staticContributors as ContributorInfo[];
}

const staticContributorsCount = staticContributors.length || 8;

// Fetch NPM download stats for the last week
async function fetchNpmDownloads(): Promise<number> {
	try {
		const response = await fetch(
			"https://api.npmjs.org/downloads/point/last-week/qodewk",
			{ next: { revalidate: 3600 } },
		);

		if (!response.ok) {
			return 14500; // Fallback value
		}

		const data = await response.json();
		return data.downloads || 14500;
	} catch {
		return 14500;
	}
}

// Fetch NPM weekly download history (last 6 months, aggregated by week)
async function fetchNpmWeeklyHistory(): Promise<number[]> {
	try {
		const end = new Date();
		const start = new Date();
		start.setMonth(start.getMonth() - 6);
		const fmt = (d: Date) => d.toISOString().slice(0, 10);
		const response = await fetch(
			`https://api.npmjs.org/downloads/range/${fmt(start)}:${fmt(end)}/qodewk`,
			{ next: { revalidate: 3600 } },
		);
		if (!response.ok) return [];
		const data = await response.json();
		const downloads: { day: string; downloads: number }[] = data.downloads;
		if (!downloads || downloads.length === 0) return [];
		const weeks: number[] = [];
		for (let i = 0; i < downloads.length; i += 7) {
			const week = downloads.slice(i, i + 7);
			weeks.push(week.reduce((sum, d) => sum + d.downloads, 0));
		}
		return weeks;
	} catch {
		return [];
	}
}

// Shared headers for GitHub API requests
const githubHeaders = {
	Accept: "application/vnd.github.v3+json",
	...(process.env.GITHUB_TOKEN && {
		Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
	}),
};

// Fetch GitHub repository stats — repo info and contributors in parallel
async function fetchGitHubStats(): Promise<{
	stars: number;
	contributors: number;
}> {
	try {
		const [repoResponse, contributorsResponse] = await Promise.all([
			fetch("https://api.github.com/repos/abushaidislam/Qodewk", {
				next: { revalidate: 3600 },
				headers: githubHeaders,
			}),
			fetch(
				"https://api.github.com/repos/abushaidislam/Qodewk/contributors?per_page=1&anon=true",
				{
					next: { revalidate: 3600 },
					headers: githubHeaders,
				},
			),
		]);

		let stars = 128;
		if (repoResponse.ok) {
			const data = await repoResponse.json();
			stars = data.stargazers_count || 128;
		}

		let contributorsCount = staticContributorsCount;
		if (contributorsResponse.ok) {
			const linkHeader = contributorsResponse.headers.get("Link");
			if (linkHeader) {
				const match = linkHeader.match(/page=(\d+)>; rel="last"/);
				if (match) {
					contributorsCount = parseInt(match[1], 10);
				}
			}
		}

		return { stars, contributors: contributorsCount };
	} catch {
		return { stars: 128, contributors: staticContributorsCount };
	}
}

// Cached function to get all community stats
export const getCommunityStats = unstable_cache(
	async (): Promise<CommunityStats> => {
		const [npmDownloads, npmWeeklyHistory, githubStats] = await Promise.all([
			fetchNpmDownloads(),
			fetchNpmWeeklyHistory(),
			fetchGitHubStats(),
		]);

		return {
			npmDownloads,
			npmWeeklyHistory,
			githubStars: githubStats.stars,
			contributors: githubStats.contributors,
			discordMembers: 0,
		};
	},
	["community-stats"],
	{
		revalidate: 3600,
		tags: ["community-stats"],
	},
);
