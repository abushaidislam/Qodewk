"use client";

import { Fragment, useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
	Check,
	Gauge,
	Headset,
	Info,
	Layers2,
	Minus,
	ShieldCheck,
	HelpCircle,
	ArrowRight,
} from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type Tier = {
	name: string;
	price: string;
	priceUnit: string | null;
	tagline: string;
	features: readonly (string | readonly [string, string])[];
	cta: { label: string; href: string };
	highlighted: boolean;
};

const tiers: readonly Tier[] = [
	{
		name: "Open Source",
		price: "$0",
		priceUnit: "/ forever",
		tagline: "For individual developers and open-source contributors.",
		features: [
			"Universal CLI (qodewk / npx qodewk)",
			"Local Git telemetry & SQLite (~/.qodewk)",
			"Git Notes commit records (refs/notes/qodewk)",
			["Monospace thermal receipts", "Box-drawing ANSI terminal output"],
			["Deterministic agent harvesters", "Claude, Cursor, Copilot, Cline"],
			["Dual-engine cost calculation", "Transcript + AST diff fallback"],
			"Salted HMAC-SHA256 public receipts",
			"Zero source code exfiltration guarantee",
			"Community support via GitHub",
		],
		cta: {
			label: "Install CLI",
			href: "/docs",
		},
		highlighted: false,
	},
	{
		name: "Team Sync",
		price: "$20",
		priceUnit: "/ month",
		tagline: "For engineering teams tracking agent token spend across repositories.",
		features: [
			"Everything in Open Source",
			"Private team receipt registry",
			["Centralized team dashboard", "Per-repo token & dollar breakdown"],
			["GitHub Actions sticky PR comments", "Automated diff receipts on PRs"],
			"Team agent attribution & usage benchmarks",
			"Token spike & cost anomaly alerts",
			["90-day team audit log retention", "Exportable CSV & JSONL"],
			"Priority email support (24h SLA)",
		],
		cta: {
			label: "Contact Sales",
			href: "/enterprise",
		},
		highlighted: true,
	},
	{
		name: "Enterprise",
		price: "Custom",
		priceUnit: null,
		tagline: "For organizations with bespoke VPC, compliance, or volume needs.",
		features: [
			"Air-gapped VPC & on-premise receipt registry",
			"Zero-egress telemetry ingestion",
			["Custom model rate cards", "Azure OpenAI, AWS Bedrock, Private LLMs"],
			"SAML 2.0 / SSO & SCIM directory sync",
			"SOC 2 Type II audit-ready receipt proofs",
			["Automated log drains", "Datadog, AWS S3, Splunk"],
			"Multi-organization RBAC & departmental billing",
			"Dedicated Slack channel & migration engineer",
			"99.9% uptime SLA & custom enterprise terms",
		],
		cta: {
			label: "Contact Enterprise",
			href: "/enterprise",
		},
		highlighted: false,
	},
];

type CellValue =
	| boolean
	| string
	| readonly [string, string]
	| { addon: string };

type CompareRow = {
	label: string;
	tip?: string;
	values: readonly [CellValue, CellValue, CellValue];
};

type CompareSection = {
	title: string;
	icon: LucideIcon;
	rows: readonly CompareRow[];
};

