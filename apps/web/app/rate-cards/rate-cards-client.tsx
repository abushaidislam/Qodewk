"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
	Search,
	Sparkles,
	Cpu,
	Terminal,
	Copy,
	Check,
	ArrowRight,
	ExternalLink,
	ShieldCheck,
} from "lucide-react";
import { RATE_CARDS, computeCost, type ModelRateCard } from "@qodewk/pricing";
import Footer from "@/components/landing/footer";
import { HalftoneBackground } from "@/components/landing/halftone-bg";
import { SignatureMark } from "@/components/landing/signature-mark";
import { cn } from "@/lib/utils";

const highlights = [
	{ label: "Registry", value: "@qodewk/pricing" },
	{ label: "Providers", value: "Anthropic, OpenAI, Google, DeepSeek" },
	{ label: "Rates Benchmark", value: "USD per 1M Tokens" },
	{ label: "Cache Savings", value: "Prompt Caching Aware" },
	{ label: "Telemetry", value: "Dual-Engine Estimation" },
];

function SideRail() {
	return (
		<div className="hidden lg:block relative w-full shrink-0 lg:w-[30%] lg:h-dvh border-b lg:border-b-0 lg:border-r border-foreground/[0.06] overflow-clip px-5 sm:px-6 lg:px-10 lg:sticky lg:top-0">
			<HalftoneBackground />
			<div className="absolute left-10 right-6 bottom-4 z-[3]">
				<SignatureMark compact />
			</div>
			<div className="relative w-full pt-6 md:pt-10 pb-6 lg:pb-0 flex flex-col justify-center lg:h-full">
				<div className="space-y-6">
					<div className="space-y-2">
						<h1 className="text-2xl md:text-3xl xl:text-4xl text-neutral-800 dark:text-neutral-200 tracking-tight leading-tight">
							<span className="underline underline-offset-4 decoration-foreground/40 font-serif">
								Model Rate Cards
							</span>
						</h1>
						<p className="text-sm text-foreground/70 dark:text-foreground/50 leading-relaxed max-w-[260px]">
							Versioned multi-model rate cards from{" "}
							<span className="font-mono text-foreground/90">@qodewk/pricing</span>.
							Transparent token benchmarks across frontier providers used by Qodewk to verify agent expenditures.
						</p>
					</div>

					<div className="border-t border-foreground/10 pt-4 space-y-0">
						{highlights.map((item) => (
							<div
								key={item.label}
								className="flex items-baseline justify-between py-1.5 border-b border-dashed border-foreground/[0.06] last:border-0"
							>
								<span className="text-[11px] text-foreground/70 dark:text-foreground/50 uppercase tracking-wider">
									{item.label}
								</span>
								<span className="text-[11px] text-foreground/85 dark:text-foreground/75 font-mono">
									{item.value}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

function MobileHeader() {
	return (
		<div className="lg:hidden relative border-b border-foreground/[0.06] overflow-hidden -mx-5 sm:-mx-6 px-5 sm:px-6 mb-5">
			<HalftoneBackground />
			<div className="relative space-y-2 py-16">
				<h1 className="text-2xl md:text-3xl xl:text-4xl text-neutral-800 dark:text-neutral-200 tracking-tight leading-tight">
					<span className="underline underline-offset-4 decoration-foreground/40 font-serif">
						Model Rate Cards
					</span>
				</h1>
				<p className="text-sm text-foreground/70 dark:text-foreground/50 leading-relaxed">
					Versioned multi-model rate cards from @qodewk/pricing. Transparent
					token benchmarks across frontier providers used by Qodewk to verify
					agent expenditures.
				</p>
			</div>
		</div>
	);
}

export function RateCardsClient() {
	const [activeProvider, setActiveProvider] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [inputTokens, setInputTokens] = useState<number>(50000);
	const [outputTokens, setOutputTokens] = useState<number>(2500);
	const [cachedTokens, setCachedTokens] = useState<number>(20000);
	const [copiedCode, setCopiedCode] = useState<boolean>(false);

	const modelList = useMemo(() => {
		const cards = Object.values(RATE_CARDS).filter(
			(card) => card.id !== "default",
		);

		return cards.filter((card) => {
			const matchesProvider =
				activeProvider === "all" || card.provider === activeProvider;
			const matchesSearch =
				card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				card.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
				card.provider.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesProvider && matchesSearch;
		});
	}, [activeProvider, searchQuery]);

	const formatContext = (ctx: number) => {
		if (ctx >= 1_000_000) return `${(ctx / 1_000_000).toFixed(0)}M`;
		return `${Math.round(ctx / 1000)}k`;
	};

	const copyInstallCode = () => {
		navigator.clipboard.writeText(
			`import { RATE_CARDS, computeCost, getRateCard } from "@qodewk/pricing";\n\nconst card = getRateCard("claude-3-7-sonnet");\nconst cost = computeCost(50000, 2500, 20000, card);\nconsole.log(\`Estimated cost: ~$\${cost.toFixed(4)}\`);`,
		);
		setCopiedCode(true);
		setTimeout(() => setCopiedCode(false), 2000);
	};

	return (
		<div className="relative min-h-dvh pt-14 lg:pt-0">
			<div className="relative text-foreground">
				<div className="flex flex-col lg:flex-row">
					<SideRail />

					{/* Right Content Area */}
					<div className="relative w-full lg:w-[70%] overflow-x-hidden no-scrollbar">
						<div className="px-5 sm:px-6 lg:px-8 lg:pt-20 pb-20 space-y-12">
							<MobileHeader />

							{/* Announcement / Context Note */}
							<motion.div
								initial={{ opacity: 0, y: 6 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: 0.05 }}
								className="flex items-center gap-4 px-5 py-3.5 border border-foreground/10 rounded-sm bg-foreground/2"
							>
								<p className="flex-1 text-[13px] text-foreground/75 leading-relaxed">
									The official rate card registry for Qodewk. Token rates are
									mathematically applied to Git commit diffs and session transcripts
									to generate verifiable digital receipts.
								</p>
								<Link
									href="/docs/reference/telemetry"
									className="group shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-foreground/85 border border-foreground/15 rounded-sm hover:border-foreground/30 hover:bg-foreground/5 transition-all font-medium"
								>
									Telemetry Docs
									<ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
								</Link>
							</motion.div>

							{/* Interactive Token Diff Cost Simulator */}
							<motion.div
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: 0.1 }}
								className="border border-foreground/10 rounded-sm bg-background p-6 space-y-4 shadow-xs"
							>
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-foreground/10 pb-4">
									<div className="flex items-center gap-2">
										<Sparkles className="w-4 h-4 text-primary" />
										<h2 className="text-sm font-mono uppercase tracking-wider text-foreground font-medium">
											Commit Diff Token Cost Simulator
										</h2>
									</div>
									<span className="text-[11px] font-mono text-foreground/50">
										Showing heuristic ~USD cost based on current slider values
									</span>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-1">
									<div className="space-y-1.5">
										<div className="flex items-center justify-between">
											<label className="text-[11px] font-mono text-foreground/70 uppercase">
												Input Tokens
											</label>
											<span className="text-[12px] font-mono font-medium text-foreground tabular-nums">
												{inputTokens.toLocaleString()}
											</span>
										</div>
										<input
											type="range"
											min={1000}
											max={200000}
											step={1000}
											value={inputTokens}
											onChange={(e) => setInputTokens(Number(e.target.value))}
											className="w-full accent-primary h-1.5 cursor-pointer bg-foreground/10 rounded-lg"
										/>
									</div>

									<div className="space-y-1.5">
										<div className="flex items-center justify-between">
											<label className="text-[11px] font-mono text-foreground/70 uppercase">
												Output Tokens
											</label>
											<span className="text-[12px] font-mono font-medium text-foreground tabular-nums">
												{outputTokens.toLocaleString()}
											</span>
										</div>
										<input
											type="range"
											min={100}
											max={16000}
											step={100}
											value={outputTokens}
											onChange={(e) => setOutputTokens(Number(e.target.value))}
											className="w-full accent-primary h-1.5 cursor-pointer bg-foreground/10 rounded-lg"
										/>
									</div>

									<div className="space-y-1.5">
										<div className="flex items-center justify-between">
											<label className="text-[11px] font-mono text-foreground/70 uppercase">
												Prompt Cache Hit
											</label>
											<span className="text-[12px] font-mono font-medium text-foreground tabular-nums">
												{Math.min(cachedTokens, inputTokens).toLocaleString()}
											</span>
										</div>
										<input
											type="range"
											min={0}
											max={inputTokens}
											step={1000}
											value={Math.min(cachedTokens, inputTokens)}
											onChange={(e) => setCachedTokens(Number(e.target.value))}
											className="w-full accent-primary h-1.5 cursor-pointer bg-foreground/10 rounded-lg"
										/>
									</div>
								</div>
							</motion.div>

							{/* Filter Tabs & Search Header */}
							<div className="space-y-4">
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
									{/* Provider Filter Tabs */}
									<div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
										{[
											{ id: "all", label: "All Models" },
											{ id: "anthropic", label: "Anthropic" },
											{ id: "openai", label: "OpenAI" },
											{ id: "google", label: "Google" },
											{ id: "deepseek", label: "DeepSeek" },
										].map((prov) => (
											<button
												key={prov.id}
												type="button"
												onClick={() => setActiveProvider(prov.id)}
												className={cn(
													"px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm transition-all whitespace-nowrap",
													activeProvider === prov.id
														? "bg-foreground text-background font-medium shadow-xs"
														: "text-foreground/60 hover:text-foreground hover:bg-foreground/5",
												)}
											>
												{prov.label}
											</button>
										))}
									</div>

									{/* Search Input */}
									<div className="relative">
										<Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
										<input
											type="text"
											placeholder="Search models..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="pl-8 pr-3 py-1.5 text-[12px] font-mono bg-foreground/3 border border-foreground/10 rounded-sm focus:outline-none focus:border-foreground/30 w-full sm:w-56"
										/>
									</div>
								</div>

								{/* Model Cards Grid */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{modelList.map((card: ModelRateCard) => {
										const simulatedCost = computeCost(
											inputTokens,
											outputTokens,
											Math.min(cachedTokens, inputTokens),
											card,
										);

										return (
											<div
												key={card.id}
												className="p-5 rounded-sm border border-foreground/10 hover:border-foreground/25 bg-background transition-all flex flex-col justify-between space-y-4 group shadow-2xs"
											>
												<div className="flex items-start justify-between gap-3">
													<div>
														<h3 className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
															{card.name}
														</h3>
														<div className="flex items-center gap-2 mt-1">
															<span className="text-[11px] font-mono uppercase text-foreground/55 px-1.5 py-0.5 rounded bg-foreground/4 border border-foreground/8">
																{card.provider}
															</span>
															<span className="text-[10px] text-foreground/30">
																•
															</span>
															<span className="text-[11px] font-mono text-foreground/55">
																{formatContext(card.contextWindow)} window
															</span>
														</div>
													</div>

													<div className="text-right">
														<div className="text-base font-mono font-medium text-foreground tabular-nums">
															~${simulatedCost.toFixed(4)}
														</div>
														<span className="text-[10px] font-mono text-primary uppercase tracking-wider block">
															simulated diff
														</span>
													</div>
												</div>

												{/* Rate Breakdown Grid */}
												<div className="grid grid-cols-4 gap-2 pt-3 border-t border-dashed border-foreground/10 text-[11px] font-mono">
													<div className="flex flex-col">
														<span className="text-[10px] text-foreground/45 uppercase">
															Input
														</span>
														<span className="text-foreground/85 tabular-nums font-medium">
															${card.inputPerMTok.toFixed(2)}/M
														</span>
													</div>
													<div className="flex flex-col">
														<span className="text-[10px] text-foreground/45 uppercase">
															Output
														</span>
														<span className="text-foreground/85 tabular-nums font-medium">
															${card.outputPerMTok.toFixed(2)}/M
														</span>
													</div>
													<div className="flex flex-col">
														<span className="text-[10px] text-foreground/45 uppercase">
															Cache Read
														</span>
														<span className="text-foreground/85 tabular-nums font-medium">
															${card.cacheReadPerMTok.toFixed(2)}/M
														</span>
													</div>
													<div className="flex flex-col">
														<span className="text-[10px] text-foreground/45 uppercase">
															Cache Write
														</span>
														<span className="text-foreground/85 tabular-nums font-medium">
															${card.cacheWritePerMTok.toFixed(2)}/M
														</span>
													</div>
												</div>
											</div>
										);
									})}
								</div>

								{modelList.length === 0 && (
									<div className="text-center py-16 text-foreground/50 text-xs font-mono border border-foreground/10 rounded-sm bg-foreground/2">
										No matching rate cards found for &ldquo;{searchQuery}&rdquo;.
									</div>
								)}
							</div>

							{/* Programmatic Usage Section */}
							<div className="border border-foreground/10 rounded-sm bg-background p-6 space-y-4">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<h3 className="text-sm font-mono uppercase tracking-wider text-foreground font-medium flex items-center gap-2">
											<Terminal className="w-4 h-4 text-primary" />
											Programmatic SDK Integration
										</h3>
										<p className="text-[12px] text-foreground/60">
											Consume rate cards and calculate exact token costs in your own Node.js or Edge applications.
										</p>
									</div>
									<button
										type="button"
										onClick={copyInstallCode}
										aria-label="Copy TypeScript code"
										className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 border border-foreground/15 rounded-sm hover:bg-foreground/5 transition-all text-foreground/80"
									>
										{copiedCode ? (
											<>
												<Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
												<span>Copied</span>
											</>
										) : (
											<>
												<Copy className="w-3.5 h-3.5" />
												<span>Copy</span>
											</>
										)}
									</button>
								</div>

								<div className="p-4 rounded-sm bg-foreground/[0.03] border border-foreground/[0.08] font-mono text-[12px] leading-relaxed overflow-x-auto text-foreground/85">
									<pre>
										<code>{`import { RATE_CARDS, computeCost, getRateCard } from "@qodewk/pricing";

// 1. Fetch official rate card with fuzzy alias resolution
const card = getRateCard("claude-3-7-sonnet");

// 2. Compute cost: (freshInput * inputRate + cacheRead * cacheRate + output * outputRate)
const cost = computeCost(50000, 2500, 20000, card);

console.log(\`Calculated expenditure: ~$\${cost.toFixed(4)}\`);`}</code>
									</pre>
								</div>
							</div>

							{/* Trust & Provenance Badge */}
							<div className="flex items-center justify-between p-4 rounded-sm border border-foreground/10 bg-foreground/[0.02]">
								<div className="flex items-center gap-2.5">
									<ShieldCheck className="w-4 h-4 text-primary" />
									<span className="text-[12px] font-mono text-foreground/75">
										All model rate cards are versioned under MIT license in <span className="font-semibold text-foreground">@qodewk/pricing</span>.
									</span>
								</div>
								<Link
									href="/pricing"
									className="text-[12px] font-mono text-primary hover:underline inline-flex items-center gap-1"
								>
									View Qodewk Plans
									<ArrowRight className="w-3 h-3" />
								</Link>
							</div>

							<div className="lg:hidden">
								<Footer />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
