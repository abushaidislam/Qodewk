"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import type { ContributorInfo } from "@/lib/community-stats";
import { cn } from "@/lib/utils";
import { Icons } from "../icons";
import {
	DatabaseSection,
	IntegrationsSection,
	PluginEcosystem,
	ServerClientTabs,
	SocialProvidersSection,
} from "./framework-sections";
import { TrustedBy } from "./trusted-by";

const mcpCommands = [
	{ name: "Cursor", command: "npx qodewk record-event --cursor" },
	{ name: "Claude Code", command: "npx qodewk record-event --claude" },
	{ name: "Open Code", command: "npx qodewk record-event --opencode" },
	{ name: "Manual", command: "npx qodewk share" },
];

const aiPromptText = `Set up Qodewk in my project to track AI coding agent telemetry and generate digital receipts.

1. Install Qodewk CLI and hook into your local Git repository:
   npx qodewk hook install

2. Verify attribution and telemetry extraction:
   npx qodewk --dry-run

3. Generate a local terminal thermal receipt:
   npx qodewk

4. Publish a privacy-preserving receipt (zero code exfiltration):
   npx qodewk share

Refer to qodewk.dev/docs for rate cards, configuration, and CI workflows.`;

function CredentialFields() {
	const sourceText = "source: local-only";
	const egressText = "diff: 0-bytes-egress";
	const [sourceDisplay, setSourceDisplay] = useState(sourceText);
	const [egressDisplay, setEgressDisplay] = useState(egressText);
	const [isTyping, setIsTyping] = useState(false);
	const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
	const isTypingRef = useRef(false);

	const startTyping = useCallback(() => {
		if (isTypingRef.current) return;
		isTypingRef.current = true;
		setIsTyping(true);

		// Clear previous timeouts
		for (const t of timeoutsRef.current) clearTimeout(t);
		timeoutsRef.current = [];

		// Reset to empty
		setSourceDisplay("");
		setEgressDisplay("");

		// Type source text character by character
		for (let i = 0; i <= sourceText.length; i++) {
			const t = setTimeout(() => {
				setSourceDisplay(sourceText.slice(0, i));
			}, i * 50);
			timeoutsRef.current.push(t);
		}

		// Type egress text after source finishes
		const egressStart = (sourceText.length + 2) * 50;
		for (let i = 0; i <= egressText.length; i++) {
			const t = setTimeout(
				() => {
					setEgressDisplay(egressText.slice(0, i));
					if (i === egressText.length) {
						isTypingRef.current = false;
						setIsTyping(false);
					}
				},
				egressStart + i * 40,
			);
			timeoutsRef.current.push(t);
		}
	}, []);

	useEffect(() => {
		return () => {
			for (const t of timeoutsRef.current) clearTimeout(t);
		};
	}, []);

	return (
		<div className="mt-3 flex items-center gap-1.5" onMouseEnter={startTyping}>
			<div className="flex items-center h-5 px-2 border border-foreground/[0.08] bg-foreground/[0.02] flex-1 min-w-0">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="9"
					height="9"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="text-[#5db8a6] shrink-0 mr-1.5"
				>
					<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
					<path d="M7 11V7a5 5 0 0 1 10 0v4" />
				</svg>
				<span className="text-[9px] font-mono text-foreground/60 dark:text-foreground/45 truncate">
					{sourceDisplay}
					{isTyping && sourceDisplay.length < sourceText.length && (
						<span className="inline-block w-px h-2.5 bg-foreground/50 ml-px animate-[blink_0.8s_step-end_infinite] align-middle" />
					)}
				</span>
			</div>
			<div className="flex items-center h-5 px-2 border border-foreground/[0.08] bg-foreground/[0.02] flex-1 min-w-0">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="9"
					height="9"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="text-[#cc785c] shrink-0 mr-1.5"
				>
					<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
				</svg>
				<span className="text-[9px] font-mono text-foreground/60 dark:text-foreground/45 truncate">
					{egressDisplay}
					{isTyping &&
						sourceDisplay.length >= sourceText.length &&
						egressDisplay.length < egressText.length && (
							<span className="inline-block w-px h-2.5 bg-foreground/50 ml-px animate-[blink_0.8s_step-end_infinite] align-middle" />
						)}
				</span>
			</div>
		</div>
	);
}