const compareSections: readonly CompareSection[] = [
	{
		title: "Telemetry & Core Engine",
		icon: Gauge,
		rows: [
			{ label: "Universal CLI (`qodewk`)", values: [true, true, true] },
			{
				label: "Local SQLite store (`~/.qodewk`)",
				values: [true, true, true],
			},
			{
				label: "Git Notes commit records",
				tip: "Writes cryptographic telemetry directly into refs/notes/qodewk without altering Git commit SHAs.",
				values: [true, true, true],
			},
			{
				label: "Supported agent harvesters",
				values: [
					"Claude, Cursor, Copilot, Cline",
					"All harvesters + custom hooks",
					"All + custom proprietary agents",
				],
			},
			{
				label: "Dual-engine cost calculation",
				tip: "Deterministic harvesting from agent transcripts with AST diff multiplier fallback.",
				values: [true, true, true],
			},
			{
				label: "Non-blocking Git hooks (<5ms)",
				tip: "Spawns detached background processes so commits and rebases never lag.",
				values: [true, true, true],
			},
			{
				label: "Raw source code exfiltration",
				tip: "Code never leaves developer workstations. Receipts transmit only metadata.",
				values: ["Never (0 bytes)", "Never (0 bytes)", "Air-gapped VPC"],
			},
		],
	},
	{
		title: "Team Governance & Storage",
		icon: Layers2,
		rows: [
			{
				label: "Receipt storage mode",
				values: [
					"Local & Public URL",
					"Private Team Cloud",
					"Self-Hosted VPC / On-Prem",
				],
			},
			{ label: "Team spend dashboard", values: [false, true, true] },
			{ label: "Multi-repository aggregation", values: [false, true, true] },
			{
				label: "GitHub Actions sticky PR comments",
				tip: "Composite GitHub Action that leaves an interactive digital receipt on pull requests.",
				values: [true, true, true],
			},
			{
				label: "Token spike & anomaly alerts",
				values: [false, true, true],
			},
			{
				label: "Custom model rate cards",
				tip: "Override token pricing for private fine-tunes, Azure OpenAI, or AWS Bedrock.",
				values: [
					false,
					{ addon: "Configurable JSON" },
					"Full Azure / Bedrock / Private proxy",
				],
			},
			{
				label: "Audit log retention",
				values: ["Local indefinitely", "90 days", "Custom / Unlimited"],
			},
			{
				label: "Log drains (Datadog, S3, Splunk)",
				values: [false, { addon: "$25 / month" }, true],
			},
		],
	},
	{
		title: "Security & Compliance",
		icon: ShieldCheck,
		rows: [
			{
				label: "Salted HMAC-SHA256 verification",
				tip: "Cryptographic proof that receipt metadata matches Git commit changes.",
				values: [true, true, true],
			},
			{
				label: "Source privacy guarantee",
				values: [true, true, true],
			},
			{ label: "Role-based access control (RBAC)", values: [false, true, true] },
			{ label: "SAML 2.0 / Single Sign-On", values: [false, false, true] },
			{ label: "SCIM directory provisioning", values: [false, false, true] },
			{
				label: "SOC 2 Type II compliance proofs",
				tip: "Digital receipts formatted for regulatory and IP provenance audits.",
				values: [false, false, true],
			},
		],
	},
	{
		title: "Support & Services",
		icon: Headset,
		rows: [
			{ label: "GitHub Issues & Community", values: [true, true, true] },
			{
				label: "Email support",
				values: [false, "Standard (24h)", "Priority (< 4h)"],
			},
			{
				label: "Dedicated Slack / Teams channel",
				values: [false, false, true],
			},
			{
				label: "Architecture & migration review",
				values: [false, false, true],
			},
			{
				label: "Uptime SLA",
				values: [false, false, "99.9% guaranteed"],
			},
		],
	},
];

const faqs = [
	{
		question: "Is the Qodewk CLI really free forever?",
		answer:
			"Yes, 100%. The Qodewk CLI, local SQLite telemetry storage (~/.qodewk), Git Notes engine (refs/notes/qodewk), and terminal monospace receipts are licensed under MIT and will always remain completely free and open source. There are no commit caps, no local repo limitations, and no credit card required.",
	},
	{
		question: "Does Qodewk charge for LLM token usage?",
		answer:
			"No. You pay your AI providers (Anthropic, OpenAI, Cursor, Google, etc.) directly. Qodewk is not a model proxy, middleman, or LLM reseller. Qodewk is purely an auditing and telemetry tool that inspects local Git diffs and provider session logs to measure and certify how much work was performed by agents.",
	},
	{
		question: "Does Qodewk ever upload my proprietary source code or diff hunks?",
		answer:
			"Never. Qodewk was engineered from day one with Privacy by Construction. Digital receipts contain only metadata: file counts, insertion/deletion line counts, token consumption numbers, and irreversible cryptographic hashes (HMAC-SHA256). Raw code files and diff hunks never leave your local machine or private VPC.",
	},
	{
		question: "When should our organization choose Team Sync vs Enterprise?",
		answer:
			"Choose Team Sync ($20/month) if you want a centralized web dashboard to track agent token spend across shared team repositories, automatic GitHub Actions sticky PR comments, and Slack cost anomaly alerts. Choose Enterprise if your organization requires an air-gapped on-premise VPC deployment (zero internet egress), custom internal LLM rate cards, SAML 2.0 / SSO, SCIM directory sync, or SOC 2 Type II legal audit receipts.",
	},
	{
		question: "Can Qodewk run in air-gapped environments or CI without network access?",
		answer:
			"Yes. In CI environments (when CI=true or using --local / --no-db flags), Qodewk operates in pure in-memory mode and performs zero outbound network requests. You can generate terminal and markdown receipts in completely isolated build pipelines.",
	},
	{
		question: "Can I cancel or switch plans at any time?",
		answer:
			"Yes. Team Sync subscriptions are billed on a flexible monthly basis without lock-in. You can upgrade, downgrade, or switch back to 100% free open-source mode at any time without losing any of your local Git Notes history.",
	},
];

