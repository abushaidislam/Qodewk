import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Qodewk — Git-Native Receipts for the AI Coding Agent Era",
  description: "Track code mutations, estimate token expenditures across Claude, Cursor, and Copilot, and share verifiable proof of work without exfiltrating source code.",
  openGraph: {
    title: "Qodewk — Proof of Shipment for AI Coding",
    description: "Git tells what changed. Telemetry tells what was consumed. Proof of work for the agentic era.",
    siteName: "Qodewk",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#faf9f5] text-[#3d3d3a] min-h-screen flex flex-col font-sans selection:bg-[#cc785c] selection:text-white">
        <header className="border-b border-[#e6dfd8] bg-[#faf9f5]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5 group">
              <span className="w-5 h-5 flex items-center justify-center font-bold text-lg text-[#141413] group-hover:rotate-45 transition-transform duration-300">
                ✱
              </span>
              <span className="font-serif-display text-2xl font-normal text-[#141413] tracking-tight">
                Qodewk
              </span>
              <span className="text-[11px] font-mono-receipt bg-[#efe9de] text-[#141413] px-2 py-0.5 rounded-full border border-[#e6dfd8] ml-1">
                v1.0
              </span>
            </a>

            <nav className="flex items-center gap-6 text-sm font-medium">
              <a href="#cli-guide" className="text-[#6c6a64] hover:text-[#141413] transition-colors">
                CLI & NPM
              </a>
              <a href="#how-it-works" className="text-[#6c6a64] hover:text-[#141413] transition-colors">
                How It Works
              </a>
              <a
                href="https://github.com/abushaidislam/Qodewk"
                target="_blank"
                rel="noreferrer"
                className="bg-[#cc785c] hover:bg-[#a9583e] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>

        <footer className="border-t border-[#e6dfd8] bg-[#181715] text-[#a09d96] py-12 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-white text-base">✱</span>
              <span className="text-[#faf9f5] font-serif-display text-lg">Qodewk</span>
              <span className="text-[#6c6a64] ml-2">Open-source AI development receipt layer.</span>
            </div>
            <div className="text-xs text-[#8e8b82] font-mono-receipt">
              Source code never leaves the local machine. Privacy by construction.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