function InstallBlock() {
	const [mode, setMode] = useState<"cli" | "prompt" | "mcp" | "skills">("cli");
	const [copied, setCopied] = useState(false);
	const [pmOpen, setPmOpen] = useState(false);
	const [promptOpen, setPromptOpen] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);
	const [contentHeight, setContentHeight] = useState<number | "auto">("auto");
	const [overflow, setOverflow] = useState<"hidden" | "visible">("visible");

	useEffect(() => {
		const el = contentRef.current;
		if (!el) return;
		const ro = new ResizeObserver(() => {
			setContentHeight(el.offsetHeight);
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	useLayoutEffect(() => {
		setOverflow("hidden");
	}, [mode]);

	useLayoutEffect(() => {
		if (pmOpen) {
			setOverflow("visible");
		}
	}, [pmOpen]);

	const copy = (text: string) => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setPmOpen(false);
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<div className="mb-6 rounded-md border border-foreground/[0.1] relative">
			{/* Tabs */}
			<div className="flex items-center border-b border-foreground/[0.1]">
				<button
					onClick={() => {
						setMode("cli");
						setCopied(false);
						setPmOpen(false);
					}}
					className={cn(
						"px-4 py-2 text-[12px] transition-colors duration-150 relative",
						mode === "cli"
							? "text-neutral-800 dark:text-neutral-200"
							: "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-400",
					)}
				>
					CLI
					{mode === "cli" && (
						<div className="absolute bottom-0 left-4 right-4 h-[1.5px] bg-neutral-600 dark:bg-neutral-400" />
					)}
				</button>
				<button
					onClick={() => {
						setMode("prompt");
						setCopied(false);
						setPmOpen(false);
					}}
					className={cn(
						"px-4 py-2 text-[12px] transition-colors duration-150 relative",
						mode === "prompt"
							? "text-neutral-800 dark:text-neutral-200"
							: "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-400",
					)}
				>
					Prompt
					{mode === "prompt" && (
						<div className="absolute bottom-0 left-4 right-4 h-[1.5px] bg-neutral-600 dark:bg-neutral-400" />
					)}
				</button>
				<button
					onClick={() => {
						setMode("mcp");
						setCopied(false);
						setPmOpen(false);
					}}
					className={cn(
						"px-4 py-2 text-[12px] transition-colors duration-150 relative",
						mode === "mcp"
							? "text-neutral-800 dark:text-neutral-200"
							: "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-400",
					)}
				>
					MCP
					{mode === "mcp" && (
						<div className="absolute bottom-0 left-4 right-4 h-[1.5px] bg-neutral-600 dark:bg-neutral-400" />
					)}
				</button>
				<button
					onClick={() => {
						setMode("skills");
						setCopied(false);
						setPmOpen(false);
					}}
					className={cn(
						"px-4 py-2 text-[12px] transition-colors duration-150 relative",
						mode === "skills"
							? "text-neutral-800 dark:text-neutral-200"
							: "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-400",
					)}
				>
					Skills
					{mode === "skills" && (
						<div className="absolute bottom-0 left-4 right-4 h-[1.5px] bg-neutral-600 dark:bg-neutral-400" />
					)}
				</button>
			</div>

			{/* Content */}
			<motion.div
				animate={{ height: contentHeight }}
				initial={false}
				transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
				onAnimationComplete={() => setOverflow("visible")}
				style={{ overflow }}
			>
				<div ref={contentRef}>
					<AnimatePresence mode="wait" initial={false}>
						<div>
							{mode === "cli" || mode === "skills" ? (
								<div className="flex items-center justify-between bg-neutral-100/50 dark:bg-[#050505] px-4 py-3">
									<code
										className="text-[13px]"
										style={{ fontFamily: "var(--font-geist-pixel-square)" }}
									>
										{mode === "skills" ? (
											<>
												<span className="text-purple-600/90 dark:text-purple-400/90">
													npx
												</span>{" "}
												<span className="text-neutral-700 dark:text-neutral-300">
													skills add qodewk
												</span>
											</>
										) : (
											<>
												<span className="text-purple-600/90 dark:text-purple-400/90">
													npx
												</span>{" "}
												<span className="text-neutral-700 dark:text-neutral-300">
													qodewk
												</span>
											</>
										)}
									</code>
									<div className="relative">
										{mode === "skills" ? (
											<button
												onClick={() =>
													copy("npx skills add qodewk")
												}
												className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors p-1"
												aria-label="Copy command"
											>
												{copied ? (
													<svg
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 24 24"
														className="h-4 w-4"
													>
														<path
															fill="currentColor"
															d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z"
														/>
													</svg>
												) : (
													<svg
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 24 24"
														className="h-4 w-4"
													>
														<path
															fill="currentColor"
															d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"
														/>
													</svg>
												)}
											</button>
										) : (
											<button
												onClick={() => copy("npx qodewk")}
												className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors p-1"
												aria-label="Copy command"
											>
												{copied ? (
													<svg
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 24 24"
														className="h-4 w-4"
													>
														<path
															fill="currentColor"
															d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z"
														/>
													</svg>
												) : (
													<svg
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 24 24"
														className="h-4 w-4"
													>
														<path
															fill="currentColor"
															d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"
														/>
													</svg>
												)}
											</button>
										)}
									</div>
								</div>
							) : mode === "mcp" ? (
								<div className="flex items-center justify-between bg-neutral-100/50 dark:bg-[#050505] px-4 py-3">
									<code
										className="text-[13px] truncate"
										style={{ fontFamily: "var(--font-geist-pixel-square)" }}
									>
										<span className="text-purple-600/90 dark:text-purple-400/90">
											npx
										</span>{" "}
										<span className="text-neutral-700 dark:text-neutral-300">
											qodewk mcp
										</span>
									</code>
									<div className="relative">
										<button
											onClick={() => {
												if (copied) return;
												setPmOpen(!pmOpen);
											}}
											className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors p-1"
											aria-label="Add MCP"
										>
											{copied ? (
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													className="h-4 w-4"
												>
													<path
														fill="currentColor"
														d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z"
													/>
												</svg>
											) : (
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													className="h-4 w-4"
												>
													<path
														fill="currentColor"
														d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"
													/>
												</svg>
											)}
										</button>
										{pmOpen && (
											<>
												<div
													className="fixed inset-0 z-40"
													role="button"
													tabIndex={-1}
													aria-label="Close dropdown"
													onClick={() => setPmOpen(false)}
													onKeyDown={(e) => {
														if (e.key === "Escape") setPmOpen(false);
													}}
												/>
												<div className="absolute right-0 top-full mt-2 w-[160px] bg-white dark:bg-[#050505] border border-neutral-200 dark:border-white/[0.07] shadow-2xl shadow-black/10 dark:shadow-black/80 z-50 rounded-sm">
													{mcpCommands.map((mc, i) => (
														<button
															key={mc.name}
															onClick={() => copy(mc.command)}
															className={cn(
																"flex items-center gap-2.5 w-full px-3 py-2 text-[12px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-all text-left",
																i < mcpCommands.length - 1 &&
																	"border-b border-neutral-100 dark:border-white/[0.06]",
															)}
														>
															<span className="flex items-center justify-center w-3.5 h-3.5 shrink-0">
																{mc.name === "Cursor" && (
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		className="h-3.5 w-3.5"
																		viewBox="0 0 24 24"
																	>
																		<path
																			fill="currentColor"
																			d="M11.503.131L1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23"
																		/>
																	</svg>
																)}
																{mc.name === "Claude Code" && (
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		className="h-3.5 w-3.5"
																		viewBox="0 0 16 16"
																	>
																		<path
																			fill="currentColor"
																			d="m6.96 15.2l.224-.992l.256-1.28l.208-1.024l.192-1.264l.112-.416l-.016-.032l-.08.016l-.96 1.312l-1.456 1.968l-1.152 1.216l-.272.112l-.48-.24l.048-.448l.272-.384l1.584-2.032l.96-1.264l.624-.72l-.016-.096h-.032l-4.224 2.752L2 12.48l-.336-.304l.048-.496l.16-.16l1.264-.88l3.152-1.76l.048-.16l-.048-.08h-.16L5.6 8.608L3.808 8.56l-1.552-.064l-1.52-.08l-.384-.08L0 7.856l.032-.24l.32-.208l.464.032l1.008.08l1.52.096l1.104.064l1.632.176h.256l.032-.112l-.08-.064l-.064-.064L4.64 6.56L2.944 5.44l-.896-.656l-.48-.336l-.24-.304l-.096-.672l.432-.48l.592.048l.144.032l.592.464l1.264.976L5.92 5.744l.24.192l.112-.064v-.048l-.112-.176l-.896-1.632l-.96-1.664l-.432-.688l-.112-.416a1.7 1.7 0 0 1-.064-.48l.496-.672L4.464 0l.672.096l.272.24l.416.944l.656 1.488l1.04 2.016l.304.608l.16.544l.064.176h.112v-.096l.08-1.152l.16-1.392l.16-1.792l.048-.512l.256-.608l.496-.32l.384.176l.32.464l-.048.288L9.84 2.4l-.384 1.936l-.24 1.312h.144l.16-.176l.656-.864l1.104-1.376l.48-.544l.576-.608l.368-.288h.688l.496.752l-.224.784l-.704.896l-.592.752l-.848 1.136l-.512.912l.048.064h.112l1.904-.416l1.04-.176l1.216-.208l.56.256l.064.256l-.224.544l-1.312.32l-1.536.304l-2.288.544l-.032.016l.032.048l1.024.096l.448.032h1.088l2.016.144l.528.352l.304.416l-.048.336l-.816.4l-1.088-.256l-2.56-.608l-.864-.208h-.128v.064l.736.72l1.328 1.2l1.68 1.552l.08.384l-.208.32l-.224-.032l-1.472-1.12l-.576-.496l-1.28-1.072h-.08v.112l.288.432l1.568 2.352l.08.72l-.112.224l-.416.144l-.432-.08l-.928-1.28l-.944-1.456l-.768-1.296l-.08.064l-.464 4.832l-.208.24l-.48.192l-.4-.304z"
																		/>
																	</svg>
																)}
																{mc.name === "Open Code" && (
																	<svg
																		className="h-3.5 w-3.5"
																		viewBox="0 0 32 40"
																		fill="none"
																		xmlns="http://www.w3.org/2000/svg"
																	>
																		<g clipPath="url(#oc)">
																			<path
																				d="M24 32H8V16H24V32Z"
																				fill="currentColor"
																				opacity="0.5"
																			/>
																			<path
																				d="M24 8H8V32H24V8ZM32 40H0V0H32V40Z"
																				fill="currentColor"
																			/>
																		</g>
																		<defs>
																			<clipPath id="oc">
																				<rect
																					width="32"
																					height="40"
																					fill="white"
																				/>
																			</clipPath>
																		</defs>
																	</svg>
																)}
																{mc.name === "Manual" && (
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		className="h-3.5 w-3.5"
																		viewBox="0 0 24 24"
																	>
																		<path
																			fill="none"
																			stroke="currentColor"
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth="2"
																			d="M12 19h8M4 17l6-6l-6-6"
																		/>
																	</svg>
																)}
															</span>
															<span className="font-mono text-[11px]">
																{mc.name}
															</span>
														</button>
													))}
												</div>
											</>
										)}
									</div>
								</div>
							) : (
								<div className="bg-neutral-100/50 dark:bg-[#050505] px-5 py-4">
									<p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 leading-relaxed">
										Set up git telemetry and receipt generation using Qodewk.
									</p>
									<div className="relative mt-1.5">
										<p className="text-[11px] text-neutral-400 dark:text-neutral-500 leading-relaxed line-clamp-2">
											Install Qodewk CLI. Hook into Git repo with{" "}
											<code className="text-neutral-500 dark:text-neutral-400">
												qodewk hook install
											</code>
											, harvest AI agent footprints, compute dual-engine costs,
											and generate cryptographic thermal receipts...
										</p>
										<div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-neutral-100/50 dark:from-[#050505] to-transparent pointer-events-none" />
									</div>
									<div className="flex items-center justify-between mt-3 pt-2 border-t border-foreground/[0.04]">
										<button
											onClick={() => setPromptOpen(true)}
											className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												className="h-3 w-3"
											>
												<path
													fill="currentColor"
													d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3"
												/>
											</svg>
											View full prompt
										</button>
										<button
											onClick={() => copy(aiPromptText)}
											className="flex items-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
										>
											{copied ? (
												<>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 24 24"
														className="h-3.5 w-3.5"
													>
														<path
															fill="currentColor"
															d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z"
														/>
													</svg>
													Copied
												</>
											) : (
												<>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 24 24"
														className="h-3.5 w-3.5"
													>
														<path
															fill="currentColor"
															d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"
														/>
													</svg>
													Copy prompt
												</>
											)}
										</button>
									</div>
								</div>
							)}
						</div>
					</AnimatePresence>
				</div>
			</motion.div>

			{/* Prompt dialog */}
			<AnimatePresence>
				{promptOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 lg:left-[40%] z-50 flex items-center justify-center"
						onClick={() => setPromptOpen(false)}
					>
						{/* Backdrop - only covers right/content side */}
						<div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />

						{/* Dialog */}
						<motion.div
							initial={{ opacity: 0, y: 8, scale: 0.98 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 8, scale: 0.98 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
							onClick={(e) => e.stopPropagation()}
							className="relative w-[calc(100%-2rem)] max-w-lg mx-4 bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/[0.06] rounded-sm shadow-2xl"
						>
							{/* Close */}
							<button
								onClick={() => setPromptOpen(false)}
								className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors z-10"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									className="h-4 w-4"
								>
									<path
										fill="currentColor"
										d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
									/>
								</svg>
							</button>

							{/* Content */}
							<div className="px-5 py-5 max-h-[60vh] overflow-y-auto">
								<p className="text-[12px] font-mono text-neutral-600 dark:text-neutral-400 leading-[1.9] whitespace-pre-line">
									{aiPromptText}
								</p>
							</div>

							{/* Footer */}
							<div className="flex justify-end px-5 py-3 border-t border-neutral-200 dark:border-white/[0.06]">
								<button
									onClick={() => copy(aiPromptText)}
									className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-sm border border-neutral-200 dark:border-white/[0.08] text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/[0.04] transition-colors"
								>
									{copied ? (
										<>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												className="h-3.5 w-3.5"
											>
												<path
													fill="currentColor"
													d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z"
												/>
											</svg>
											Copied
										</>
									) : (
										<>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												className="h-3.5 w-3.5"
											>
												<path
													fill="currentColor"
													d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"
												/>
											</svg>
											Copy prompt
										</>
									)}
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

const EMPTY_CONTRIBUTORS: ContributorInfo[] = [];

type CommunityHeroStats = {
	npmDownloads: number;
	npmWeeklyHistory: number[];
	githubStars: number;
	contributors: number;
};

/**
 * Below-the-fold media (contributor avatars, the demo video) never competes
 * with the initial load. Once the page has loaded, a fast connection fetches
 * it right away so it's ready before anyone scrolls to it; slow or
 * data-saver connections wait until it's close to the viewport.
 */
function useBelowFoldMedia() {
	const [state, setState] = useState({ loaded: false, prefetch: false });

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout> | undefined;
		const onLoad = () => {
			const prefetch = !isSlowConnection();
			// Give the browser a beat after `load` before starting any fetches.
			timer = setTimeout(() => setState({ loaded: true, prefetch }), 300);
		};
		if (document.readyState === "complete") onLoad();
		else window.addEventListener("load", onLoad, { once: true });
		return () => {
			window.removeEventListener("load", onLoad);
			clearTimeout(timer);
		};
	}, []);

	return state;
}

function isSlowConnection() {
	// Chromium only; Safari and Firefox don't expose the Network Information API.
	const connection = (
		navigator as Navigator & {
			connection?: { saveData?: boolean; effectiveType?: string };
		}
	).connection;
	if (connection?.saveData) return true;
	if (connection?.effectiveType) {
		return /^(slow-2g|2g|3g)$/.test(connection.effectiveType);
	}
	// Everywhere else, judge by how long this page took to load.
	const [navigation] = performance.getEntriesByType(
		"navigation",
	) as PerformanceNavigationTiming[];
	return (navigation?.loadEventStart || performance.now()) > 4000;
}

function ContributorsSection({
	contributors = EMPTY_CONTRIBUTORS,
	contributorCount,
}: {
	contributors: ContributorInfo[];
	contributorCount: number;
}) {
	const wallRef = useRef<HTMLDivElement>(null);
	const [wallNearViewport, setWallNearViewport] = useState(false);
	const { loaded, prefetch } = useBelowFoldMedia();
	const showAvatars = prefetch || (loaded && wallNearViewport);

	// Hundreds of avatars scroll through the wall; the links always render,
	// but the avatar images are only mounted after the page has loaded: right
	// away on fast connections, or once the wall is about a screen away on
	// slow ones.
	useEffect(() => {
		const wall = wallRef.current;
		if (!wall) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setWallNearViewport(true);
					observer.disconnect();
				}
			},
			// About a screen ahead; the images themselves stay `loading="lazy"`.
			{ rootMargin: "100% 0px" },
		);
		observer.observe(wall);
		return () => observer.disconnect();
	}, []);

	if (contributors.length === 0) return null;

	const colCount = 18;
	const columns = Array.from({ length: colCount }, (_, i) => {
		const perCol = Math.ceil(contributors.length / colCount);
		return contributors.slice(i * perCol, (i + 1) * perCol);
	});

	const speeds = [
		160, 190, 140, 176, 150, 184, 164, 144, 180, 156, 170, 136, 186, 152, 174,
		146, 182, 158,
	];

	return (
		<div className="mt-10 pt-8">
			<div className="flex items-center gap-4 mb-2">
				<span className="text-lg font-medium text-foreground/90 dark:text-foreground/80 tracking-tight shrink-0">
					Contributors
				</span>
				<div className="flex-1 border-t border-foreground/10" />
			</div>
			<p className="text-[13px] text-foreground/50 dark:text-foreground/40 mb-5 leading-relaxed">
				Built by a community of{" "}
				<span className="text-foreground/70 dark:text-foreground/60 font-medium tabular-nums">
					{contributorCount}+
				</span>{" "}
				contributors.
			</p>

			{contributors.length > 0 && (
				<div
					ref={wallRef}
					className="relative overflow-hidden h-[220px] rounded-md"
					style={{
						perspective: "600px",
						maskImage:
							"linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
						WebkitMaskImage:
							"linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
					}}
				>
					<div
						className="absolute inset-0 pointer-events-none"
						style={{
							backgroundImage:
								"radial-gradient(circle, currentColor 0.5px, transparent 0.5px)",
							backgroundSize: "12px 12px",
							opacity: 0.04,
						}}
					/>
					<div
						className="grid h-full relative"
						style={{
							gridTemplateColumns: `repeat(${colCount}, 1fr)`,
							transform: "rotateX(18deg)",
							transformOrigin: "center center",
						}}
					>
						{columns.map((col, i) => (
							<div key={i} className="relative overflow-hidden h-full">
								<div
									className="flex flex-col gap-1 items-center"
									style={{
										animation: `vertical-marquee ${speeds[i]}s linear infinite`,
									}}
								>
									{[...col, ...col].map((c, j) => (
										<a
											key={`${c.login}-${j}`}
											href={c.html_url}
											target="_blank"
											rel="noopener noreferrer"
											title={c.login}
											aria-label={c.login}
											className="relative group shrink-0"
										>
											{showAvatars ? (
												// Eager once prefetching: Safari's native lazy-loading
												// only starts right at the viewport, so avatars would
												// still pop in one by one as the marquee scrolls. Low
												// priority keeps them behind the demo video, and the
												// tile background covers any that land a beat late.
												<img
													src={`${c.avatar_url}&s=64`}
													alt={c.login}
													width={32}
													height={32}
													loading={prefetch ? "eager" : "lazy"}
													fetchPriority="low"
													className="rounded-sm bg-foreground/10 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-200 hover:scale-125 hover:z-10 relative"
												/>
											) : (
												<span className="block size-8 rounded-sm bg-foreground/5" />
											)}
											<div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-foreground text-background text-[8px] font-mono rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
												{c.login}
											</div>
										</a>
									))}
								</div>
							</div>
						))}
					</div>
					<div className="absolute inset-y-0 left-0 w-8 bg-linear-to-r from-background to-transparent pointer-events-none z-10" />
					<div className="absolute inset-y-0 right-0 w-8 bg-linear-to-l from-background to-transparent pointer-events-none z-10" />
				</div>
			)}
		</div>
	);
}

function formatCount(num: number | null | undefined): string {
	if (num == null) return "—";
	if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
	if (num >= 1_000) return `${(num / 1_000).toFixed(num >= 10_000 ? 0 : 1)}k`;
	return num.toString();
}

function _NpmSparkline({ data: raw }: { data: number[] }) {
	// Drop the last bucket — it's the incomplete current week
	const data = raw.length > 2 ? raw.slice(0, -1) : raw;
	const w = 120;
	const h = 32;
	const pad = 1;
	const max = Math.max(...data);
	const min = Math.min(...data);
	const range = max - min || 1;
	const points = data.map((v, i) => {
		const x = pad + (i / (data.length - 1)) * (w - pad * 2);
		const y = h - pad - ((v - min) / range) * (h - pad * 2);
		return `${x},${y}`;
	});
	const line = points.join(" ");
	const areaPath = `M${points[0]} ${points.map((p) => `L${p}`).join(" ")} L${w - pad},${h} L${pad},${h} Z`;

	return (
		<svg
			width={w}
			height={h}
			viewBox={`0 0 ${w} ${h}`}
			className="shrink-0 ml-auto"
		>
			<defs>
				<linearGradient id="npm-spark-fill" x1="0" y1="0" x2="0" y2="1">
					<stop
						offset="0%"
						className="[stop-color:theme(colors.emerald.500)]"
						stopOpacity="0.15"
					/>
					<stop
						offset="100%"
						className="[stop-color:theme(colors.emerald.500)]"
						stopOpacity="0"
					/>
				</linearGradient>
			</defs>
			<path d={areaPath} fill="url(#npm-spark-fill)" />
			<polyline
				points={line}
				fill="none"
				className="stroke-emerald-500/50"
				strokeWidth="1.5"
				strokeLinejoin="round"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function ReadmeFooter({ stats }: { stats: CommunityHeroStats }) {
	return (
		<div className="relative mt-10 pt-8 pb-16 overflow-hidden">
			{/* Watermark logo */}
			<div
				className="absolute -right-10 top-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.04] dark:opacity-[0.05]"
				aria-hidden="true"
			>
				<Icons.qodewkMark className="size-[280px]" />
			</div>

			{/* Dot grid */}
			<div
				className="absolute inset-0 pointer-events-none select-none"
				aria-hidden="true"
				style={{
					backgroundImage:
						"radial-gradient(circle, currentColor 0.5px, transparent 0.5px)",
					backgroundSize: "24px 24px",
					opacity: 0.03,
				}}
			/>

			{/* CTA */}
			<div className="relative space-y-6">
				<p className="text-center text-lg text-balance text-foreground/60 dark:text-foreground/50 tracking-tight">
					Generate universal git telemetry receipts with confidence in minutes.
				</p>

				<div className="flex items-center justify-center gap-2">
					{stats.npmDownloads > 0 && (
						<a
							href="https://www.npmjs.com/package/qodewk"
							target="_blank"
							rel="noopener noreferrer"
						>
							<div className="flex items-center gap-1.5 px-2.5 hover:bg-foreground/4 rounded-sm transition-colors text-foreground/50 dark:text-foreground/50">
								<Icons.npm className="size-[11px] -translate-y-px" />
								<span className="text-xs font-mono">
									{formatCount(stats.npmDownloads)} / week
								</span>
							</div>
						</a>
					)}
					{stats.githubStars > 0 && (
						<a
							href="https://github.com/qodewk/qodewk"
							target="_blank"
							rel="noopener noreferrer"
						>
							<div className="flex items-center gap-1.5 px-2.5 hover:bg-foreground/4 rounded-sm transition-colors text-foreground/50 dark:text-foreground/50">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="11"
									height="11"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="size-[11px] -translate-y-px"
								>
									<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
								</svg>
								<span className="text-xs font-mono">
									{formatCount(stats.githubStars)} stars
								</span>
							</div>
						</a>
					)}
				</div>

				<div className="flex flex-wrap items-center justify-center gap-4 pt-1">
					<Link
						href="/docs"
						className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 bg-neutral-900 text-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 text-xs sm:text-sm font-medium hover:opacity-90 transition-colors"
					>
						Get Started
					</Link>
					<Link
						href="/r/demo-cursor"
						className="relative inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 text-neutral-600 dark:text-neutral-300 text-xs sm:text-sm font-medium transition-colors group"
					>
						<span
							className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity"
							style={{
								backgroundImage: `repeating-linear-gradient(
                  -45deg,
                  transparent,
                  transparent 4px,
                  currentColor 4px,
                  currentColor 5px
                )`,
							}}
						/>
						<span className="absolute top-0 -left-[6px] -right-[6px] h-px bg-foreground/20 group-hover:bg-foreground/30 transition-colors" />
						<span className="absolute bottom-0 -left-[6px] -right-[6px] h-px bg-foreground/20 group-hover:bg-foreground/30 transition-colors" />
						<span className="absolute left-0 -top-[6px] -bottom-[6px] w-px bg-foreground/20 group-hover:bg-foreground/30 transition-colors" />
						<span className="absolute right-0 -top-[6px] -bottom-[6px] w-px bg-foreground/20 group-hover:bg-foreground/30 transition-colors" />
						<span className="absolute -bottom-[6px] -right-[6px] font-mono text-[8px] text-foreground/40 dark:text-foreground/50 leading-none select-none translate-x-1/2 translate-y-1/2">
							+
						</span>
						<span className="relative">View Receipt</span>
					</Link>
				</div>
			</div>
		</div>
	);
}

/**
 * Both theme variants are rendered so CSS picks the right one without a
 * hydration flash, but neither autoplays or preloads up front. Only the
 * visible variant is fetched, after the page has loaded: right away on fast
 * connections, or once it's about to scroll into view on slow ones.
 */
function DemoVideo() {
	const containerRef = useRef<HTMLDivElement>(null);
	const { resolvedTheme } = useTheme();
	const { loaded, prefetch } = useBelowFoldMedia();

	// On fast connections, buffer the visible variant once the page has
	// loaded so it's already playing by the time it scrolls into view.
	useEffect(() => {
		if (!prefetch || !containerRef.current) return;
		for (const video of containerRef.current.querySelectorAll("video")) {
			if (video.offsetParent === null || !video.paused) continue;
			video.preload = "auto";
			// Safari won't resume a `preload="none"` video on its own.
			if (video.readyState === 0) video.load();
		}
	}, [prefetch, resolvedTheme]);

	useEffect(() => {
		const container = containerRef.current;
		if (!loaded || !container) return;
		const videos = Array.from(container.querySelectorAll("video"));
		const observer = new IntersectionObserver(
			([entry]) => {
				for (const video of videos) {
					const visible = video.offsetParent !== null;
					if (entry.isIntersecting && visible) {
						video.play().catch(() => {});
					} else {
						video.pause();
					}
				}
			},
			// Only start playing when it's close: on slow connections that's
			// also when the (multi-MB) video starts downloading.
			{ rootMargin: "200px" },
		);
		observer.observe(container);
		return () => observer.disconnect();
	}, [loaded, resolvedTheme]);

	return (
		<div ref={containerRef}>
			{/* The poster is a CSS background rather than the `poster` attribute:
			    hidden <video>s still fetch their poster, but browsers skip
			    backgrounds on display:none elements, so only the active theme's
			    poster loads and it's there on first paint. */}
			<video
				src="/demo-dark.mp4"
				preload="none"
				loop
				muted
				playsInline
				className="w-full h-auto aspect-[2528/1440] -mt-[2px] bg-[url(/demo-dark-poster.webp)] bg-cover dark:block hidden"
			/>
			<video
				src="/demo-light.mp4"
				preload="none"
				loop
				muted
				playsInline
				className="w-full h-auto aspect-[2544/1440] -mt-[2px] bg-[url(/demo-light-poster.webp)] bg-cover dark:hidden"
			/>
		</div>
	);
}

export function HeroReadMe({
	contributors,
	stats,
}: {
	contributors: ContributorInfo[];
	stats: CommunityHeroStats;
}) {
	const [socialHovered, setSocialHovered] = useState(false);
	const [frameworkTab, setFrameworkTab] = useState<
		"declarative" | "database" | "oauth" | "integrations"
	>("declarative");

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
			className="flex flex-col w-full"
		>
			{/* Markdown content */}
			<div className="flex-1 overflow-x-hidden no-scrollbar">
				<div className="p-5 lg:px-8 lg:pt-20">
					<motion.article
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.4, delay: 0.3 }}
						className="no-scrollbar pb-0"
					>
						<h1 className="flex items-center gap-3 text-sm sm:text-[15px] font-mono text-neutral-900 dark:text-neutral-100 mb-4 sm:mb-5">
							README
							<span className="flex-1 h-px bg-foreground/15" />
						</h1>

						<p className="text-sm sm:text-[15px] text-foreground/80 mb-6 sm:mb-8 leading-relaxed">
							Telemetry that lives{" "}
							<span className="font-medium text-foreground/90 dark:text-foreground/80">
								in your git graph
							</span>
							. Zero source code exfiltration, dual-engine cost estimation, and cryptographic receipts —
							verifying code from weekend hacks to{" "}
							<span className="font-medium text-foreground/90 dark:text-foreground/80">
								autonomous multi-agent swarms
							</span>{" "}
							in production.
						</p>

						<InstallBlock />

						<div className="flex items-center gap-3 my-4">
							<div className="flex-1 border-t border-foreground/6"></div>
							<span className="text-[11px] sm:text-xs text-foreground/50 dark:text-foreground/50 font-mono tracking-wider uppercase shrink-0">
								Supported Providers & Models
							</span>
						</div>

						<TrustedBy />

						<div className="flex items-center gap-4 my-4">
							<span className="text-lg font-medium text-foreground/90 dark:text-foreground/80 tracking-tight shrink-0">
								Features
							</span>
							<div className="flex-1 border-t border-foreground/10" />
						</div>

						<div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-2 border border-foreground/[0.08] overflow-hidden">
							{[
								{
									label: "Multi-Agent Telemetry",
									headline: "Universal agent support.",
									desc: "Claude Code, Cursor, Codex, Windsurf, Aider, and Antigravity.",
									logos: true,
									href: "/docs",
								},
								{
									label: "Zero Code Exfiltration",
									headline: "Privacy by construction.",
									desc: "Raw source code and diffs never leave your local machine.",
									credential: true,
									href: "/docs",
								},
								{
									label: "Git Native",
									headline: "Hooks under 5ms.",
									desc: "Detached background hooks without blocking your commit pipeline.",
									social: true,
									href: "/docs",
								},
								{
									label: "Cost Estimation",
									headline: "Dual-engine pricing.",
									desc: "Harvests provider sessions or falls back to AST-calibrated rates.",
									org: true,
									href: "/docs",
								},
								{
									label: "Cryptographic Proof",
									headline: "Verifiable digital receipts.",
									desc: "HMAC-SHA256 salted hashes linking commit, tokens, and author.",
									enterprise: true,
									href: "/docs",
								},
								{
									label: "Thermal Receipts",
									headline: "Terminal & web cards.",
									desc: "Serrated-edge monospace thermal receipts and interactive cards.",
									plugins: true,
									href: "/docs",
								},
								{
									label: "CI/CD & Sticky PRs",
									headline: "GitHub Actions ready.",
									desc: "Auto-sync sticky PR receipts with AI token and dollar breakdown.",
									agent: true,
									href: "/docs",
								},
								{
									label: "Strict Rate Cards",
									headline: "Multi-model rate registry.",
									desc: "Versioned pricing for Claude 3.5, GPT-4o, o1, o3, DeepSeek, Gemini.",
									security: true,
									href: "/docs",
									managed: true,
								},
								{
									label: "Local First",
									headline: "Local SQLite & Git Notes.",
									desc: "Full terminal receipts without internet or cloud accounts.",
									dashboard: true,
									href: "/docs",
									managed: true,
								},
							].map((feature, i) => (
								<Link
									key={feature.label}
									href={"href" in feature ? feature.href : "#"}
									className="contents"
								>
									<motion.div
										whileHover={{
											y: -2,
											transition: { duration: 0.2, ease: "easeOut" },
										}}
										onMouseEnter={() => {
											if ("social" in feature && feature.social) {
												setSocialHovered(true);
											}
										}}
										onMouseLeave={() => {
											if ("social" in feature && feature.social) {
												setSocialHovered(false);
											}
										}}
										className={cn(
											"group/card relative p-4 lg:p-5 border-foreground/[0.08] min-h-[100px] transition-all duration-200 hover:bg-foreground/[0.02] hover:shadow-[inset_0_1px_0_0_rgba(128,128,128,0.1)] hover:z-10",
											// Bottom border: all except last; 3-col last row starts at 6
											i < 8 && "border-b",
											i >= 6 && "md:border-b-0",
											// Right border: none on mobile
											// 2-col: left column (even indices) gets right border
											i % 2 === 0 && i < 8 && "sm:border-r",
											// 3-col: remove right border on 3rd column, add on odd indices that need it
											i % 3 === 2 && "md:border-r-0",
											i % 2 !== 0 && i % 3 !== 2 && "md:border-r",
										)}
									>
										{/* Arrow icon — top right, visible on hover */}
										<span className="absolute top-3 right-3 lg:top-4 lg:right-4 opacity-0 -translate-y-0.5 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-200">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="text-foreground/40 dark:text-foreground/50"
											>
												<line x1="7" y1="17" x2="17" y2="7" />
												<polyline points="7 7 17 7 17 17" />
											</svg>
										</span>
										<div className="mb-1">
											<div className="text-[11px] font-mono text-foreground/45 dark:text-foreground/30 tracking-wider transition-colors duration-200 group-hover/card:text-foreground/60 dark:group-hover/card:text-foreground/40">
												{String(i + 1).padStart(2, "0")}
											</div>
											<div className="text-[13px] font-medium text-foreground/80 dark:text-neutral-100 transition-colors duration-200">
												{feature.headline}
											</div>
										</div>
										<div className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-relaxed transition-colors duration-200 group-hover/card:text-neutral-400 dark:group-hover/card:text-neutral-300">
											{feature.desc}
										</div>
										{"logos" in feature && feature.logos && (
											<div className="flex items-center gap-3.5 mt-3">
												{/* Claude Code */}
												<span title="Claude Code" className="inline-flex">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="15"
														height="15"
														viewBox="0 0 16 16"
														className="text-[#D97706] dark:text-[#F59E0B] opacity-90 transition-all duration-300 group-hover/card:opacity-100 group-hover/card:animate-[icon-bounce_0.4s_ease-out_0s]"
													>
														<path
															fill="currentColor"
															d="m6.96 15.2l.224-.992l.256-1.28l.208-1.024l.192-1.264l.112-.416l-.016-.032l-.08.016l-.96 1.312l-1.456 1.968l-1.152 1.216l-.272.112l-.48-.24l.048-.448l.272-.384l1.584-2.032l.96-1.264l.624-.72l-.016-.096h-.032l-4.224 2.752L2 12.48l-.336-.304l.048-.496l.16-.16l1.264-.88l3.152-1.76l.048-.16l-.048-.08h-.16L5.6 8.608L3.808 8.56l-1.552-.064l-1.52-.08l-.384-.08L0 7.856l.032-.24l.32-.208l.464.032l1.008.08l1.52.096l1.104.064l1.632.176h.256l.032-.112l-.08-.064l-.064-.064L4.64 6.56L2.944 5.44l-.896-.656l-.48-.336l-.24-.304l-.096-.672l.432-.48l.592.048l.144.032l.592.464l1.264.976L5.92 5.744l.24.192l.112-.064v-.048l-.112-.176l-.896-1.632l-.96-1.664l-.432-.688l-.112-.416a1.7 1.7 0 0 1-.064-.48l.496-.672L4.464 0l.672.096l.272.24l.416.944l.656 1.488l1.04 2.016l.304.608l.16.544l.064.176h.112v-.096l.08-1.152l.16-1.392l.16-1.792l.048-.512l.256-.608l.496-.32l.384.176l.32.464l-.048.288L9.84 2.4l-.384 1.936l-.24 1.312h.144l.16-.176l.656-.864l1.104-1.376l.48-.544l.576-.608l.368-.288h.688l.496.752l-.224.784l-.704.896l-.592.752l-.848 1.136l-.512.912l.048.064h.112l1.904-.416l1.04-.176l1.216-.208l.56.256l.064.256l-.224.544l-1.312.32l-1.536.304l-2.288.544l-.032.016l.032.048l1.024.096l.448.032h1.088l2.016.144l.528.352l.304.416l-.048.336l-.816.4l-1.088-.256l-2.56-.608l-.864-.208h-.128v.064l.736.72l1.328 1.2l1.68 1.552l.08.384l-.208.32l-.224-.032l-1.472-1.12l-.576-.496l-1.28-1.072h-.08v.112l.288.432l1.568 2.352l.08.72l-.112.224l-.416.144l-.432-.08l-.928-1.28l-.944-1.456l-.768-1.296l-.08.064l-.464 4.832l-.208.24l-.48.192l-.4-.304z"
														/>
													</svg>
												</span>
												{/* Cursor */}
												<span title="Cursor" className="inline-flex">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="15"
														height="15"
														viewBox="0 0 24 24"
														className="text-neutral-800 dark:text-neutral-200 opacity-90 transition-all duration-300 group-hover/card:opacity-100 group-hover/card:animate-[icon-bounce_0.4s_ease-out_0.05s]"
													>
														<path
															fill="currentColor"
															d="M11.503.131L1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23"
														/>
													</svg>
												</span>
												{/* OpenAI Codex */}
												<span title="OpenAI Codex" className="inline-flex">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="15"
														height="15"
														viewBox="0 0 24 24"
														className="text-[#10A37F] opacity-90 transition-all duration-300 group-hover/card:opacity-100 group-hover/card:animate-[icon-bounce_0.4s_ease-out_0.1s]"
													>
														<path
															fill="currentColor"
															d="M22.282 9.821a6 6 0 0 0-.516-4.91a6.05 6.05 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a6 6 0 0 0-3.998 2.9a6.05 6.05 0 0 0 .743 7.097a5.98 5.98 0 0 0 .51 4.911a6.05 6.05 0 0 0 6.515 2.9A6 6 0 0 0 13.26 24a6.06 6.06 0 0 0 5.772-4.206a6 6 0 0 0 3.997-2.9a6.06 6.06 0 0 0-.747-7.073M13.26 22.43a4.48 4.48 0 0 1-2.876-1.04l.141-.081l4.779-2.758a.8.8 0 0 0 .392-.681v-6.737l2.02 1.168a.07.07 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494M3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085l4.783 2.759a.77.77 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646M2.34 7.896a4.5 4.5 0 0 1 2.366-1.973V11.6a.77.77 0 0 0 .388.677l5.815 3.354l-2.02 1.168a.08.08 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.08.08 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667m2.01-3.023l-.141-.085l-4.774-2.782a.78.78 0 0 0-.785 0L9.409 9.23V6.897a.07.07 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.8.8 0 0 0-.393.681zm1.097-2.365l2.602-1.5l2.607 1.5v2.999l-2.597 1.5l-2.607-1.5Z"
														/>
													</svg>
												</span>
												{/* Windsurf */}
												<span title="Windsurf" className="inline-flex">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="15"
														height="15"
														viewBox="0 0 24 24"
														className="text-[#09B6A2] opacity-90 transition-all duration-300 group-hover/card:opacity-100 group-hover/card:animate-[icon-bounce_0.4s_ease-out_0.15s]"
													>
														<path
															fill="currentColor"
															d="M12 2L3.5 7v10L12 22l8.5-5V7L12 2zm6.5 14.1l-6.5 3.8l-6.5-3.8V7.9l6.5-3.8l6.5 3.8v8.2z"
														/>
													</svg>
												</span>
												{/* Aider */}
												<span title="Aider" className="inline-flex">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="15"
														height="15"
														viewBox="0 0 24 24"
														className="text-[#6366F1] opacity-90 transition-all duration-300 group-hover/card:opacity-100 group-hover/card:animate-[icon-bounce_0.4s_ease-out_0.2s]"
													>
														<path
															fill="none"
															stroke="currentColor"
															strokeWidth="2.5"
															strokeLinecap="round"
															strokeLinejoin="round"
															d="M4 17l6-6l-6-6m8 14h8"
														/>
													</svg>
												</span>
												{/* Antigravity */}
												<span title="Antigravity" className="inline-flex">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="15"
														height="15"
														viewBox="0 0 24 24"
														className="text-[#A855F7] opacity-90 transition-all duration-300 group-hover/card:opacity-100 group-hover/card:animate-[icon-bounce_0.4s_ease-out_0.25s]"
													>
														<circle cx="12" cy="12" r="3.5" fill="currentColor" />
														<ellipse
															cx="12"
															cy="12"
															rx="9"
															ry="4.5"
															transform="rotate(-30 12 12)"
															fill="none"
															stroke="currentColor"
															strokeWidth="1.8"
														/>
													</svg>
												</span>
												{/* +14 more */}
												<div className="flex items-center justify-center size-[20px] border border-dashed border-foreground/[0.1] text-foreground/35 dark:text-foreground/20 transition-all duration-300 group-hover/card:text-foreground/60 dark:group-hover/card:text-foreground/40 group-hover/card:border-foreground/20 group-hover/card:animate-[icon-bounce_0.4s_ease-out_0.3s]">
													<span className="text-[7px] font-mono leading-none">
														+14
													</span>
												</div>
											</div>
										)}
										{"social" in feature && feature.social && (
											<div className="mt-3 relative overflow-hidden">
												<div className="flex items-center gap-2.5">
													<div className="relative flex items-center gap-2.5">
														<div className="absolute left-3 right-3 top-1/2 h-px -translate-y-1/2 bg-foreground/[0.08]" />
														{/* Hook — stretches to "post-commit: 4.2ms" on hover */}
														<motion.div
															animate={{ width: socialHovered ? 136 : 24 }}
															transition={{
																duration: 0.3,
																ease: [0.4, 0, 0.2, 1],
															}}
															className="relative flex items-center h-6 border border-foreground/8 bg-background shrink-0 overflow-hidden opacity-80 transition-opacity duration-300 group-hover/card:opacity-100"
														>
															<div className="flex items-center gap-1.5 px-[7px]">
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	width="10"
																	height="10"
																	viewBox="0 0 24 24"
																	fill="none"
																	stroke="currentColor"
																	strokeWidth="2.5"
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	className="text-[#5db8a6] shrink-0"
																>
																	<polyline points="20 6 9 17 4 12" />
																</svg>
																<motion.span
																	animate={{ opacity: socialHovered ? 1 : 0 }}
																	transition={{
																		duration: 0.2,
																		delay: socialHovered ? 0.1 : 0,
																	}}
																	className="text-[8px] font-mono text-foreground/70 dark:text-foreground/50 whitespace-nowrap"
																>
																	post-commit: 4.2ms
																</motion.span>
															</div>
														</motion.div>
														{/* post-rewrite */}
														<div className="relative flex items-center justify-center size-6 border border-foreground/[0.08] bg-background text-neutral-800 dark:text-neutral-200 shrink-0 opacity-60 transition-opacity duration-300 group-hover/card:opacity-100" title="post-rewrite hook">
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="10"
																height="10"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="2"
																strokeLinecap="round"
																strokeLinejoin="round"
															>
																<line x1="6" y1="3" x2="6" y2="15" />
																<circle cx="18" cy="6" r="3" />
																<circle cx="6" cy="18" r="3" />
																<path d="M18 9a9 9 0 0 1-9 9" />
															</svg>
														</div>
														{/* pre-push */}
														<div className="relative flex items-center justify-center size-6 border border-foreground/[0.08] bg-background text-neutral-800 dark:text-neutral-200 shrink-0 opacity-60 transition-opacity duration-300 group-hover/card:opacity-100" title="pre-push hook">
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="10"
																height="10"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="2"
																strokeLinecap="round"
																strokeLinejoin="round"
															>
																<polyline points="16 16 12 12 8 16" />
																<line x1="12" y1="12" x2="12" y2="21" />
																<path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
															</svg>
														</div>
														{/* Detached background runner */}
														<div className="relative flex items-center justify-center size-6 border border-foreground/[0.08] bg-background text-[#cc785c] shrink-0 opacity-60 transition-opacity duration-300 group-hover/card:opacity-100" title="detached subshell">
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="10"
																height="10"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="2.5"
																strokeLinecap="round"
																strokeLinejoin="round"
															>
																<polyline points="4 17 10 11 4 5" />
																<line x1="12" y1="19" x2="20" y2="19" />
															</svg>
														</div>
														{/* Husky / Lefthook */}
														<div className="relative flex items-center justify-center size-6 border border-foreground/[0.08] bg-background text-[#5db8a6] shrink-0 opacity-60 transition-opacity duration-300 group-hover/card:opacity-100" title="husky/lefthook compatible">
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="9"
																height="9"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="2"
																strokeLinecap="round"
																strokeLinejoin="round"
															>
																<circle cx="12" cy="12" r="10" />
																<polyline points="12 6 12 12 16 14" />
															</svg>
														</div>
														{/* Git Notes hook */}
														<div className="relative flex items-center justify-center size-6 border border-foreground/[0.08] bg-background text-neutral-800 dark:text-neutral-200 shrink-0 opacity-60 transition-opacity duration-300 group-hover/card:opacity-100" title="git notes">
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="9"
																height="9"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="2"
																strokeLinecap="round"
																strokeLinejoin="round"
															>
																<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
																<polyline points="14 2 14 8 20 8" />
																<line x1="16" y1="13" x2="8" y2="13" />
																<line x1="16" y1="17" x2="8" y2="17" />
															</svg>
														</div>
													</div>
													{/* <5ms badge */}
													<div className="flex items-center justify-center h-6 px-1.5 border border-dashed border-[#5db8a6]/40 text-[#5db8a6] shrink-0">
														<span className="text-[8px] font-mono leading-none">
															&lt;5ms
														</span>
													</div>
												</div>
												<div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
											</div>
										)}
										{"credential" in feature && feature.credential && (
											<CredentialFields />
										)}
										{"org" in feature && feature.org && (
											<div className="mt-3 flex items-center gap-2.5">
												{/* Dual-engine provenance badges */}
												<div className="flex -space-x-1.5">
													<div className="relative size-5 rounded-full border border-foreground/[0.08] bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center z-[3]" title="Session Harvesting (JSONL/SQLite)">
														<span className="text-[8px] font-mono text-[#5db8a6] leading-none font-semibold">
															S
														</span>
													</div>
													<div className="relative size-5 rounded-full border border-foreground/[0.08] bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center z-[2]" title="AST Git Complexity">
														<span className="text-[8px] font-mono text-[#cc785c] leading-none font-semibold">
															A
														</span>
													</div>
													<div className="relative size-5 rounded-full border border-foreground/[0.08] bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center z-[1]" title="Multi-Model Rate Card">
														<span className="text-[8px] font-mono text-[#e8a55a] leading-none font-semibold">
															R
														</span>
													</div>
													<div className="relative size-5 rounded-full border border-dashed border-foreground/[0.1] bg-background flex items-center justify-center z-[0]">
														<span className="text-[8px] font-mono text-foreground/45 leading-none">
															$
														</span>
													</div>
												</div>
												{/* Provenance tags */}
												<div className="flex items-center gap-1">
													<span className="text-[8px] font-mono text-[#5db8a6] px-1.5 py-0.5 border border-[#5db8a6]/20 bg-[#5db8a6]/[0.05]">
														observed
													</span>
													<span className="text-[8px] font-mono text-[#cc785c] px-1.5 py-0.5 border border-[#cc785c]/20 bg-[#cc785c]/[0.05]">
														estimated
													</span>
													<span className="text-[8px] font-mono text-foreground/40 px-1.5 py-0.5 border border-dashed border-foreground/[0.08]">
														verified
													</span>
												</div>
											</div>
										)}
										{"plugins" in feature && feature.plugins && (
											<div className="mt-3 relative overflow-hidden">
												<div className="flex items-center gap-1 overflow-hidden">
													{[
														"thermal-cut",
														"serrated-edge",
														"code128-barcode",
														"og-image:35ms",
														"qr-code",
														"monospace-box",
														"json-v1",
														"git-notes",
														"ansi-color",
														"sticky-pr",
													].map((tag, i) => (
														<span
															key={tag}
															className={`text-[8px] font-mono whitespace-nowrap px-1.5 py-0.5 border shrink-0 ${i < 2 ? "text-foreground/60 dark:text-foreground/40 border-foreground/[0.08] bg-foreground/[0.02]" : i < 4 ? "text-foreground/45 dark:text-foreground/30 border-foreground/[0.06] bg-foreground/[0.015]" : "text-foreground/30 border-foreground/[0.05]"}`}
														>
															{tag}
														</span>
													))}
												</div>
												{/* Fade-out gradient on the right */}
												<div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
											</div>
										)}
										{"enterprise" in feature && feature.enterprise && (
											<div className="mt-3 flex items-center gap-2.5">
												<div className="relative flex items-center gap-2.5">
													<div className="absolute left-3 right-3 top-1/2 h-px -translate-y-1/2 bg-foreground/[0.08]" />
													{/* Commit */}
													<div className="relative flex items-center justify-center size-6 border border-foreground/[0.08] bg-background text-neutral-800 dark:text-neutral-200 opacity-70 transition-opacity duration-300 group-hover/card:opacity-100" title="commit sha">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="10"
															height="10"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														>
															<circle cx="12" cy="12" r="4" />
															<line x1="1.05" y1="12" x2="8" y2="12" />
															<line x1="16" y1="12" x2="22.95" y2="12" />
														</svg>
													</div>
													{/* Tokens */}
													<div className="relative flex items-center justify-center size-6 border border-foreground/[0.08] bg-background text-[#5db8a6] opacity-70 transition-opacity duration-300 group-hover/card:opacity-100" title="token payload">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="10"
															height="10"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														>
															<line x1="4" y1="9" x2="20" y2="9" />
															<line x1="4" y1="15" x2="20" y2="15" />
															<line x1="10" y1="3" x2="8" y2="21" />
															<line x1="16" y1="3" x2="14" y2="21" />
														</svg>
													</div>
													{/* Salt Key */}
													<div className="relative flex items-center justify-center size-6 border border-foreground/[0.08] bg-background text-[#cc785c] opacity-70 transition-opacity duration-300 group-hover/card:opacity-100" title="cryptographic salt">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="10"
															height="10"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														>
															<path d="M21 2l-2 2m-1.5 1.5L16 7l-1.5-1.5L13 7l1.5 1.5L13 10l-1.5-1.5L10 10l1.5 1.5L10 13l-1.5-1.5L7 13l1.5 1.5L6.5 16 2 20.5 3.5 22 8 17.5l1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 4.5-4.5z" />
														</svg>
													</div>
													{/* Author Sig */}
													<div className="relative flex items-center justify-center size-6 border border-foreground/[0.08] bg-background text-[#5db8a6] opacity-70 transition-opacity duration-300 group-hover/card:opacity-100" title="verified author">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="10"
															height="10"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														>
															<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
															<polyline points="9 12 11 14 15 10" />
														</svg>
													</div>
												</div>
												{/* 256 hash badge */}
												<div className="flex items-center justify-center h-6 px-1.5 border border-dashed border-foreground/[0.1] text-foreground/40">
													<span className="text-[8px] font-mono leading-none">
														HMAC-256
													</span>
												</div>
											</div>
										)}
										{"agent" in feature && feature.agent && (
											<div className="mt-3 flex items-center h-5 px-2.5 border border-foreground/[0.06] bg-foreground/[0.015] font-mono text-[8px] gap-1">
												<span className="text-foreground/30 ">$</span>
												<span className="text-foreground/60 dark:text-foreground/40">
													qodewk
													<span className="text-foreground/30 ">.</span>
													action
													<span className="text-foreground/30 ">()</span>
												</span>
												<span className="text-foreground/50 dark:text-foreground/20 mx-0.5">
													→
												</span>
												<span className="text-foreground/60 dark:text-foreground/45">
													PR #42: <span className="text-[#5db8a6]">+1,240 tok ($0.018)</span>
												</span>
												<span className="text-[#5db8a6]">
													✓
												</span>
												<span className="inline-block w-px h-2.5 bg-foreground/30 animate-[blink_1s_steps(2)_infinite]" />
											</div>
										)}
										{"security" in feature && feature.security && (
											<div className="mt-3 relative overflow-hidden">
												<div className="flex items-center gap-1.5 font-mono text-[8px]">
													{/* Rate card icon */}
													<div className="flex items-center justify-center size-5 border border-foreground/[0.08] bg-foreground/[0.02] shrink-0">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="9"
															height="9"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
															className="text-foreground/60"
														>
															<line x1="12" y1="1" x2="12" y2="23" />
															<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
														</svg>
													</div>
													{/* Claude */}
													<div className="flex items-center gap-1 px-1.5 py-0.5 border border-amber-500/20 bg-amber-500/[0.04] shrink-0">
														<span className="inline-block size-1 rounded-full bg-amber-500/60" />
														<span className="text-amber-600 dark:text-amber-400">claude: $3/M</span>
													</div>
													{/* GPT-4o */}
													<div className="flex items-center gap-1 px-1.5 py-0.5 border border-emerald-500/20 bg-emerald-500/[0.04] shrink-0">
														<span className="inline-block size-1 rounded-full bg-emerald-500/60" />
														<span className="text-emerald-600 dark:text-emerald-400">
															gpt-4o: $2.5/M
														</span>
													</div>
													{/* DeepSeek */}
													<div className="flex items-center gap-1 px-1.5 py-0.5 border border-teal-500/20 bg-teal-500/[0.04] shrink-0">
														<span className="inline-block size-1 rounded-full bg-teal-500/60" />
														<span className="text-teal-600 dark:text-teal-400">deepseek: $0.14/M</span>
													</div>
												</div>
												<div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
											</div>
										)}
										{"dashboard" in feature && feature.dashboard && (
											<div className="mt-3 relative overflow-hidden h-5">
												<div className="flex animate-[marquee_20s_linear_infinite] gap-4">
													{[...Array(2)].map((_, setIdx) => (
														<div key={setIdx} className="flex gap-4 shrink-0">
															{[
																{
																	time: "10:50 AM",
																	scope: "commit 8f2a1b",
																	action: "harvested 1,240 tokens ($0.018)",
																},
																{
																	time: "10:48 AM",
																	scope: "git-notes",
																	action: "refs/notes/qodewk written",
																},
																{
																	time: "10:45 AM",
																	scope: "sqlite db",
																	action: "~/.qodewk/state.db cached rate card",
																},
																{
																	time: "10:42 AM",
																	scope: "receipt",
																	action: "thermal monospace card generated",
																},
																{
																	time: "10:38 AM",
																	scope: "privacy",
																	action: "0 network egress (local verified)",
																},
															].map((event) => (
																<div
																	key={`${setIdx}-${event.time}-${event.scope}`}
																	className="flex items-center gap-1.5 shrink-0 h-5 whitespace-nowrap"
																>
																	<span className="text-[8px] font-mono text-foreground/30 ">
																		{event.time}
																	</span>
																	<span className="text-[8px] font-mono text-foreground/60 dark:text-foreground/40 border-b border-dashed border-foreground/20">
																		{event.scope}
																	</span>
																	<span className="text-[8px] font-mono text-foreground/40 dark:text-foreground/30">
																		{event.action}
																	</span>
																</div>
															))}
														</div>
													))}
												</div>
												<div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
											</div>
										)}
									</motion.div>
								</Link>
							))}
							{/* + marks at grid intersections */}
							<span className="hidden md:block absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 font-mono  -mt-[1px] -ml-[.5px] text-[10px] text-foreground/35 dark:text-foreground/20 select-none z-10">
								+
							</span>
							<span className="hidden md:block absolute top-1/3 left-2/3 -translate-x-1/2 -translate-y-1/2 font-mono -mt-[1px] -ml-[.5px] text-[10px] text-foreground/35 dark:text-foreground/20 select-none z-10">
								+
							</span>
							<span className="hidden md:block absolute top-2/3 left-1/3 -translate-x-1/2 -translate-y-1/2 font-mono  -mt-[1px] -ml-[.5px] text-[10px] text-foreground/35 dark:text-foreground/20 select-none z-10">
								+
							</span>
							<span className="hidden md:block absolute top-2/3 left-2/3 -translate-x-1/2 -translate-y-1/2 font-mono  -mt-[1px] -ml-[.5px] text-[10px] text-foreground/35 dark:text-foreground/20 select-none z-10">
								+
							</span>
						</div>

						<div className="my-4">
							<div className="flex items-center gap-4">
								<span className="text-lg font-medium text-foreground/90 dark:text-foreground/80 tracking-tight shrink-0">
									Architecture
								</span>
								<div className="flex-1 border-t border-foreground/10"></div>
							</div>
							<p className="text-[15px] sm:text-base text-foreground/50 mt-1">
								Universal telemetry and cryptographic proof for the AI coding agent era.
							</p>
						</div>

						<div className="mt-8 mb-10">
							<div className="border-r border-foreground/[0.1] bg-foreground/[0.01] overflow-hidden">
								<div className="flex flex-col lg:flex-row">
									<div className="min-w-0 flex-1 min-h-[320px] sm:min-h-[360px] lg:h-[400px] overflow-hidden">
										<AnimatePresence mode="wait" initial={false}>
											<motion.div
												key={frameworkTab}
												initial={{ opacity: 0, y: 6 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -4 }}
												transition={{ duration: 0.2, ease: "easeOut" }}
												className="pr-3 sm:pr-5 pb-5 h-full"
											>
												{frameworkTab === "declarative" && <ServerClientTabs />}
												{frameworkTab === "database" && <DatabaseSection />}
												{frameworkTab === "oauth" && <SocialProvidersSection />}
												{frameworkTab === "integrations" && (
													<IntegrationsSection />
												)}
											</motion.div>
										</AnimatePresence>
									</div>

									<div className="flex flex-row lg:flex-col lg:w-56 lg:shrink-0 border-t lg:border-t-0 lg:border-l border-foreground/[0.1] bg-neutral-50 dark:bg-black overflow-x-auto lg:overflow-visible">
										{[
											{ id: "declarative", label: "Declarative Config" },
											{ id: "database", label: "Bring Your Own Database" },
											{ id: "oauth", label: "OAuth Providers" },
											{ id: "integrations", label: "Integrations" },
										].map((tab) => (
											<button
												key={tab.id}
												type="button"
												onClick={() =>
													setFrameworkTab(
														tab.id as
															| "declarative"
															| "database"
															| "oauth"
															| "integrations",
													)
												}
												className={cn(
													"relative flex-1 lg:flex-none text-left px-3 sm:px-4 py-2.5 sm:py-3 text-[10px] sm:text-[11px] lg:text-xs font-mono tracking-wider uppercase transition-colors border-r lg:border-r-0 lg:border-b last:border-r-0 lg:last:border-b-0 border-foreground/[0.08] whitespace-nowrap lg:whitespace-normal",
													frameworkTab === tab.id
														? "text-foreground/85 bg-foreground/[0.04]"
														: "text-foreground/45 hover:text-foreground/70",
												)}
											>
												{tab.id === "database" ? (
													<>
														Bring Your Own{" "}
														<span className="text-amber-600 dark:text-amber-400">
															Database
														</span>
													</>
												) : (
													tab.label
												)}
												{frameworkTab === tab.id && (
													<span className="absolute inset-y-0 right-0 w-[1.5px] bg-foreground/65 hidden lg:block" />
												)}
											</button>
										))}
										<div className="hidden lg:flex flex-1 items-end p-4">
											<p className="text-[13px] leading-relaxed text-foreground/60 dark:text-foreground/50">
												{frameworkTab === "declarative" &&
													"Zero configuration drift. Telemetry logic and privacy boundaries live in version-controlled TypeScript code."}
												{frameworkTab === "database" &&
													"Works offline with embedded SQLite or Git Notes (refs/notes/qodewk). Your telemetry never leaves your device."}
												{frameworkTab === "oauth" &&
													"Universal session harvesting. Compatible with Claude Code, Cursor, Codex, Windsurf, Aider, and Antigravity."}
												{frameworkTab === "integrations" &&
													"Works with every CI/CD pipeline and Git platform. First-class support for GitHub Actions and Git hooks."}
											</p>
										</div>
									</div>
								</div>
							</div>

							<div className="mt-8">
								<PluginEcosystem />
							</div>
						</div>

						{/* Infrastructure */}
						<div className="relative mt-8 pt-6 pb-2">
							{/* Grain noise background — full bleed with fade edges */}
							<div
								className="absolute top-0 bottom-0 z-0 pointer-events-none"
								style={{
									left: "50%",
									transform: "translateX(-50%)",
									width: "100vw",
									maskImage:
										"linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
									WebkitMaskImage:
										"linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
								}}
							>
								<div className="absolute inset-0 bg-neutral-200/20 dark:bg-black/30" />
								<div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]">
									<svg className="w-full h-full">
										<filter id="infra-grain">
											<feTurbulence
												type="fractalNoise"
												baseFrequency="0.85"
												numOctaves="4"
												stitchTiles="stitch"
											/>
											<feColorMatrix type="saturate" values="0" />
										</filter>
										<rect
											width="100%"
											height="100%"
											filter="url(#infra-grain)"
										/>
									</svg>
								</div>
							</div>

							<div className="relative z-10 mb-6">
								<div className="flex items-center gap-4 mb-2">
									<span className="text-lg font-medium text-foreground/90 dark:text-foreground/80 tracking-tight shrink-0">
										Infrastructure
									</span>
									<div className="flex-1 border-t border-foreground/10" />
								</div>
								<p className="text-[15px] sm:text-base text-foreground/75 dark:text-foreground/65 leading-relaxed">
									Connect your repositories to Qodewk to visualize AI agent token burn, track cost trends across teams, and generate cryptographic receipts.
								</p>
							</div>

							{/* Dashboard video */}
							<div
								className="relative z-10 overflow-hidden border border-foreground/[0.08]"
								style={{
									maskImage:
										"linear-gradient(to bottom, black 60%, transparent 100%)",
									WebkitMaskImage:
										"linear-gradient(to bottom, black 60%, transparent 100%)",
								}}
							>
								<div className="flex items-center justify-between px-4 py-2 bg-foreground/[0.02] border-b border-foreground/[0.06]">
									<div className="flex items-center gap-2">
										<div className="flex items-center gap-1.5">
											<span className="size-2 rounded-full bg-foreground/10" />
											<span className="size-2 rounded-full bg-foreground/10" />
											<span className="size-2 rounded-full bg-foreground/10" />
										</div>
										<span className="text-[10px] font-mono text-foreground/30 ml-2">
											qodewk.dev
										</span>
									</div>
									<div className="flex items-center gap-3">
										{["Overview", "Tokens", "Receipts", "Audit"].map((tab, i) => (
											<span
												key={tab}
												className={cn(
													"text-[9px] font-mono uppercase tracking-wider",
													i === 0 ? "text-foreground/50" : "text-foreground/20",
												)}
											>
												{tab}
											</span>
										))}
									</div>
								</div>
								<div className="overflow-hidden" suppressHydrationWarning>
									<DemoVideo />
								</div>
							</div>

							{/* Feature grid — 3 columns */}
							<div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 mt-4 -mx-px">
								{[
									{
										title: "Receipts & Proof",
										features: [
											"Cryptographic signatures",
											"HMAC-SHA256 salted hashes",
											"Monospace thermal cards",
											"Zero source exfiltration",
										],
									},
									{
										title: "Token Telemetry",
										features: [
											"Provider session harvesting",
											"Cache hit/read breakdown",
											"Dual-engine cost fallback",
											"AST complexity scoring",
										],
									},
									{
										title: "Agent Attribution",
										features: [
											"Claude Code & Cursor support",
											"Codex & Windsurf attribution",
											"Aider & Antigravity sessions",
											"Sticky PR bot comments",
										],
									},
								].map((group) => (
									<div
										key={group.title}
										className="relative overflow-hidden border-t border-r border-b border-dashed border-foreground/[0.06] first:border-l -mt-px p-4"
									>
										{group.title === "Dashboard" && (
											<div
												className="absolute inset-0 pointer-events-none"
												style={{
													backgroundImage:
														"radial-gradient(circle, rgb(180 160 130 / 0.3) 1.2px, transparent 1.2px)",
													backgroundSize: "6px 6px",
													maskImage:
														"linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 45%)",
													WebkitMaskImage:
														"linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 45%)",
												}}
											/>
										)}
										<h4 className="relative text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-widest text-foreground/90 dark:text-foreground/75 mb-3">
											{group.title}
										</h4>
										<ul className="space-y-1.5">
											{group.features.map((f) => (
												<li
													key={f}
													className="flex items-start gap-2 text-[13px] sm:text-[14px] text-foreground/70 dark:text-foreground/55"
												>
													<span className="text-foreground/35 mt-0.5 font-mono text-[11px] leading-none select-none shrink-0">
														+
													</span>
													<span>{f}</span>
												</li>
											))}
										</ul>
										{/* Enterprise half-circle with provider icons */}
										{group.title === "Enterprise" && (
											<div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-[160px] h-[160px] pointer-events-none">
												{/* Half-circle arcs */}
												<svg
													className="absolute inset-0 w-full h-full"
													viewBox="0 0 160 160"
												>
													<circle
														cx="80"
														cy="80"
														r="68"
														fill="none"
														stroke="currentColor"
														strokeWidth="0.75"
														className="text-foreground/20"
														strokeDasharray="3 3"
													/>
													<circle
														cx="80"
														cy="80"
														r="44"
														fill="none"
														stroke="currentColor"
														strokeWidth="0.75"
														className="text-foreground/12"
														strokeDasharray="2 4"
													/>
												</svg>
												{/* Okta — 270° top of outer arc */}
												<div className="absolute size-6 flex items-center justify-center left-[68px] top-0">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="15"
														height="15"
														viewBox="0 0 256 256"
														className="text-foreground/60"
													>
														<path
															fill="currentColor"
															d="m140.844 1.778l-5.266 64.853a66 66 0 0 0-7.542-.427c-3.203 0-6.334.214-9.393.712l-2.99-31.432a1.72 1.72 0 0 1 1.709-1.848h5.337l-2.562-31.787C120.066.853 120.848 0 121.774 0h17.434c.996 0 1.779.853 1.636 1.849zm-43.976 3.2c-.285-.925-1.281-1.494-2.206-1.138L78.295 9.813c-.925.356-1.352 1.423-.925 2.276l13.307 29.013l-5.052 1.85c-.926.355-1.352 1.421-.926 2.275l13.592 28.515a61 61 0 0 1 15.868-6.044L96.94 4.978zM56.734 23.04l37.643 53.049c-4.768 3.129-9.108 6.827-12.809 11.093L59.011 64.996a1.72 1.72 0 0 1 .071-2.49l4.127-3.413L40.794 36.41c-.711-.711-.64-1.849.142-2.489l13.307-11.164c.783-.64 1.85-.498 2.42.284zM25.139 53.76c-.783-.569-1.921-.284-2.42.569l-8.68 15.075c-.499.854-.143 1.92.71 2.347L43.64 85.404l-2.704 4.623c-.498.853-.142 1.99.783 2.346l28.749 13.156a60.2 60.2 0 0 1 8.254-14.791zM3.862 94.72c.143-.996 1.139-1.564 2.064-1.351l62.976 16.427a62.3 62.3 0 0 0-2.704 16.782l-31.524-2.56a1.642 1.642 0 0 1-1.494-1.991l.925-5.263l-31.808-2.986c-.996-.071-1.637-.996-1.495-1.991l2.99-17.138zm-2.348 42.524c-.996.072-1.637.996-1.494 1.992l3.06 17.137c.142.996 1.138 1.565 2.063 1.351l30.883-8.035l.925 5.262c.143.996 1.139 1.565 2.064 1.351l30.456-8.39c-1.779-5.263-2.917-10.88-3.202-16.64l-64.826 5.972zM11.62 182.33c-.498-.853-.143-1.92.711-2.347l58.778-27.875c2.206 5.262 5.195 10.169 8.753 14.577L54.1 185.031c-.783.569-1.921.356-2.42-.498l-2.704-4.693l-26.257 18.133c-.783.57-1.922.285-2.42-.569l-8.752-15.075zm71.23-12.231L37.094 216.39c-.712.711-.64 1.849.142 2.489l13.378 11.164c.783.64 1.85.498 2.42-.284l18.501-26.027l4.127 3.485c.783.64 1.922.498 2.49-.356l17.933-26.026c-4.839-2.987-9.322-6.614-13.165-10.738zm-9.037 74.31c-.925-.355-1.352-1.421-.925-2.275L100 182.97c4.98 2.56 10.389 4.48 16.01 5.547l-7.97 30.577c-.213.925-1.28 1.494-2.205 1.138l-5.052-1.849l-8.468 30.791c-.285.925-1.281 1.494-2.206 1.138l-16.367-5.973zm46.68-55.11l-5.265 64.853c-.071.996.711 1.849 1.637 1.849h17.434c.996 0 1.779-.853 1.636-1.849l-2.561-31.787h5.336a1.72 1.72 0 0 0 1.708-1.848l-2.988-31.432c-3.06.498-6.191.712-9.393.712c-2.562 0-5.053-.143-7.543-.498m62.763-175.574c.427-.924 0-1.92-.925-2.275l-16.366-5.973c-.926-.356-1.922.213-2.206 1.137l-8.468 30.791l-5.053-1.848c-.925-.356-1.921.213-2.206 1.137l-7.97 30.578c5.693 1.138 11.03 3.058 16.011 5.547zm35.722 25.814L173.222 85.83a62 62 0 0 0-13.165-10.738l17.933-26.026c.569-.783 1.707-.996 2.49-.356l4.127 3.485l18.502-26.027c.57-.782 1.708-.925 2.42-.285l13.377 11.165c.783.64.783 1.778.143 2.489zm24.764 36.409c.925-.427 1.21-1.494.711-2.347L235.7 58.524c-.498-.853-1.637-1.066-2.42-.568l-26.257 18.133l-2.704-4.622c-.499-.854-1.637-1.138-2.42-.498l-25.76 18.347c3.558 4.408 6.476 9.315 8.753 14.577l58.778-27.875zm9.25 23.609l2.99 17.137c.142.996-.499 1.85-1.495 1.991l-64.826 6.045c-.285-5.831-1.424-11.378-3.203-16.64l30.457-8.391c.925-.285 1.921.355 2.063 1.35l.925 5.263l30.884-8.035c.925-.214 1.92.355 2.063 1.35zm-2.917 62.933c.925.213 1.921-.356 2.064-1.351L255.126 144c.143-.996-.498-1.849-1.494-1.991l-31.808-2.987l.925-5.262c.142-.996-.498-1.849-1.495-1.991l-31.523-2.56a62.3 62.3 0 0 1-2.704 16.782l62.976 16.427zM233.28 201.6c-.498.853-1.636 1.067-2.419.569l-53.583-36.978a60.2 60.2 0 0 0 8.254-14.791l28.749 13.156c.925.426 1.28 1.493.783 2.346l-2.704 4.622l28.89 13.654c.854.426 1.21 1.493.712 2.346zm-71.657-21.831l37.643 53.049c.57.782 1.708.924 2.42.284l13.306-11.164c.783-.64.783-1.778.143-2.49l-22.415-22.684l4.127-3.413c.783-.64.783-1.778.07-2.489l-22.557-22.186c-3.771 4.266-8.04 8.035-12.808 11.093zm-.356 72.249c-.925.355-1.921-.214-2.206-1.138l-17.22-62.72a61 61 0 0 0 15.868-6.044l13.592 28.515c.426.925 0 1.991-.926 2.276l-5.052 1.849l13.307 29.013c.427.924 0 1.92-.925 2.275l-16.367 5.974z"
														/>
													</svg>
												</div>
												{/* Microsoft — 225° upper-left of outer arc */}
												<div className="absolute size-6 flex items-center justify-center left-[20px] top-[20px]">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="13"
														height="13"
														viewBox="0 0 256 256"
													>
														<path
															fill="#F1511B"
															d="M121.666 121.666H0V0h121.666z"
														/>
														<path
															fill="#80CC28"
															d="M256 121.666H134.335V0H256z"
														/>
														<path
															fill="#00ADEF"
															d="M121.663 256.002H0V134.336h121.663z"
														/>
														<path
															fill="#FBBC09"
															d="M256 256.002H134.335V134.336H256z"
														/>
													</svg>
												</div>
												{/* Google — 180° leftmost of outer arc */}
												<div className="absolute size-6 flex items-center justify-center left-0 top-[68px]">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="13"
														height="13"
														viewBox="0 0 16 16"
													>
														<g
															fill="none"
															fillRule="evenodd"
															clipRule="evenodd"
														>
															<path
																fill="#f44336"
																d="M7.209 1.061c.725-.081 1.154-.081 1.933 0a6.57 6.57 0 0 1 3.65 1.82a100 100 0 0 0-1.986 1.93q-1.876-1.59-4.188-.734q-1.696.78-2.362 2.528a78 78 0 0 1-2.148-1.658a.26.26 0 0 0-.16-.027q1.683-3.245 5.26-3.86"
																opacity=".987"
															/>
															<path
																fill="#ffc107"
																d="M1.946 4.92q.085-.013.161.027a78 78 0 0 0 2.148 1.658A7.6 7.6 0 0 0 4.04 7.99q.037.678.215 1.331L2 11.116Q.527 8.038 1.946 4.92"
																opacity=".997"
															/>
															<path
																fill="#448aff"
																d="M12.685 13.29a26 26 0 0 0-2.202-1.74q1.15-.812 1.396-2.228H8.122V6.713q3.25-.027 6.497.055q.616 3.345-1.423 6.032a7 7 0 0 1-.51.49"
																opacity=".999"
															/>
															<path
																fill="#43a047"
																d="M4.255 9.322q1.23 3.057 4.51 2.854a3.94 3.94 0 0 0 1.718-.626q1.148.812 2.202 1.74a6.62 6.62 0 0 1-4.027 1.684a6.4 6.4 0 0 1-1.02 0Q3.82 14.524 2 11.116z"
																opacity=".993"
															/>
														</g>
													</svg>
												</div>
												{/* Keycloak — 135° lower-left of outer arc */}
												<div className="absolute size-6 flex items-center justify-center left-[20px] top-[116px]">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="13"
														height="13"
														viewBox="0 0 24 24"
														className="text-foreground/60"
													>
														<path
															fill="currentColor"
															d="m18.742 1.182l-12.493.002C4.155 4.784 2.079 8.393 0 12.002c2.071 3.612 4.162 7.214 6.252 10.816l12.49-.004l3.089-5.404h2.158v-.002H24L23.996 6.59h-2.168zM8.327 4.792h2.081l1.04 1.8l-3.12 5.413l3.117 5.403l-1.035 1.81H8.327a2048 2048 0 0 0-4.168-7.204zm6.241 0l2.086.003q2.088 3.608 4.166 7.222l-4.167 7.2h-2.08c-.382-.562-1.038-1.808-1.038-1.808l3.123-5.405l-3.124-5.413z"
														/>
													</svg>
												</div>
												{/* Ping Identity — 90° bottom of outer arc */}
												<div className="absolute size-6 flex items-center justify-center left-[68px] top-[136px]">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="12"
														height="12"
														viewBox="0 0 24 24"
													>
														<path
															d="M23.7476 0H0V23.3473H23.7476V0Z"
															fill="#D20E0F"
														/>
													</svg>
												</div>
											</div>
										)}
									</div>
								))}
							</div>

							{/* Sentinel row */}
							<div className="relative z-10 border border-dashed border-foreground/[0.06] -mt-px -mx-px p-4">
								<div className="flex flex-col sm:flex-row sm:items-start gap-4">
									<div className="sm:w-1/3">
										<div className="flex items-center gap-2 mb-1">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="12"
												height="12"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="text-foreground/70"
											>
												<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
											</svg>
											<h4 className="text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-widest text-foreground/90 dark:text-foreground/75">
												Privacy Sentinel
											</h4>
										</div>
										<p className="text-[13px] sm:text-[14px] text-foreground/60 dark:text-foreground/50 leading-relaxed">
											Zero source code exfiltration guaranteed by cryptographic boundaries.
										</p>
									</div>
									<div className="flex-1 flex flex-wrap gap-1.5">
										{[
											"Zero Exfiltration",
											"Local Processing",
											"HMAC-SHA256",
											"Salted Hashes",
											"50KB Payload Cap",
											"Metadata Only",
											"Non-blocking Hooks",
											"Offline First",
											"AST Heuristics",
											"Audit Trails",
										].map((tag) => (
											<span
												key={tag}
												className="inline-flex items-center px-2 py-1 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-foreground/70 dark:text-foreground/55 border border-foreground/[0.12] bg-foreground/[0.03] hover:bg-foreground/[0.06] hover:text-foreground/80 dark:hover:text-foreground/65 transition-colors"
											>
												{tag}
											</span>
										))}
									</div>
								</div>
							</div>

							{/* CTA */}
							<div className="relative z-10 flex items-center justify-between mt-4 px-6 py-5 border border-dashed border-foreground/[0.08] bg-foreground/[0.01]">
								<div className="flex flex-col gap-0.5">
									<span className="text-[13px] sm:text-[14px] font-medium text-foreground/90 dark:text-foreground/85">
										Universal Telemetry Engine
									</span>
									<span className="text-[11px] sm:text-[12px] text-foreground/75 dark:text-foreground/60">
										Digital receipts, multi-agent attribution, rate cards, and GitHub Action bot comments.
									</span>
								</div>
								<Link
									href="/docs"
									className="inline-flex items-center gap-1.5 shrink-0 ml-4 px-4 py-2.5 bg-foreground text-background hover:opacity-90 transition-all font-mono text-[11px] uppercase tracking-widest group"
								>
									View Docs
									<svg
										className="h-2.5 w-2.5 opacity-70 group-hover:translate-x-0.5 transition-transform"
										viewBox="0 0 10 10"
										fill="none"
									>
										<path
											d="M1 5H9M9 5L5 1M9 5L5 9"
											stroke="currentColor"
											strokeWidth="1.2"
										/>
									</svg>
								</Link>
							</div>
						</div>

						<ContributorsSection
							contributors={contributors}
							contributorCount={stats.contributors}
						/>

						<ReadmeFooter stats={stats} />
					</motion.article>
				</div>
			</div>
		</motion.div>
	);
}