const tierNames = ["Open Source", "Team Sync", "Enterprise"] as const;
type TierName = (typeof tierNames)[number];

function TierCard({ tier, index }: { tier: Tier; index: number }) {
	const { highlighted } = tier;

	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: 0.1 + index * 0.05, ease: "easeOut" }}
			className={cn(
				"relative flex flex-col bg-background mx-auto max-w-md w-full",
				"border border-foreground/10 lg:border-l-0 lg:border-r-0 first:lg:border-l last:lg:border-r",
				highlighted &&
					"lg:border! lg:border-foreground/25! lg:-my-4 lg:z-10 bg-muted/30",
			)}
		>
			<div className="flex flex-col flex-1 px-6 pt-6 pb-6">
				<div className="flex items-center justify-between mb-1">
					<h3 className="text-base text-foreground font-medium">{tier.name}</h3>
					{highlighted && (
						<span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
							Recommended
						</span>
					)}
				</div>
				<p className="text-[13px] text-foreground/60 leading-relaxed mb-5 min-h-[2.5em]">
					{tier.tagline}
				</p>

				<div className="flex items-baseline gap-1.5 pb-5 mb-5 border-b border-foreground/10">
					<span
						className={cn(
							"font-light tracking-tight text-foreground tabular-nums",
							tier.price === "Custom" ? "text-3xl" : "text-4xl",
						)}
					>
						{tier.price}
					</span>
					{tier.priceUnit && (
						<span className="text-[13px] text-foreground/55 font-mono">
							{tier.priceUnit}
						</span>
					)}
				</div>

				<ul className="flex-1 space-y-3 mb-6 text-[13px]">
					{tier.features.map((feature) => {
						const [primary, sub] = Array.isArray(feature)
							? feature
							: [feature as string, null];
						return (
							<li key={primary} className="flex flex-col">
								<div className="flex items-start gap-2.5">
									<Check
										className="w-3.5 h-3.5 mt-[3px] shrink-0 text-foreground/70"
										strokeWidth={2.5}
									/>
									<span className="text-foreground/85">{primary}</span>
								</div>
								{sub && (
									<span className="ml-[22px] text-foreground/50 text-[12px] leading-tight">
										{sub}
									</span>
								)}
							</li>
						);
					})}
				</ul>

				<a href={tier.cta.href} className="block mt-auto">
					<div
						className={cn(
							"w-full py-2.5 text-center text-[13px] rounded-sm transition-all duration-200 font-medium",
							highlighted
								? "bg-foreground text-background hover:opacity-90 shadow-sm"
								: "border border-foreground/15 text-foreground/85 hover:bg-foreground/5 hover:border-foreground/25",
						)}
					>
						{tier.cta.label}
					</div>
				</a>
			</div>
		</motion.div>
	);
}

function CompareCell({ value }: { value: CellValue }) {
	if (value === true) {
		return (
			<Check
				className="inline-block w-4 h-4 text-foreground/75"
				strokeWidth={2.5}
			/>
		);
	}
	if (value === false) {
		return <Minus className="inline-block w-3.5 h-3.5 text-foreground/30" />;
	}
	if (typeof value === "string") {
		return <span className="text-[13px] text-foreground/85">{value}</span>;
	}
	if (Array.isArray(value)) {
		return (
			<span className="flex flex-col">
				<span className="text-[13px] text-foreground/85">{value[0]}</span>
				<span className="text-[12px] text-foreground/50 leading-tight">
					{value[1]}
				</span>
			</span>
		);
	}
	const addon = (value as { addon: string }).addon;
	return (
		<span className="flex flex-col">
			<span className="text-[13px] text-foreground/85">{addon}</span>
			<span className="text-[12px] text-foreground/50 leading-tight font-mono">
				add-on
			</span>
		</span>
	);
}

function RowLabel({ row }: { row: CompareRow }) {
	return (
		<span className="inline-flex items-center gap-1.5">
			{row.label}
			{row.tip && (
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							aria-label={`More info about ${row.label}`}
							className="inline-flex items-center text-foreground/40 hover:text-foreground/70 transition-colors cursor-help"
						>
							<Info className="w-3.5 h-3.5" strokeWidth={1.75} />
						</button>
					</TooltipTrigger>
					<TooltipContent
						side="top"
						className="max-w-[260px] text-[12px] leading-relaxed"
					>
						{row.tip}
					</TooltipContent>
				</Tooltip>
			)}
		</span>
	);
}

