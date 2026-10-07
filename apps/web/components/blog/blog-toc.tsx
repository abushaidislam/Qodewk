"use client";

import { useEffect, useRef, useState } from "react";
import type { TOCItemType } from "fumadocs-core/toc";
import { cn } from "@/lib/utils";

interface BlogTOCProps {
	items: TOCItemType[];
}

export function BlogTOC({ items }: BlogTOCProps) {
	// Filter top-level headings (depth 2), fallback to depth <= 3 if scarce
	const topLevelItems = items.filter((item) => item.depth <= 2);
	const displayItems =
		topLevelItems.length >= 2
			? topLevelItems
			: items.filter((item) => item.depth <= 3);

	const [activeId, setActiveId] = useState<string>("");
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (displayItems.length === 0) return;

		const ids = displayItems.map((item) => item.url.replace(/^#/, ""));
		const elements = ids
			.map((id) => document.getElementById(id))
			.filter(Boolean) as HTMLElement[];

		if (elements.length === 0) return;

		// Default active item to the first one
		if (!activeId && ids[0]) {
			setActiveId(ids[0]);
		}

		const handleScroll = () => {
			const scrollPos = window.scrollY + 140;
			let currentId = ids[0];

			for (const el of elements) {
				if (el.offsetTop <= scrollPos) {
					currentId = el.id;
				} else {
					break;
				}
			}

			setActiveId(currentId);
		};

		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [displayItems, activeId]);

	if (displayItems.length <= 1) return null;

	const handleMouseEnter = (e: React.PointerEvent) => {
		if (e.pointerType === "touch") return;
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		setIsOpen(true);
	};

	const handleMouseLeave = (e: React.PointerEvent) => {
		if (e.pointerType === "touch") return;
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => {
			setIsOpen(false);
		}, 250);
	};

	return (
		<aside
			aria-label="Table of contents"
			className={cn(
				"fixed top-1/2 -translate-y-1/2 right-3 sm:right-6 lg:right-8 z-40 hidden lg:flex flex-col items-end select-none pointer-events-auto transition-all duration-200",
				isOpen
					? "py-3 px-3 bg-background/80 dark:bg-black/60 backdrop-blur-[2px] rounded-xl"
					: "py-3 pr-1 pl-4 bg-transparent"
			)}
			onPointerEnter={handleMouseEnter}
			onPointerLeave={handleMouseLeave}
		>
			{/* "On this page" Header matching Better Auth */}
			<div
				className={cn(
					"flex items-center gap-1.5 text-xs text-foreground/50 dark:text-neutral-400 transition-all duration-200 overflow-hidden",
					isOpen
						? "opacity-100 max-h-6 mb-2 translate-x-0"
						: "opacity-0 max-h-0 mb-0 translate-x-2 pointer-events-none"
				)}
			>
				{/* 3-line Text icon matching Better Auth */}
				<svg
					className="size-3.5 shrink-0 text-foreground/40 dark:text-neutral-400"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					strokeLinecap="round"
				>
					<line x1="3" y1="6" x2="16" y2="6" />
					<line x1="3" y1="12" x2="21" y2="12" />
					<line x1="3" y1="18" x2="14" y2="18" />
				</svg>
				<span className="font-sans text-[12px] tracking-tight">On this page</span>
			</div>

			{/* List of headings with compact dot spacing and right-aligned title & dash indicator */}
			<div
				className={cn(
					"flex flex-col items-end transition-all duration-200",
					isOpen ? "gap-1" : "gap-0.5"
				)}
			>
				{displayItems.map((item) => {
					const id = item.url.replace(/^#/, "");
					const isActive = activeId === id;

					return (
						<a
							key={item.url}
							href={item.url}
							onClick={(e) => {
								e.preventDefault();
								const target = document.getElementById(id);
								if (target) {
									const top =
										target.getBoundingClientRect().top + window.scrollY - 90;
									window.scrollTo({ top, behavior: "smooth" });
									history.replaceState(null, "", `#${id}`);
									setActiveId(id);
								}
							}}
							className={cn(
								"group flex items-center justify-end gap-2 text-xs cursor-pointer transition-all duration-150",
								isOpen ? "h-6 py-0.5" : "h-3 py-0",
								isActive
									? "text-foreground dark:text-white font-medium"
									: "text-foreground/50 dark:text-neutral-400 hover:text-foreground dark:hover:text-neutral-200"
							)}
						>
							{/* Title text — slides/fades in to the left of the dash on hover */}
							<span
								className={cn(
									"text-right tracking-tight transition-all duration-200 truncate select-none leading-none",
									isOpen
										? "opacity-100 max-w-[240px] translate-x-0 pointer-events-auto"
										: "opacity-0 max-w-0 translate-x-2 pointer-events-none"
								)}
							>
								{item.title}
							</span>

							{/* Indicator: Compact dot when collapsed, Dash when expanded */}
							<div className="flex items-center justify-center w-3 h-full shrink-0">
								<span
									className={cn(
										"transition-all duration-200 shrink-0",
										isOpen
											? cn(
													"h-[1.5px] rounded-full",
													isActive
														? "w-3 bg-foreground dark:bg-white"
														: "w-2.5 bg-foreground/30 dark:bg-neutral-600 group-hover:bg-foreground/70 dark:group-hover:bg-neutral-300"
												)
											: cn(
													"rounded-full",
													isActive
														? "size-1.5 bg-foreground dark:bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]"
														: "size-1 bg-foreground/30 dark:bg-neutral-600 group-hover:scale-125 group-hover:bg-foreground/70"
												)
									)}
								/>
							</div>
						</a>
					);
				})}
			</div>
		</aside>
	);
}

