"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
	ArrowLeft,
	Check,
	Copy,
	ExternalLink,
	GitBranch,
	GitCommit,
	ShieldCheck,
	Code2,
	Share2,
	ChevronDown,
	ChevronUp,
	FileText,
	Lock,
	Sparkles,
	Terminal,
	Cpu,
	SlidersHorizontal,
} from "lucide-react";
import type { ReceiptV1 } from "@qodewk/protocol";
import { DEMO_RECEIPTS } from "@/lib/demo-receipts";
import { ThermalReceipt } from "@/components/ThermalReceipt";
import Footer from "@/components/landing/footer";
import { HalftoneBackground } from "@/components/landing/halftone-bg";
import { SignatureMark } from "@/components/landing/signature-mark";
import { cn } from "@/lib/utils";

interface ReceiptClientProps {
	receipt: ReceiptV1;
}

export function ReceiptClient({ receipt: initialReceipt }: ReceiptClientProps) {
	// The 3 major demo receipts to showcase
	const cursorReceipt = DEMO_RECEIPTS["rec_demo_cursor"]!;
	const claudeReceipt = DEMO_RECEIPTS["rec_demo_claude"]!;
	const antigravityReceipt = DEMO_RECEIPTS["rec_demo_antigravity"]!;

	const demoList = [
		{
			id: "cursor",
			receiptId: cursorReceipt.receipt.id,
			agentName: "Cursor",
			modelName: "Claude 3.5 Sonnet",
			pillColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
			receipt: cursorReceipt,
			href: "/r/demo-cursor",
		},
		{
			id: "claude",
			receiptId: claudeReceipt.receipt.id,
			agentName: "Claude Code",
			modelName: "Claude 3.7 Sonnet",
			pillColor: "bg-primary/10 text-primary border-primary/20",
			receipt: claudeReceipt,
			href: "/r/demo-claude",
		},
		{
			id: "antigravity",
			receiptId: antigravityReceipt.receipt.id,
			agentName: "Antigravity",
			modelName: "Claude 4.6 Thinking",
			pillColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
			receipt: antigravityReceipt,
			href: "/r/demo-antigravity",
		},
	];

	const isKnownDemo = [
		cursorReceipt.receipt.id,
		claudeReceipt.receipt.id,
		antigravityReceipt.receipt.id,
	].includes(initialReceipt.receipt.id);

	const showcaseList = isKnownDemo
		? demoList
		: [
				{
					id: "custom",
					receiptId: initialReceipt.receipt.id,
					agentName: `${initialReceipt.ai.provider.toUpperCase()}`,
					modelName: initialReceipt.ai.model || "Observed Agent",
					pillColor: "bg-primary/10 text-primary border-primary/20",
					receipt: initialReceipt,
					href: `/r/${initialReceipt.receipt.id}`,
				},
				...demoList.slice(0, 2),
		  ];

	// Determine currently selected receipt for inspector and left-rail metadata
	const [activeReceipt, setActiveReceipt] = useState<ReceiptV1>(initialReceipt);
	const [copiedSha, setCopiedSha] = useState(false);
	const [copiedHash, setCopiedHash] = useState(false);
	const [copiedJson, setCopiedJson] = useState(false);
	const [copiedMarkdown, setCopiedMarkdown] = useState(false);
	const [showJson, setShowJson] = useState(false);

	const copySha = () => {
		navigator.clipboard.writeText(activeReceipt.repository.headSha);
		setCopiedSha(true);
		setTimeout(() => setCopiedSha(false), 2000);
	};

	const copyHash = () => {
		navigator.clipboard.writeText(activeReceipt.receipt.contentHash);
		setCopiedHash(true);
		setTimeout(() => setCopiedHash(false), 2000);
	};

	const copyJsonPayload = () => {
		navigator.clipboard.writeText(JSON.stringify(activeReceipt, null, 2));
		setCopiedJson(true);
		setTimeout(() => setCopiedJson(false), 2000);
	};

	const copyPrMarkdown = () => {
		const totalTokens = (
			activeReceipt.ai.tokens.input + activeReceipt.ai.tokens.output
		).toLocaleString();
		const costPrefix = activeReceipt.ai.mode === "verified" ? "$" : "~$";
		const confidencePercent = `${Math.round(activeReceipt.ai.confidence * 100)}%`;
		const baseUrl =
			typeof window !== "undefined"
				? window.location.origin
				: "https://qodewk.dev";
		const publicUrl = `${baseUrl}/r/${activeReceipt.receipt.id}`;

		const md = `### 🤖 Qodewk Receipt
\`\`\`text
Files Changed:     ${activeReceipt.mutation.files}
Lines Inserted:    +${activeReceipt.mutation.insertions}
Lines Deleted:     -${activeReceipt.mutation.deletions}
Net Code Delta:    ${activeReceipt.mutation.netLines >= 0 ? "+" : ""}${activeReceipt.mutation.netLines}
AI Provider:       ${activeReceipt.ai.provider} (${activeReceipt.ai.model || "Unknown"})
Estimated Tokens:  ~${totalTokens}
Estimated Cost:    ${costPrefix}${activeReceipt.ai.cost.toFixed(2)} (${confidencePercent} confidence)
\`\`\`
[✓] Source code was not uploaded to Qodewk.
[View Verified Receipt](${publicUrl})`;

		navigator.clipboard.writeText(md);
		setCopiedMarkdown(true);
		setTimeout(() => setCopiedMarkdown(false), 2000);
	};

	const confidencePercent = `${Math.round(activeReceipt.ai.confidence * 100)}%`;
	const costPrefix = activeReceipt.ai.mode === "verified" ? "$" : "~$";
	const formattedCost = `${costPrefix}${activeReceipt.ai.cost.toFixed(2)}`;

	return (
		<div className="relative min-h-dvh pt-14 lg:pt-0">
			<div className="relative text-foreground">
				<div className="flex flex-col lg:flex-row">
					{/* =========================================================================
					    LEFT SIDE-RAIL: Sticky 30% Panel (Matches /brand, /pricing, /enterprise)
					    ========================================================================= */}
					<aside className="hidden lg:block relative w-full shrink-0 lg:w-[30%] lg:h-dvh border-b lg:border-b-0 lg:border-r border-foreground/[0.06] overflow-clip px-6 lg:px-8 xl:px-10 lg:sticky lg:top-0">
						<HalftoneBackground />

						{/* Pinned Bottom Signature Mark */}
						<div className="absolute left-6 lg:left-8 xl:left-10 right-6 bottom-4 z-[3]">
							<SignatureMark compact />
						</div>

						{/* SideRail Content */}
						<div className="relative w-full pt-8 pb-16 flex flex-col justify-center lg:h-full space-y-6">
							{/* Brand Eyebrow & Title */}
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
										<ShieldCheck className="w-3 h-3" />
										<span>Cryptographic Telemetry</span>
									</div>
								</div>

								<h1 className="text-2xl md:text-3xl xl:text-4xl text-neutral-800 dark:text-neutral-200 tracking-tight leading-tight">
									<span className="underline underline-offset-4 decoration-foreground/40 font-serif">
										Digital Receipts
									</span>
								</h1>

								<p className="text-xs sm:text-sm text-foreground/70 dark:text-foreground/50 leading-relaxed max-w-[300px]">
									Verifiable Git mutation proof for the AI coding agent era.
									Observed diffs, verified model rate cards, and zero raw code
									exfiltration.
								</p>
							</div>

							{/* Agent Switcher Navigator */}
							<div className="border-t border-foreground/10 pt-3 space-y-1.5">
								<div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-foreground/50 pb-1">
									<span>AI Coding Agents</span>
									<span>Switch View</span>
								</div>

								<div className="space-y-1">
									{showcaseList.map((item) => {
										const isSelected =
											activeReceipt.receipt.id === item.receiptId;
										return (
											<button
												key={item.id}
												type="button"
												onClick={() => setActiveReceipt(item.receipt)}
												className={cn(
													"w-full flex items-center justify-between py-1.5 px-2.5 rounded-sm text-xs font-mono transition-all text-left",
													isSelected
														? "bg-foreground/10 text-foreground font-medium border border-foreground/15 shadow-2xs"
														: "text-foreground/60 hover:text-foreground hover:bg-foreground/5",
												)}
											>
												<span className="flex items-center gap-2 truncate">
													<span
														className={cn(
															"w-1.5 h-1.5 rounded-full shrink-0",
															isSelected
																? "bg-primary animate-pulse"
																: "bg-foreground/20",
														)}
													/>
													<span className="truncate">{item.agentName}</span>
												</span>
												<span className="text-[10px] text-foreground/45 font-mono truncate">
													{item.receipt.repository.projectAlias}
												</span>
											</button>
										);
									})}
								</div>
							</div>

							{/* Active Order Telemetry Metadata Table */}
							<div className="border-t border-foreground/10 pt-3 space-y-1.5 font-mono text-[11px]">
								<div className="flex justify-between items-center text-foreground/60">
									<span className="text-foreground/40">ORDER ID:</span>
									<span className="text-foreground/90 font-medium">
										{activeReceipt.receipt.id.slice(0, 16)}
									</span>
								</div>
								<div className="flex justify-between items-center text-foreground/60">
									<span className="text-foreground/40">REPOSITORY:</span>
									<span className="text-foreground/90 font-medium truncate max-w-[150px]">
										{activeReceipt.repository.projectAlias}
									</span>
								</div>
								<div className="flex justify-between items-center text-foreground/60">
									<span className="text-foreground/40">BRANCH:</span>
									<span className="text-foreground/90 font-medium truncate max-w-[150px]">
										{activeReceipt.repository.branch}
									</span>
								</div>
								<div className="flex justify-between items-center text-foreground/60">
									<span className="text-foreground/40">COMMIT SHA:</span>
									<span className="text-foreground/90 font-medium">
										{activeReceipt.repository.headSha.slice(0, 7)}
									</span>
								</div>
								<div className="flex justify-between items-center text-foreground/60">
									<span className="text-foreground/40">PROVENANCE:</span>
									<span className="text-emerald-500 font-medium capitalize">
										{activeReceipt.ai.mode} ({confidencePercent})
									</span>
								</div>
								<div className="flex justify-between items-center text-foreground/60">
									<span className="text-foreground/40">PRIVACY:</span>
									<span className="text-foreground/80">0 Code Uploaded</span>
								</div>
							</div>

							{/* SideRail Action Buttons */}
							<div className="border-t border-foreground/10 pt-3 space-y-2">
								<button
									type="button"
									onClick={copyPrMarkdown}
									className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-foreground text-background text-xs font-mono font-medium hover:opacity-90 transition-opacity rounded-sm shadow-xs cursor-pointer"
								>
									{copiedMarkdown ? (
										<Check className="w-3.5 h-3.5 text-emerald-400" />
									) : (
										<Copy className="w-3.5 h-3.5" />
									)}
									<span>
										{copiedMarkdown
											? "Copied PR Markdown!"
											: "Copy PR Markdown"}
									</span>
								</button>

								<div className="flex items-center gap-2">
									<a
										href={`/api/og/${activeReceipt.receipt.id}`}
										target="_blank"
										rel="noreferrer"
										className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 border border-foreground/15 text-foreground/80 hover:text-foreground hover:bg-foreground/5 text-xs font-mono transition-colors rounded-sm text-center"
									>
										<Share2 className="w-3 h-3 text-primary" />
										<span>Dynamic OG</span>
										<ExternalLink className="w-2.5 h-2.5 opacity-50" />
									</a>

									<button
										type="button"
										onClick={() => setShowJson((prev) => !prev)}
										className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 border border-foreground/15 text-foreground/80 hover:text-foreground hover:bg-foreground/5 text-xs font-mono transition-colors rounded-sm text-center cursor-pointer"
									>
										<Code2 className="w-3 h-3" />
										<span>{showJson ? "Hide JSON" : "Raw JSON"}</span>
									</button>
								</div>
							</div>
						</div>
					</aside>

					{/* =========================================================================
					    RIGHT SIDE: 3 Side-by-Side Thermal Receipts & Active Inspector
					    ========================================================================= */}
					<div className="relative w-full lg:w-[70%] overflow-x-hidden no-scrollbar flex flex-col min-h-dvh">
						<div className="px-4 sm:px-6 lg:px-8 pt-6 lg:pt-20 pb-16 space-y-8 flex-1">
							{/* Mobile Header (Shown on small screens, matching /brand & /enterprise) */}
							<div className="lg:hidden relative border-b border-foreground/[0.06] overflow-hidden -mx-4 sm:-mx-6 px-4 sm:px-6 pb-6 mb-6">
								<HalftoneBackground />
								<div className="relative space-y-2 pt-4">
									<div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
										<ShieldCheck className="w-3 h-3" />
										<span>Cryptographic Telemetry</span>
									</div>
									<h1 className="text-2xl sm:text-3xl text-neutral-800 dark:text-neutral-200 tracking-tight leading-tight">
										<span className="underline underline-offset-4 decoration-foreground/40 font-serif">
											Digital Receipts
										</span>
									</h1>
									<p className="text-xs sm:text-sm text-foreground/70 dark:text-foreground/50 leading-relaxed">
										Verifiable Git mutation proof for the AI coding agent era.
									</p>
								</div>
							</div>

							{/* THE 3 SIDE-BY-SIDE THERMAL RECEIPTS */}
							<div className="pt-2">
								<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start justify-center">
									{showcaseList.map((item) => {
										const isSelected =
											activeReceipt.receipt.id === item.receiptId;
										return (
											<div
												key={item.id}
												className={cn(
													"flex flex-col items-center transition-all duration-200 rounded-lg p-2 sm:p-2.5",
													isSelected
														? "ring-2 ring-primary/40 bg-primary/[0.02] shadow-xs"
														: "opacity-85 hover:opacity-100",
												)}
											>
												{/* Top Agent Header Bar */}
												<div className="w-full max-w-[380px] flex items-center justify-between pb-2.5 px-1">
													<div className="flex items-center gap-1.5 min-w-0">
														<span
															className={cn(
																"text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border shrink-0",
																item.pillColor,
															)}
														>
															{item.agentName}
														</span>
														<span className="text-[10px] font-mono text-foreground/50 truncate max-w-[120px]">
															{item.modelName}
														</span>
													</div>

													<button
														type="button"
														onClick={() => setActiveReceipt(item.receipt)}
														className={cn(
															"text-[11px] font-mono underline hover:text-primary transition-colors cursor-pointer shrink-0 ml-1",
															isSelected
																? "text-primary font-medium"
																: "text-foreground/50",
														)}
													>
														{isSelected ? "Active" : "Inspect"}
													</button>
												</div>

												{/* The Thermal Receipt Component */}
												<ThermalReceipt
													receipt={item.receipt}
													showActions={false}
												/>

												{/* Quick Card Action Footer */}
												<div className="w-full max-w-[380px] flex items-center justify-between gap-2 pt-2.5 px-1 text-xs font-mono">
													<button
														type="button"
														onClick={() => {
															setActiveReceipt(item.receipt);
															navigator.clipboard.writeText(
																`[✓] Qodewk Receipt: ${item.receipt.repository.projectAlias} (${item.receipt.mutation.files} files, est. ~$${item.receipt.ai.cost.toFixed(2)})\nhttps://qodewk.dev/r/${item.receipt.receipt.id}`,
															);
														}}
														className="flex-1 py-1.5 px-2 border border-foreground/15 hover:bg-foreground/5 rounded text-foreground/80 hover:text-foreground text-center transition-all cursor-pointer"
													>
														Copy Link
													</button>

													<a
														href={`/api/og/${item.receipt.receipt.id}`}
														target="_blank"
														rel="noreferrer"
														className="py-1.5 px-3 border border-foreground/15 hover:bg-foreground/5 rounded text-foreground/80 hover:text-foreground transition-all flex items-center gap-1"
													>
														<Share2 className="w-3 h-3 text-primary" />
														OG
													</a>
												</div>
											</div>
										);
									})}
								</div>
							</div>

							{/* ACTIVE RECEIPT DETAILED INSPECTOR */}
							<motion.div
								key={activeReceipt.receipt.id}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3 }}
								className="border border-foreground/10 rounded-sm bg-background p-5 sm:p-7 space-y-6 shadow-xs"
							>
								{/* Inspector Header */}
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/10 pb-5">
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<Cpu className="w-4 h-4 text-primary" />
											<h3 className="text-sm sm:text-base font-mono uppercase tracking-wider text-foreground font-medium">
												Active Receipt Inspector
											</h3>
											<span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
												{activeReceipt.repository.projectAlias}
											</span>
										</div>
										<p className="text-xs text-foreground/60 leading-relaxed">
											Detailed cryptographic telemetry, Git commit mutations, and
											language distribution for revision{" "}
											<span className="font-mono text-foreground font-medium">
												{activeReceipt.repository.headSha.slice(0, 7)}
											</span>
											.
										</p>
									</div>

									{/* Action Buttons */}
									<div className="flex flex-wrap items-center gap-2">
										<a
											href={`/api/og/${activeReceipt.receipt.id}`}
											target="_blank"
											rel="noreferrer"
											className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-foreground/15 rounded hover:bg-foreground/5 transition-all text-foreground/80"
										>
											<Share2 className="w-3.5 h-3.5 text-primary" />
											<span>OG Card</span>
											<ExternalLink className="w-3 h-3 opacity-50" />
										</a>

										<button
											type="button"
											onClick={() => setShowJson((prev) => !prev)}
											className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-foreground/15 rounded hover:bg-foreground/5 transition-all text-foreground/80 cursor-pointer"
										>
											<Code2 className="w-3.5 h-3.5" />
											<span>{showJson ? "Hide JSON" : "Raw JSON"}</span>
											{showJson ? (
												<ChevronUp className="w-3.5 h-3.5 opacity-50" />
											) : (
												<ChevronDown className="w-3.5 h-3.5 opacity-50" />
											)}
										</button>
									</div>
								</div>

								{/* 4 Stat Metric Cards */}
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
									<div className="p-3.5 rounded-sm bg-foreground/[0.02] border border-foreground/[0.06] space-y-1">
										<span className="text-[10px] uppercase text-foreground/50 block">
											Files Touched
										</span>
										<span className="text-xl sm:text-2xl font-medium text-foreground tabular-nums">
											{activeReceipt.mutation.files}
										</span>
									</div>

									<div className="p-3.5 rounded-sm bg-foreground/[0.02] border border-foreground/[0.06] space-y-1">
										<span className="text-[10px] uppercase text-foreground/50 block">
											Lines Inserted
										</span>
										<span className="text-xl sm:text-2xl font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
											+{activeReceipt.mutation.insertions}
										</span>
									</div>

									<div className="p-3.5 rounded-sm bg-foreground/[0.02] border border-foreground/[0.06] space-y-1">
										<span className="text-[10px] uppercase text-foreground/50 block">
											Lines Deleted
										</span>
										<span className="text-xl sm:text-2xl font-medium text-rose-600 dark:text-rose-400 tabular-nums">
											-{activeReceipt.mutation.deletions}
										</span>
									</div>

									<div className="p-3.5 rounded-sm bg-foreground/[0.02] border border-foreground/[0.06] space-y-1">
										<span className="text-[10px] uppercase text-foreground/50 block">
											Net Delta
										</span>
										<span className="text-xl sm:text-2xl font-medium text-teal-600 dark:text-teal-400 tabular-nums">
											{activeReceipt.mutation.netLines >= 0 ? "+" : ""}
											{activeReceipt.mutation.netLines}
										</span>
									</div>
								</div>

								{/* Languages & AI Breakdown Row */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* Language Breakdown */}
									<div className="p-4 rounded-sm bg-foreground/[0.02] border border-foreground/[0.06] space-y-2.5">
										<span className="text-xs font-mono uppercase tracking-wider text-foreground/70 block">
											Language Composition
										</span>
										{activeReceipt.mutation.languages && (
											<div className="flex flex-wrap gap-2">
												{Object.entries(activeReceipt.mutation.languages).map(
													([lang, pct]) => (
														<span
															key={lang}
															className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-background border border-foreground/10 text-xs font-mono"
														>
															<span className="font-medium text-foreground">
																{lang}
															</span>
															<span className="text-foreground/50">{pct}%</span>
														</span>
													),
												)}
											</div>
										)}
									</div>

									{/* AI Agent Telemetry Breakdown */}
									<div className="p-4 rounded-sm bg-foreground/[0.02] border border-foreground/[0.06] space-y-2.5 font-mono text-xs">
										<span className="text-xs uppercase tracking-wider text-foreground/70 block">
											Agent Attribution Breakdown
										</span>
										<div className="space-y-1.5 text-foreground/80">
											<div className="flex justify-between">
												<span className="text-foreground/50">Provider:</span>
												<span className="font-medium capitalize text-foreground">
													{activeReceipt.ai.provider}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-foreground/50">Model:</span>
												<span className="text-foreground">
													{activeReceipt.ai.model || "Frontier Model"}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-foreground/50">
													Expenditure:
												</span>
												<span className="text-primary font-medium">
													{formattedCost}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-foreground/50">Confidence:</span>
												<span className="text-foreground">
													{confidencePercent}
												</span>
											</div>
										</div>
									</div>
								</div>

								{/* Cryptographic Attestation Hashes */}
								<div className="p-4 rounded-sm bg-foreground/[0.02] border border-foreground/[0.06] space-y-3 font-mono text-xs">
									<div className="flex items-center justify-between">
										<span className="text-xs uppercase tracking-wider text-foreground/70 flex items-center gap-2">
											<Lock className="w-3.5 h-3.5 text-primary" />
											Salted Cryptographic Attestation
										</span>
										<span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
											HMAC-SHA256 Signed
										</span>
									</div>

									<div className="space-y-2">
										{/* Content Hash */}
										<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded bg-background border border-foreground/8">
											<span className="text-foreground/50 text-[11px]">
												Content Hash:
											</span>
											<div className="flex items-center gap-2">
												<span className="text-foreground/80 break-all select-all text-[11px]">
													{activeReceipt.receipt.contentHash}
												</span>
												<button
													type="button"
													onClick={copyHash}
													aria-label="Copy content hash"
													className="shrink-0 p-1 hover:bg-foreground/10 rounded text-foreground/60 transition-colors cursor-pointer"
												>
													{copiedHash ? (
														<Check className="w-3.5 h-3.5 text-emerald-500" />
													) : (
														<Copy className="w-3.5 h-3.5" />
													)}
												</button>
											</div>
										</div>

										{/* Git Commit SHA */}
										<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded bg-background border border-foreground/8">
											<span className="text-foreground/50 text-[11px]">
												Commit SHA:
											</span>
											<div className="flex items-center gap-2">
												<span className="text-foreground/80 break-all select-all text-[11px]">
													{activeReceipt.repository.headSha}
												</span>
												<button
													type="button"
													onClick={copySha}
													aria-label="Copy commit SHA"
													className="shrink-0 p-1 hover:bg-foreground/10 rounded text-foreground/60 transition-colors cursor-pointer"
												>
													{copiedSha ? (
														<Check className="w-3.5 h-3.5 text-emerald-500" />
													) : (
														<Copy className="w-3.5 h-3.5" />
													)}
												</button>
											</div>
										</div>
									</div>
								</div>

								{/* Collapsible Raw JSON Viewer */}
								<AnimatePresence>
									{showJson && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											exit={{ opacity: 0, height: 0 }}
											transition={{ duration: 0.3 }}
											className="border border-foreground/10 rounded-sm bg-background p-4 sm:p-5 space-y-3 overflow-hidden"
										>
											<div className="flex items-center justify-between">
												<span className="text-xs font-mono uppercase tracking-wider text-foreground font-medium flex items-center gap-2">
													<Code2 className="w-4 h-4 text-primary" />
													Canonical ReceiptV1 JSON ({activeReceipt.receipt.id})
												</span>
												<button
													type="button"
													onClick={copyJsonPayload}
													className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 border border-foreground/15 rounded hover:bg-foreground/5 transition-all text-foreground/80 cursor-pointer"
												>
													{copiedJson ? (
														<>
															<Check className="w-3 h-3 text-emerald-500" />
															<span>Copied</span>
														</>
													) : (
														<>
															<Copy className="w-3 h-3" />
															<span>Copy JSON</span>
														</>
													)}
												</button>
											</div>

											<div className="p-4 rounded-sm bg-foreground/[0.03] border border-foreground/[0.08] font-mono text-[11px] leading-relaxed overflow-x-auto text-foreground/85 max-h-96">
												<pre>
													<code>
														{JSON.stringify(activeReceipt, null, 2)}
													</code>
												</pre>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						</div>

						{/* Global Site Footer */}
						<Footer />
					</div>
				</div>
			</div>
		</div>
	);
}