function SectionHeaderRow({
	section,
	colSpan,
	withTopBorder,
}: {
	section: CompareSection;
	colSpan: number;
	withTopBorder: boolean;
}) {
	const Icon = section.icon;
	return (
		<tr>
			<th
				colSpan={colSpan}
				scope="colgroup"
				className={cn(
					"text-left text-[14px] text-foreground font-normal py-3 px-5 border-b border-foreground/10",
					withTopBorder && "border-t border-foreground/10",
				)}
			>
				<span className="inline-flex items-center gap-2">
					<Icon className="w-4 h-4 text-foreground/70" strokeWidth={1.75} />
					{section.title}
				</span>
			</th>
		</tr>
	);
}

function CompareTableDesktop() {
	return (
		<div className="hidden lg:block border border-foreground/10 rounded-sm">
			<div
				aria-hidden="true"
				className="sticky top-(--landing-topbar-height) z-10 grid grid-cols-[34%_22%_22%_22%] bg-background border-b border-foreground/10"
			>
				<div />
				{tierNames.map((name) => (
					<div
						key={name}
						className="text-left text-sm font-medium py-5 px-5 text-foreground"
					>
						{name}
					</div>
				))}
			</div>
			<table className="w-full table-fixed border-collapse">
				<colgroup>
					<col className="w-[34%]" />
					<col className="w-[22%]" />
					<col className="w-[22%]" />
					<col className="w-[22%]" />
				</colgroup>
				<thead className="sr-only">
					<tr>
						<th scope="col">Feature</th>
						{tierNames.map((name) => (
							<th key={name} scope="col">
								{name}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{compareSections.map((section, sIdx) => (
						<Fragment key={section.title}>
							<SectionHeaderRow
								section={section}
								colSpan={4}
								withTopBorder={sIdx > 0}
							/>
							{section.rows.map((row) => (
								<tr
									key={`${section.title}-${row.label}`}
									className="border-b border-foreground/6 last:border-b-0"
								>
									<td className="text-[13px] text-foreground/85 py-3 px-5 align-top">
										<RowLabel row={row} />
									</td>
									{row.values.map((cell, idx) => (
										<td
											key={`${row.label}-${tierNames[idx]}`}
											className="py-3 px-5 align-top"
										>
											<CompareCell value={cell} />
										</td>
									))}
								</tr>
							))}
						</Fragment>
					))}
				</tbody>
			</table>
		</div>
	);
}

function CompareTableMobile() {
	const [selected, setSelected] = useState<TierName>("Team Sync");
	const planIdx = tierNames.indexOf(selected);
	const selectedTier = tiers[planIdx];

	return (
		<div className="lg:hidden max-w-xl mx-auto">
			<div className="sticky top-(--landing-topbar-height) z-10 bg-background py-4 flex items-center justify-between gap-3">
				<Select
					value={selected}
					onValueChange={(v) => setSelected(v as TierName)}
				>
					<SelectTrigger
						aria-label="Select plan to compare"
						className="rounded-sm w-fit min-w-[140px] font-medium"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="rounded-sm font-medium">
						{tierNames.map((name) => (
							<SelectItem key={name} value={name} className="rounded-sm">
								{name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<a
					href={selectedTier.cta.href}
					className="shrink-0 inline-flex items-center px-4 h-9 text-[13px] bg-foreground text-background rounded-sm hover:opacity-90 transition-all font-medium"
				>
					{selectedTier.cta.label}
				</a>
			</div>

			<div className="border border-foreground/10 rounded-sm overflow-hidden">
				<table className="w-full table-fixed border-collapse">
					<thead className="sr-only">
						<tr>
							<th scope="col">Feature</th>
							<th scope="col">{selected}</th>
						</tr>
					</thead>
					<tbody>
						{compareSections.map((section, sIdx) => (
							<Fragment key={section.title}>
								<SectionHeaderRow
									section={section}
									colSpan={2}
									withTopBorder={sIdx > 0}
								/>
								{section.rows.map((row) => (
									<tr
										key={`${section.title}-${row.label}`}
										className="border-b border-foreground/6 last:border-b-0"
									>
										<td className="text-[13px] text-foreground/85 py-3 px-4 align-top w-[58%]">
											<RowLabel row={row} />
										</td>
										<td className="py-3 px-4 align-top text-right">
											<CompareCell value={row.values[planIdx]} />
										</td>
									</tr>
								))}
							</Fragment>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function CompareTable() {
	return (
		<TooltipProvider delayDuration={150}>
			<CompareTableDesktop />
			<CompareTableMobile />
		</TooltipProvider>
	);
}

/**
 * Frequently Asked Questions Section for Pricing
 */
function PricingFaq() {
	return (
		<div className="border border-foreground/10 rounded-sm bg-background p-6 sm:p-8 space-y-6">
			<div className="space-y-1 border-b border-foreground/10 pb-4">
				<div className="flex items-center gap-2">
					<HelpCircle className="w-4 h-4 text-primary" />
					<h3 className="text-base font-medium text-foreground tracking-tight">
						Frequently Asked Questions
					</h3>
				</div>
				<p className="text-[13px] text-foreground/60 leading-relaxed">
					Common questions about Qodewk open-source licensing, privacy boundaries,
					and enterprise options.
				</p>
			</div>

			<Accordion type="single" collapsible className="w-full space-y-2">
				{faqs.map((faq, index) => (
					<AccordionItem
						key={faq.question}
						value={`item-${index}`}
						className="border border-foreground/8 rounded-sm px-4 py-1 data-[state=open]:bg-foreground/[0.02]"
					>
						<AccordionTrigger className="text-[14px] text-foreground font-medium hover:no-underline hover:text-primary transition-colors py-3">
							{faq.question}
						</AccordionTrigger>
						<AccordionContent className="text-[13px] text-foreground/70 leading-relaxed pb-3 pt-1">
							{faq.answer}
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</div>
	);
}

export function PricingContent() {
	return (
		<div className="px-5 sm:px-6 lg:px-8 pb-20 space-y-14">
			{/* OSS framework note */}
			<motion.div
				initial={{ opacity: 0, y: 6 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.05 }}
				className="flex items-center gap-4 px-5 py-3.5 border border-foreground/10 rounded-sm bg-foreground/2"
			>
				<p className="flex-1 text-[13px] text-foreground/75 leading-relaxed">
					The Qodewk CLI and Git telemetry protocol are{" "}
					<span className="text-foreground font-medium">free and open source (MIT)</span>.
					Raw source code never leaves your developer workstation.
				</p>
				<a
					href="/docs"
					className="group shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-foreground/85 border border-foreground/15 rounded-sm hover:border-foreground/30 hover:bg-foreground/5 transition-all font-medium"
				>
					Docs
					<svg
						className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
						viewBox="0 0 10 10"
						fill="none"
						aria-hidden="true"
					>
						<path
							d="M1 9L9 1M9 1H3M9 1V7"
							stroke="currentColor"
							strokeWidth="1.3"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</a>
			</motion.div>

			{/* Tier cards — connected panel */}
			<section aria-label="Pricing tiers">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-0">
					{tiers.map((tier, index) => (
						<TierCard key={tier.name} tier={tier} index={index} />
					))}
				</div>
			</section>

			{/* Comparison table */}
			<motion.section
				aria-label="Plan comparison"
				initial={{ opacity: 0, y: 6 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.2 }}
			>
				<div className="mb-4">
					<h3 className="text-sm font-mono uppercase tracking-wider text-foreground/70">
						Detailed Capability Matrix
					</h3>
				</div>
				<CompareTable />
			</motion.section>

			{/* Pricing FAQ Section */}
			<motion.section
				aria-label="Pricing FAQ"
				initial={{ opacity: 0, y: 6 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.25 }}
			>
				<PricingFaq />
			</motion.section>

			{/* Enterprise CTA Footer Banner */}
			<motion.div
				initial={{ opacity: 0, y: 6 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.3 }}
				className="p-6 sm:p-8 rounded-sm border border-foreground/10 bg-foreground/2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
			>
				<div className="space-y-1">
					<h4 className="text-base font-medium text-foreground">
						Deploying across 50+ engineers?
					</h4>
					<p className="text-[13px] text-foreground/60 max-w-xl">
						Talk to us about air-gapped VPC ingestion, custom AWS Bedrock / Azure
						rate cards, and automated compliance receipts for your organization.
					</p>
				</div>
				<a
					href="/enterprise"
					className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-medium rounded-sm hover:opacity-90 transition-opacity"
				>
					Contact Enterprise
					<ArrowRight className="w-4 h-4" />
				</a>
			</motion.div>
		</div>
	);
}
