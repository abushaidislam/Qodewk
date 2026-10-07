"use client";

const logos: { name: string; icon: React.ReactNode }[] = [
	{
		name: "Anthropic / Claude",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 16 16"
				fill="currentColor"
			>
				<path d="m6.96 15.2l.224-.992l.256-1.28l.208-1.024l.192-1.264l.112-.416l-.016-.032l-.08.016l-.96 1.312l-1.456 1.968l-1.152 1.216l-.272.112l-.48-.24l.048-.448l.272-.384l1.584-2.032l.96-1.264l.624-.72l-.016-.096h-.032l-4.224 2.752L2 12.48l-.336-.304l.048-.496l.16-.16l1.264-.88l3.152-1.76l.048-.16l-.048-.08h-.16L5.6 8.608L3.808 8.56l-1.552-.064l-1.52-.08l-.384-.08L0 7.856l.032-.24l.32-.208l.464.032l1.008.08l1.52.096l1.104.064l1.632.176h.256l.032-.112l-.08-.064l-.064-.064L4.64 6.56L2.944 5.44l-.896-.656l-.48-.336l-.24-.304l-.096-.672l.432-.48l.592.048l.144.032l.592.464l1.264.976L5.92 5.744l.24.192l.112-.064v-.048l-.112-.176l-.896-1.632l-.96-1.664l-.432-.688l-.112-.416a1.7 1.7 0 0 1-.064-.48l.496-.672L4.464 0l.672.096l.272.24l.416.944l.656 1.488l1.04 2.016l.304.608l.16.544l.064.176h.112v-.096l.08-1.152l.16-1.392l.16-1.792l.048-.512l.256-.608l.496-.32l.384.176l.32.464l-.048.288L9.84 2.4l-.384 1.936l-.24 1.312h.144l.16-.176l.656-.864l1.104-1.376l.48-.544l.576-.608l.368-.288h.688l.496.752l-.224.784l-.704.896l-.592.752l-.848 1.136l-.512.912l.048.064h.112l1.904-.416l1.04-.176l1.216-.208l.56.256l.064.256l-.224.544l-1.312.32l-1.536.304l-2.288.544l-.032.016l.032.048l1.024.096l.448.032h1.088l2.016.144l.528.352l.304.416l-.048.336l-.816.4l-1.088-.256l-2.56-.608l-.864-.208h-.128v.064l.736.72l1.328 1.2l1.68 1.552l.08.384l-.208.32l-.224-.032l-1.472-1.12l-.576-.496l-1.28-1.072h-.08v.112l.288.432l1.568 2.352l.08.72l-.112.224l-.416.144l-.432-.08l-.928-1.28l-.944-1.456l-.768-1.296l-.08.064l-.464 4.832l-.208.24l-.48.192l-.4-.304z" />
			</svg>
		),
	},
	{
		name: "OpenAI",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
			>
				<path
					fill="currentColor"
					d="M22.282 9.821a6 6 0 0 0-.516-4.91a6.05 6.05 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a6 6 0 0 0-3.998 2.9a6.05 6.05 0 0 0 .743 7.097a5.98 5.98 0 0 0 .51 4.911a6.05 6.05 0 0 0 6.515 2.9A6 6 0 0 0 13.26 24a6.06 6.06 0 0 0 5.772-4.206a6 6 0 0 0 3.997-2.9a6.06 6.06 0 0 0-.747-7.073M13.26 22.43a4.48 4.48 0 0 1-2.876-1.04l.141-.081l4.779-2.758a.8.8 0 0 0 .392-.681v-6.737l2.02 1.168a.07.07 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494M3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085l4.783 2.759a.77.77 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646M2.34 7.896a4.5 4.5 0 0 1 2.366-1.973V11.6a.77.77 0 0 0 .388.677l5.815 3.354l-2.02 1.168a.08.08 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.08.08 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667m2.01-3.023l-.141-.085l-4.774-2.782a.78.78 0 0 0-.785 0L9.409 9.23V6.897a.07.07 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.8.8 0 0 0-.393.681zm1.097-2.365l2.602-1.5l2.607 1.5v2.999l-2.597 1.5l-2.607-1.5Z"
				/>
			</svg>
		),
	},
	{
		name: "Google DeepMind",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="currentColor"
			>
				<path d="M12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24Z" />
			</svg>
		),
	},
	{
		name: "DeepSeek",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="currentColor"
			>
				<path d="M21.5 13.5c-.8-1.5-2.2-2.5-3.8-2.7c-.5-.1-1-.1-1.5 0c-.8-2.2-2.6-3.8-4.9-4.3c-3.1-.7-6.2.7-7.7 3.3c-1.5 2.6-1.1 5.9.9 8.1c1.8 2 4.6 2.8 7.2 2.1c2.1-.6 3.8-2.1 4.7-4.1c1.3.4 2.7.1 3.7-.8c1.1-1 1.6-2.5 1.4-4.1zM8.5 13c-.8 0-1.5-.7-1.5-1.5S7.7 10 8.5 10s1.5.7 1.5 1.5S9.3 13 8.5 13z" />
			</svg>
		),
	},
	{
		name: "Cursor",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="currentColor"
			>
				<path d="M11.503.131L1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23" />
			</svg>
		),
	},
	{
		name: "Windsurf",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="currentColor"
			>
				<path d="M3 14c2.5 0 3.5-2 6-2s3.5 2 6 2s3.5-2 6-2v2c-2.5 0-3.5 2-6 2s-3.5-2-6-2s-3.5 2-6 2v-2zm0-5c2.5 0 3.5-2 6-2s3.5 2 6 2s3.5-2 6-2v2c-2.5 0-3.5 2-6 2s-3.5-2-6-2s-3.5 2-6 2V9z" />
			</svg>
		),
	},
	{
		name: "Aider",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<polyline points="4 17 10 11 4 5" />
				<line x1="12" y1="19" x2="20" y2="19" />
			</svg>
		),
	},
	{
		name: "Antigravity",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
			>
				<circle cx="12" cy="12" r="3" fill="currentColor" />
				<ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-30 12 12)" />
			</svg>
		),
	},
];

function LogoItem({ name, icon }: { name: string; icon: React.ReactNode }) {
	return (
		<div className="flex items-center gap-2 px-5 shrink-0 text-foreground/60 dark:text-foreground/40 hover:text-foreground/90 transition-colors">
			<span className="shrink-0">{icon}</span>
			{name && (
				<span className="text-xs font-mono font-medium whitespace-nowrap tracking-wide">
					{name}
				</span>
			)}
		</div>
	);
}

export function TrustedBy() {
	return (
		<div className="space-y-3">
			<div className="relative overflow-hidden">
				{/* Fade masks on left and right */}
				<div
					className="pointer-events-none absolute inset-0 z-10"
					style={{
						maskImage:
							"linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
						WebkitMaskImage:
							"linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
					}}
				>
					<div className="flex animate-logo-marquee w-fit">
						{/* Repeat 2 times for seamless loop - translates exactly 50% */}
						{[0, 1].map((setIdx) => (
							<div key={setIdx} className="flex shrink-0">
								{logos.map((logo, i) => (
									<LogoItem
										key={`${setIdx}-${i}-${logo.name}`}
										name={logo.name}
										icon={logo.icon}
									/>
								))}
							</div>
						))}
					</div>
				</div>
				{/* Invisible spacer to maintain height */}
				<div className="flex invisible" aria-hidden="true">
					{logos.slice(0, 1).map((logo, i) => (
						<LogoItem key={`spacer-${i}`} name={logo.name} icon={logo.icon} />
					))}
				</div>
			</div>
		</div>
	);
}
