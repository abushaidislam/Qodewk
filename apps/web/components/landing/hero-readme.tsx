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
	const emailText = "user@email.com";
	const passwordDots = "••••••••";
	const [emailDisplay, setEmailDisplay] = useState(emailText);
	const [passwordDisplay, setPasswordDisplay] = useState(passwordDots);
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
		setEmailDisplay("");
		setPasswordDisplay("");

		// Type email character by character
		for (let i = 0; i <= emailText.length; i++) {
			const t = setTimeout(() => {
				setEmailDisplay(emailText.slice(0, i));
			}, i * 60);
			timeoutsRef.current.push(t);
		}

		// Type password dots after email finishes
		const passwordStart = (emailText.length + 2) * 60;
		for (let i = 0; i <= passwordDots.length; i++) {
			const t = setTimeout(
				() => {
					setPasswordDisplay(passwordDots.slice(0, i));
					if (i === passwordDots.length) {
						isTypingRef.current = false;
						setIsTyping(false);
					}
				},
				passwordStart + i * 50,
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
					width="8"
					height="8"
					viewBox="0 0 24 24"
					className="text-foreground/45 dark:text-foreground/30 shrink-0 mr-1.5"
				>
					<path
						fill="currentColor"
						d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4-8 5-8-5V6l8 5 8-5z"
					/>
				</svg>
				<span className="text-[9px] font-mono text-foreground/50 dark:text-foreground/35 truncate">
					{emailDisplay}
					{isTyping && emailDisplay.length < emailText.length && (
						<span className="inline-block w-px h-2.5 bg-foreground/50 ml-px animate-[blink_0.8s_step-end_infinite] align-middle" />
					)}
				</span>
			</div>
			<div className="flex items-center h-5 px-2 border border-foreground/[0.08] bg-foreground/[0.02] flex-1 min-w-0">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="8"
					height="8"
					viewBox="0 0 24 24"
					className="text-foreground/45 dark:text-foreground/30 shrink-0 mr-1.5"
				>
					<path
						fill="currentColor"
						d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2m-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2M9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2z"
					/>
				</svg>
				<span className="text-[9px] font-mono text-foreground/50 dark:text-foreground/35 tracking-[0.1em]">
					{passwordDisplay}
					{isTyping &&
						emailDisplay.length >= emailText.length &&
						passwordDisplay.length < passwordDots.length && (
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
				className="absolute -right-10 top-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.03] dark:opacity-[0.04]"
				aria-hidden="true"
			>
				<svg
					width="300"
					height="225"
					viewBox="0 0 60 45"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M0 0H15V15H30V30H15V45H0V30V15V0ZM45 30V15H30V0H45H60V15V30V45H45H30V30H45Z"
						className="fill-foreground"
					/>
				</svg>
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
					Roll your own auth with confidence in minutes.
				</p>

				<div className="flex items-center justify-center gap-2">
					{stats.npmDownloads > 0 && (
						<a
							href="https://www.npmjs.com/package/better-auth"
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
								Trusted By
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
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="15"
																height="15"
																viewBox="0 0 24 24"
																className="text-neutral-800 dark:text-neutral-200 opacity-90 transition-all duration-300 group-hover/card:opacity-100 group-hover/card:animate-[icon-bounce_0.4s_ease-out_0s]"
															>
																<path fill="currentColor" d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" />
															</svg>
															{/* Cursor */}
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="15"
																height="15"
																viewBox="0 0 24 24"
																className="text-neutral-800 dark:text-neutral-200 opacity-90 transition-all duration-300 group-hover/card:opacity-100 group-hover/card:animate-[icon-bounce_0.4s_ease-out_0.05s]"
															>
																<path fill="currentColor" d="M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23" />
															</svg>
															{/* Codex */}
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="15"
																height="15"
																viewBox="0 0 24 24"
																className="text-neutral-800 dark:text-neutral-200 opacity-90 transition-all duration-300 group-hover/card:opacity-100 group-hover/card:animate-[icon-bounce_0.4s_ease-out_0.1s]"
															>
																<path fill="currentColor" d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
															</svg>
															{/* Windsurf */}
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="15"
																height="15"
																viewBox="0 0 24 24"
																className="text-neutral-800 dark:text-neutral-200 opacity-90 transition-all duration-300 group-hover/card:opacity-100 group-hover/card:animate-[icon-bounce_0.4s_ease-out_0.15s]"
															>
																<path fill="currentColor" d="M1 0a1 1 0 0 0-1 1v22c0 .063.007.124.018.184L0 23.199l.025.026c.103.443.5.775.975.775h22a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1H1zm.707 1h20.582l-2 2H3.707l-2-2zM23 1.705v20.588l-2-2V3.705l2-2zM1 1.707l2 2v16.492l-2 2V1.707zM4 4h16v16H4V4zm3.537 3c-1.006 0-1.51.535-1.51 1.605v2.297c0 .4-.184.6-.554.6a.47.47 0 0 0-.344.139.512.512 0 0 0-.129.365.49.49 0 0 0 .129.353.47.47 0 0 0 .344.139c.37 0 .554.2.554.6v2.297c0 1.07.504 1.605 1.51 1.605.136 0 .248-.05.334-.148A.494.494 0 0 0 8 16.498a.512.512 0 0 0-.129-.365.439.439 0 0 0-.334-.139c-.376 0-.564-.199-.564-.6v-2.296c0-.46-.1-.823-.297-1.092.099-.138.173-.3.222-.485.05-.183.075-.389.075-.619V8.605c0-.4.188-.6.564-.6a.439.439 0 0 0 .334-.138A.499.499 0 0 0 8 7.512a.53.53 0 0 0-.129-.364A.425.425 0 0 0 7.537 7zm8.926 0a.425.425 0 0 0-.334.148.53.53 0 0 0-.129.364.5.5 0 0 0 .129.355.439.439 0 0 0 .334.139c.376 0 .564.199.564.6v2.296c0 .23.025.436.075.62.049.183.123.346.222.484-.197.27-.297.632-.297 1.092v2.297c0 .4-.188.6-.564.6a.439.439 0 0 0-.334.138.512.512 0 0 0-.129.365c0 .145.043.262.129.354a.425.425 0 0 0 .334.148c1.006 0 1.51-.535 1.51-1.605v-2.297c0-.4.184-.6.554-.6a.439.439 0 0 0 .334-.139.475.475 0 0 0 .139-.353.492.492 0 0 0-.139-.365.439.439 0 0 0-.334-.139c-.37 0-.554-.2-.554-.6V8.605c0-1.07-.504-1.605-1.51-1.605zm-7.25 6a.737.737 0 0 0-.496.227.717.717 0 0 0-.217.529.74.74 0 0 0 .75.744.74.74 0 0 0 .75-.744.717.717 0 0 0-.217-.53A.71.71 0 0 0 9.25 13h-.037zm2.75 0a.737.737 0 0 0-.496.227.717.717 0 0 0-.217.529.74.74 0 0 0 .217.53c.152.143.33.214.533.214a.74.74 0 0 0 .75-.744.717.717 0 0 0-.217-.53A.71.71 0 0 0 12 13h-.037zm2.75 0a.737.737 0 0 0-.496.227.717.717 0 0 0-.217.529.74.74 0 0 0 .217.53c.152.143.33.214.533.214a.74.74 0 0 0 .75-.744.717.717 0 0 0-.217-.53.71.71 0 0 0-.533-.226h-.037zm-11.1 8h16.68l2 2H1.613l2-2z" />
															</svg>
															{/* Trae */}
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="15"
																height="15"
																viewBox="0 0 24 24"
																className="text-neutral-800 dark:text-neutral-200 opacity-90 transition-all duration-300 group-hover/card:opacity-100 group-hover/card:animate-[icon-bounce_0.4s_ease-out_0.2s]"
															>
																<path fill="currentColor" d="M24 20.5H3.5V17H0V3.5h24ZM3.5 17h17V7h-17Zm8.5-5-2.5 2.5L7 12l2.5-2.5Zm7 0-2.5 2.5L14 12l2.5-2.5z" />
															</svg>
															{/* Antigravity */}
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="15"
																height="15"
																viewBox="0 0 24 24"
																className="text-neutral-800 dark:text-neutral-200 opacity-90 transition-all duration-300 group-hover/card:opacity-100 group-hover/card:animate-[icon-bounce_0.4s_ease-out_0.25s]"
															>
																<path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
															</svg>
															{/* Aider */}
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="15"
																height="15"
																viewBox="0 0 24 24"
																className="text-neutral-800 dark:text-neutral-200 opacity-90 transition-all duration-300 group-hover/card:opacity-100 group-hover/card:animate-[icon-bounce_0.4s_ease-out_0.4s]"
															>
																<path fill="currentColor" d="M4 12l8 8 8-8-8-8-8 8z" />
															</svg>
															{/* Copilot */}
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="15"
																height="15"
																viewBox="0 0 24 24"
																className="text-neutral-800 dark:text-neutral-200 opacity-90 transition-all duration-300 group-hover/card:opacity-100 group-hover/card:animate-[icon-bounce_0.4s_ease-out_0.35s]"
															>
																<path fill="currentColor" d="M23.922 16.997C23.061 18.492 18.063 22.02 12 22.02 5.937 22.02.939 18.492.078 16.997A.641.641 0 0 1 0 16.741v-2.869a.883.883 0 0 1 .053-.22c.372-.935 1.347-2.292 2.605-2.656.167-.429.414-1.055.644-1.517a10.098 10.098 0 0 1-.052-1.086c0-1.331.282-2.499 1.132-3.368.397-.406.89-.717 1.474-.952C7.255 2.937 9.248 1.98 11.978 1.98c2.731 0 4.767.957 6.166 2.093.584.235 1.077.546 1.474.952.85.869 1.132 2.037 1.132 3.368 0 .368-.014.733-.052 1.086.23.462.477 1.088.644 1.517 1.258.364 2.233 1.721 2.605 2.656a.841.841 0 0 1 .053.22v2.869a.641.641 0 0 1-.078.256Zm-11.75-5.992h-.344a4.359 4.359 0 0 1-.355.508c-.77.947-1.918 1.492-3.508 1.492-1.725 0-2.989-.359-3.782-1.259a2.137 2.137 0 0 1-.085-.104L4 11.746v6.585c1.435.779 4.514 2.179 8 2.179 3.486 0 6.565-1.4 8-2.179v-6.585l-.098-.104s-.033.045-.085.104c-.793.9-2.057 1.259-3.782 1.259-1.59 0-2.738-.545-3.508-1.492a4.359 4.359 0 0 1-.355-.508Zm2.328 3.25c.549 0 1 .451 1 1v2c0 .549-.451 1-1 1-.549 0-1-.451-1-1v-2c0-.549.451-1 1-1Zm-5 0c.549 0 1 .451 1 1v2c0 .549-.451 1-1 1-.549 0-1-.451-1-1v-2c0-.549.451-1 1-1Zm3.313-6.185c.136 1.057.403 1.913.878 2.497.442.544 1.134.938 2.344.938 1.573 0 2.292-.337 2.657-.751.384-.435.558-1.15.558-2.361 0-1.14-.243-1.847-.705-2.319-.477-.488-1.319-.862-2.824-1.025-1.487-.161-2.192.138-2.533.529-.269.307-.437.808-.438 1.578v.021c0 .265.021.562.063.893Zm-1.626 0c.042-.331.063-.628.063-.894v-.02c-.001-.77-.169-1.271-.438-1.578-.341-.391-1.046-.69-2.533-.529-1.505.163-2.347.537-2.824 1.025-.462.472-.705 1.179-.705 2.319 0 1.211.175 1.926.558 2.361.365.414 1.084.751 2.657.751 1.21 0 1.902-.394 2.344-.938.475-.584.742-1.44.878-2.497Z" />
															</svg>
																{/* +N more */}
												<div className="flex items-center justify-center size-[20px] border border-dashed border-foreground/[0.1] text-foreground/35 dark:text-foreground/20 transition-all duration-300 group-hover/card:text-foreground/60 dark:group-hover/card:text-foreground/40 group-hover/card:border-foreground/20 group-hover/card:animate-[icon-bounce_0.4s_ease-out_0.4s]">
													<span className="text-[7px] font-mono leading-none">
														+N
													</span>
												</div>
											</div>
										)}
										{"social" in feature && feature.social && (
											<div className="mt-3 relative overflow-hidden">
												<div className="flex items-center gap-2.5">
													<div className="relative flex items-center gap-2.5">
														<div className="absolute left-3 right-3 top-1/2 h-px -translate-y-1/2 bg-foreground/[0.08]" />
														{/* Google — stretches to "Sign in with Google" on hover */}
														<motion.div
															animate={{ width: socialHovered ? 120 : 24 }}
															transition={{
																duration: 0.3,
																ease: [0.4, 0, 0.2, 1],
															}}
															className="relative flex items-center h-6 border border-foreground/8 bg-background shrink-0 overflow-hidden opacity-60 transition-opacity duration-300 group-hover/card:opacity-100"
														>
															<div className="flex items-center gap-1.5 px-[7px]">
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	width="10"
																	height="10"
																	viewBox="0 0 48 48"
																	className="shrink-0"
																>
																	<path
																		fill="#FFC107"
																		d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917"
																	/>
																	<path
																		fill="#FF3D00"
																		d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691"
																	/>
																	<path
																		fill="#4CAF50"
																		d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.9 11.9 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44"
																	/>
																	<path
																		fill="#1976D2"
																		d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917"
																	/>
																</svg>
																<motion.span
																	animate={{ opacity: socialHovered ? 1 : 0 }}
																	transition={{
																		duration: 0.2,
																		delay: socialHovered ? 0.1 : 0,
																	}}
																	className="text-[8px] font-mono text-foreground/60 dark:text-foreground/40 whitespace-nowrap"
																>
																	Sign in with Google
																</motion.span>
															</div>
														</motion.div>
														{/* GitHub */}
														<div className="relative flex items-center justify-center size-6 border border-foreground/[0.08] bg-background text-neutral-800 dark:text-neutral-200 shrink-0 opacity-60 transition-opacity duration-300 group-hover/card:opacity-100">
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="10"
																height="10"
																viewBox="0 0 24 24"
															>
																<path
																	fill="currentColor"
																	d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
																/>
															</svg>
														</div>
														{/* Apple */}
														<div className="relative flex items-center justify-center size-6 border border-foreground/[0.08] bg-background text-neutral-800 dark:text-neutral-200 shrink-0 opacity-60 transition-opacity duration-300 group-hover/card:opacity-100">
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="10"
																height="10"
																viewBox="0 0 24 24"
															>
																<path
																	fill="currentColor"
																	d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
																/>
															</svg>
														</div>
														{/* Discord */}
														<div className="relative flex items-center justify-center size-6 border border-foreground/[0.08] bg-background text-[#5865F2] shrink-0 opacity-60 transition-opacity duration-300 group-hover/card:opacity-100">
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="10"
																height="10"
																viewBox="0 0 24 24"
															>
																<path
																	fill="currentColor"
																	d="M20.317 4.37a19.8 19.8 0 0 0-4.885-1.515.07.07 0 0 0-.073.036c-.21.375-.444.864-.608 1.25a18.3 18.3 0 0 0-5.487 0 13 13 0 0 0-.617-1.25.07.07 0 0 0-.073-.036A19.7 19.7 0 0 0 3.69 4.37a.06.06 0 0 0-.032.025C.533 9.046-.32 13.58.099 18.057a.08.08 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.08.08 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.08.08 0 0 0-.041-.106 13 13 0 0 1-1.872-.892.08.08 0 0 1-.008-.128q.188-.141.372-.287a.08.08 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.08.08 0 0 1 .079.01q.183.149.372.288a.08.08 0 0 1-.006.127c-.598.35-1.22.645-1.873.892a.08.08 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.08.08 0 0 0 .084.029 19.8 19.8 0 0 0 6.002-3.03.08.08 0 0 0 .032-.056c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.026M8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419s.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418m7.975 0c-1.183 0-2.157-1.085-2.157-2.419s.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418"
																/>
															</svg>
														</div>
														{/* Microsoft */}
														<div className="relative flex items-center justify-center size-6 border border-foreground/[0.08] bg-background shrink-0 opacity-60 transition-opacity duration-300 group-hover/card:opacity-100">
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="9"
																height="9"
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
														{/* X/Twitter */}
														<div className="relative flex items-center justify-center size-6 border border-foreground/[0.08] bg-background text-neutral-800 dark:text-neutral-200 shrink-0 opacity-60 transition-opacity duration-300 group-hover/card:opacity-100">
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="9"
																height="9"
																viewBox="0 0 24 24"
															>
																<path
																	fill="currentColor"
																	d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
																/>
															</svg>
														</div>
													</div>
													{/* +34 */}
													<div className="flex items-center justify-center size-6 border border-dashed border-foreground/[0.1] text-foreground/35 dark:text-foreground/20 shrink-0">
														<span className="text-[8px] font-mono leading-none">
															+34
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
												{/* Overlapping member avatars */}
												<div className="flex -space-x-1.5">
													<div className="relative size-5 rounded-full border border-foreground/[0.08] bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center z-[3]">
														<span className="text-[8px] font-mono text-foreground/55 dark:text-foreground/35 leading-none">
															A
														</span>
													</div>
													<div className="relative size-5 rounded-full border border-foreground/[0.08] bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center z-[2]">
														<span className="text-[8px] font-mono text-foreground/50 dark:text-foreground/30 leading-none">
															B
														</span>
													</div>
													<div className="relative size-5 rounded-full border border-foreground/[0.08] bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center z-[1]">
														<span className="text-[8px] font-mono text-foreground/40 dark:text-foreground/50 leading-none">
															C
														</span>
													</div>
													<div className="relative size-5 rounded-full border border-dashed border-foreground/[0.1] bg-background flex items-center justify-center z-[0]">
														<span className="text-[8px] font-mono text-foreground/35 dark:text-foreground/20 leading-none">
															+
														</span>
													</div>
												</div>
												{/* Role badges */}
												<div className="flex items-center gap-1">
													<span className="text-[8px] font-mono text-foreground/50 dark:text-foreground/30 px-1.5 py-0.5 border border-foreground/[0.08] bg-foreground/[0.015]">
														owner
													</span>
													<span className="text-[8px] font-mono text-foreground/35 dark:text-foreground/20 px-1.5 py-0.5 border border-foreground/[0.06] bg-foreground/[0.015]">
														admin
													</span>
													<span className="text-[8px] font-mono text-foreground/30  px-1.5 py-0.5 border border-dashed border-foreground/[0.08]">
														member
													</span>
												</div>
											</div>
										)}
										{"plugins" in feature && feature.plugins && (
											<div className="mt-3 relative overflow-hidden">
												<div className="flex items-center gap-1 overflow-hidden">
													{[
														"passkeys",
														"2fa",
														"magic-link",
														"jwt",
														"api-keys",
														"anonymous",
														"oidc",
														"otp",
														"bearer",
														"multi-session",
													].map((plugin, i) => (
														<span
															key={plugin}
															className={`text-[8px] font-mono whitespace-nowrap px-1.5 py-0.5 border shrink-0 ${i < 2 ? "text-foreground/50 dark:text-foreground/30 border-foreground/[0.08] bg-foreground/[0.02]" : i < 4 ? "text-foreground/40 dark:text-foreground/22 border-foreground/[0.06] bg-foreground/[0.015]" : "text-foreground/30  border-foreground/[0.05]"}`}
														>
															{plugin}
														</span>
													))}
												</div>
												{/* Fade-out gradient on the right to imply "there's more" */}
												<div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
											</div>
										)}
										{"enterprise" in feature && feature.enterprise && (
											<div className="mt-3 flex items-center gap-2.5">
												<div className="relative flex items-center gap-2.5">
													<div className="absolute left-3 right-3 top-1/2 h-px -translate-y-1/2 bg-foreground/[0.08]" />
													{/* Okta */}
													<div className="relative flex items-center justify-center size-6 border border-foreground/[0.08] bg-background text-neutral-800 dark:text-neutral-200 opacity-60 transition-opacity duration-300 group-hover/card:opacity-100">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="10"
															height="10"
															viewBox="0 0 256 256"
														>
															<path
																fill="currentColor"
																d="m140.844 1.778l-5.266 64.853a66 66 0 0 0-7.542-.427c-3.203 0-6.334.214-9.393.712l-2.99-31.432a1.72 1.72 0 0 1 1.709-1.848h5.337l-2.562-31.787C120.066.853 120.848 0 121.774 0h17.434c.996 0 1.779.853 1.636 1.849zm-43.976 3.2c-.285-.925-1.281-1.494-2.206-1.138L78.295 9.813c-.925.356-1.352 1.423-.925 2.276l13.307 29.013l-5.052 1.85c-.926.355-1.352 1.421-.926 2.275l13.592 28.515a61 61 0 0 1 15.868-6.044L96.94 4.978zM56.734 23.04l37.643 53.049c-4.768 3.129-9.108 6.827-12.809 11.093L59.011 64.996a1.72 1.72 0 0 1 .071-2.49l4.127-3.413L40.794 36.41c-.711-.711-.64-1.849.142-2.489l13.307-11.164c.783-.64 1.85-.498 2.42.284zM25.139 53.76c-.783-.569-1.921-.284-2.42.569l-8.68 15.075c-.499.854-.143 1.92.71 2.347L43.64 85.404l-2.704 4.623c-.498.853-.142 1.99.783 2.346l28.749 13.156a60.2 60.2 0 0 1 8.254-14.791zM3.862 94.72c.143-.996 1.139-1.564 2.064-1.351l62.976 16.427a62.3 62.3 0 0 0-2.704 16.782l-31.524-2.56a1.642 1.642 0 0 1-1.494-1.991l.925-5.263l-31.808-2.986c-.996-.071-1.637-.996-1.495-1.991l2.99-17.138zm-2.348 42.524c-.996.072-1.637.996-1.494 1.992l3.06 17.137c.142.996 1.138 1.565 2.063 1.351l30.883-8.035l.925 5.262c.143.996 1.139 1.565 2.064 1.351l30.456-8.39c-1.779-5.263-2.917-10.88-3.202-16.64l-64.826 5.972zM11.62 182.33c-.498-.853-.143-1.92.711-2.347l58.778-27.875c2.206 5.262 5.195 10.169 8.753 14.577L54.1 185.031c-.783.569-1.921.356-2.42-.498l-2.704-4.693l-26.257 18.133c-.783.57-1.922.285-2.42-.569l-8.752-15.075zm71.23-12.231L37.094 216.39c-.712.711-.64 1.849.142 2.489l13.378 11.164c.783.64 1.85.498 2.42-.284l18.501-26.027l4.127 3.485c.783.64 1.922.498 2.49-.356l17.933-26.026c-4.839-2.987-9.322-6.614-13.165-10.738zm-9.037 74.31c-.925-.355-1.352-1.421-.925-2.275L100 182.97c4.98 2.56 10.389 4.48 16.01 5.547l-7.97 30.577c-.213.925-1.28 1.494-2.205 1.138l-5.052-1.849l-8.468 30.791c-.285.925-1.281 1.494-2.206 1.138l-16.367-5.973zm46.68-55.11l-5.265 64.853c-.071.996.711 1.849 1.637 1.849h17.434c.996 0 1.779-.853 1.636-1.849l-2.561-31.787h5.336a1.72 1.72 0 0 0 1.708-1.848l-2.988-31.432c-3.06.498-6.191.712-9.393.712c-2.562 0-5.053-.143-7.543-.498m62.763-175.574c.427-.924 0-1.92-.925-2.275l-16.366-5.973c-.926-.356-1.922.213-2.206 1.137l-8.468 30.791l-5.053-1.848c-.925-.356-1.921.213-2.206 1.137l-7.97 30.578c5.693 1.138 11.03 3.058 16.011 5.547zm35.722 25.814L173.222 85.83a62 62 0 0 0-13.165-10.738l17.933-26.026c.569-.783 1.707-.996 2.49-.356l4.127 3.485l18.502-26.027c.57-.782 1.708-.925 2.42-.285l13.377 11.165c.783.64.783 1.778.143 2.489zm24.764 36.409c.925-.427 1.21-1.494.711-2.347L235.7 58.524c-.498-.853-1.637-1.066-2.42-.568l-26.257 18.133l-2.704-4.622c-.499-.854-1.637-1.138-2.42-.498l-25.76 18.347c3.558 4.408 6.476 9.315 8.753 14.577l58.778-27.875zm9.25 23.609l2.99 17.137c.142.996-.499 1.85-1.495 1.991l-64.826 6.045c-.285-5.831-1.424-11.378-3.203-16.64l30.457-8.391c.925-.285 1.921.355 2.063 1.35l.925 5.263l30.884-8.035c.925-.214 1.92.355 2.063 1.35zm-2.917 62.933c.925.213 1.921-.356 2.064-1.351L255.126 144c.143-.996-.498-1.849-1.494-1.991l-31.808-2.987l.925-5.262c.142-.996-.498-1.849-1.495-1.991l-31.523-2.56a62.3 62.3 0 0 1-2.704 16.782l62.976 16.427zM233.28 201.6c-.498.853-1.636 1.067-2.419.569l-53.583-36.978a60.2 60.2 0 0 0 8.254-14.791l28.749 13.156c.925.426 1.28 1.493.783 2.346l-2.704 4.622l28.89 13.654c.854.426 1.21 1.493.712 2.346zm-71.657-21.831l37.643 53.049c.57.782 1.708.924 2.42.284l13.306-11.164c.783-.64.783-1.778.143-2.49l-22.415-22.684l4.127-3.413c.783-.64.783-1.778.07-2.489l-22.557-22.186c-3.771 4.266-8.04 8.035-12.808 11.093zm-.356 72.249c-.925.355-1.921-.214-2.206-1.138l-17.22-62.72a61 61 0 0 0 15.868-6.044l13.592 28.515c.426.925 0 1.991-.926 2.276l-5.052 1.849l13.307 29.013c.427.924 0 1.92-.925 2.275l-16.367 5.974z"
															/>
														</svg>
													</div>
													{/* Microsoft Entra / Azure AD */}
													<div className="relative flex items-center justify-center size-6 border border-foreground/[0.08] bg-background shrink-0 opacity-60 transition-opacity duration-300 group-hover/card:opacity-100">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="10"
															height="10"
															viewBox="0 0 24 24"
														>
															<path
																fill="#0078D4"
																d="M13.05 4.24L6.56 18.05L2 18l5.09-8.76zm.7 1.09L22 19.76H6.74l9.3-1.66l-4.87-5.79z"
															/>
														</svg>
													</div>
													{/* SCIM / Directory Sync */}
													<div className="relative flex items-center justify-center size-6 border border-foreground/[0.08] bg-background text-[#10B981] shrink-0 opacity-60 transition-opacity duration-300 group-hover/card:opacity-100">
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
															<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
															<circle cx="9" cy="7" r="4" />
															<polyline points="16 11 18 13 22 9" />
														</svg>
													</div>
													{/* Generic IdP / Building */}
													<div className="relative flex items-center justify-center size-6 border border-foreground/[0.08] bg-background text-neutral-800 dark:text-neutral-200 opacity-60 transition-opacity duration-300 group-hover/card:opacity-100">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="10"
															height="10"
															viewBox="0 0 24 24"
														>
															<path
																fill="currentColor"
																d="M12 7V3H2v18h20V7zM6 19H4v-2h2zm0-4H4v-2h2zm0-4H4V9h2zm0-4H4V5h2zm4 12H8v-2h2zm0-4H8v-2h2zm0-4H8V9h2zm0-4H8V5h2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8zm-2-8h-2v2h2zm0 4h-2v2h2z"
															/>
														</svg>
													</div>
												</div>
												{/* +more */}
												<div className="flex items-center justify-center size-6 border border-dashed border-foreground/[0.1] text-foreground/35 dark:text-foreground/20">
													<span className="text-[8px] font-mono leading-none">
														+
													</span>
												</div>
											</div>
										)}
										{"agent" in feature && feature.agent && (
											<div className="mt-3 flex items-center h-5 px-2.5 border border-foreground/[0.06] bg-foreground/[0.015] font-mono text-[8px] gap-1">
												<span className="text-foreground/30 ">$</span>
												<span className="text-foreground/50 dark:text-foreground/30">
													agent
													<span className="text-foreground/30 ">.</span>
													auth
													<span className="text-foreground/30 ">()</span>
												</span>
												<span className="text-foreground/50 dark:text-foreground/10 mx-0.5">
													→
												</span>
												<span className="text-foreground/35 dark:text-foreground/20">
													sk-<span className="tracking-[0.08em]">••••</span>
												</span>
												<span className="text-foreground/40 dark:text-foreground/50">
													✓
												</span>
												<span className="inline-block w-px h-2.5 bg-foreground/30 animate-[blink_1s_steps(2)_infinite]" />
											</div>
										)}
										{"security" in feature && feature.security && (
											<div className="mt-3 relative overflow-hidden">
												<div className="flex items-center gap-1.5 font-mono text-[8px]">
													{/* Shield icon */}
													<div className="flex items-center justify-center size-5 border border-foreground/[0.08] bg-foreground/[0.02] shrink-0">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="10"
															height="10"
															viewBox="0 0 24 24"
															className="text-foreground/50 dark:text-foreground/30"
														>
															<path
																fill="currentColor"
																d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11z"
															/>
														</svg>
													</div>
													{/* Blocked */}
													<div className="flex items-center gap-1 px-1.5 py-0.5 border border-red-500/15 bg-red-500/[0.03] shrink-0">
														<span className="inline-block size-1 rounded-full bg-red-500/40" />
														<span className="text-red-500/40">blocked</span>
													</div>
													{/* Challenged */}
													<div className="flex items-center gap-1 px-1.5 py-0.5 border border-yellow-600/15 bg-yellow-600/[0.03] shrink-0">
														<span className="inline-block size-1 rounded-full bg-yellow-600/40" />
														<span className="text-yellow-600/40">
															challenged
														</span>
													</div>
													{/* Allowed */}
													<div className="flex items-center gap-1 px-1.5 py-0.5 border border-green-500/15 bg-green-500/[0.03] shrink-0">
														<span className="inline-block size-1 rounded-full bg-green-500/50" />
														<span className="text-green-500/50">allowed</span>
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
																	user: "John",
																	action: "created a session",
																},
																{
																	time: "10:48 AM",
																	user: "Sarah",
																	action: "updated profile",
																},
																{
																	time: "10:45 AM",
																	user: "Alex",
																	action: "joined organization",
																},
																{
																	time: "10:42 AM",
																	user: "Emma",
																	action: "revoked token",
																},
																{
																	time: "10:38 AM",
																	user: "Mike",
																	action: "enabled 2FA",
																},
															].map((event) => (
																<div
																	key={`${setIdx}-${event.time}-${event.user}`}
																	className="flex items-center gap-1.5 shrink-0 h-5 whitespace-nowrap"
																>
																	<span className="text-[8px] font-mono text-foreground/30 ">
																		{event.time}
																	</span>
																	<span className="text-[8px] font-mono text-foreground/50 dark:text-foreground/30 border-b border-dashed border-foreground/20">
																		{event.user}
																	</span>
																	<span className="text-[8px] font-mono text-foreground/35 dark:text-foreground/20">
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
