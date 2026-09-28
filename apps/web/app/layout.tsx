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
                v{process.env.NEXT_PUBLIC_QODEWK_VERSION ?? "0.0.0"}
              </span>
            </a>

            <nav className="hidden sm:flex items-center gap-5 text-sm font-medium">
              <a href="#how-it-works" className="text-[#6c6a64] hover:text-[#141413] transition-colors duration-200">
                How it works
              </a>
              <a href="#features" className="text-[#6c6a64] hover:text-[#141413] transition-colors duration-200">
                Features
              </a>
              <a href="#cli-guide" className="text-[#6c6a64] hover:text-[#141413] transition-colors duration-200">
                CLI
              </a>
              <a href="#faq" className="text-[#6c6a64] hover:text-[#141413] transition-colors duration-200">
                FAQ
              </a>
              <a
                href="https://github.com/abushaidislam/Qodewk"
                target="_blank"
                rel="noreferrer"
                className="bg-[#cc785c] hover:bg-[#a9583e] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer"
              >
                GitHub
              </a>
            </nav>
            <a
              href="https://github.com/abushaidislam/Qodewk"
              target="_blank"
              rel="noreferrer"
              className="sm:hidden bg-[#cc785c] hover:bg-[#a9583e] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer"
            >
              GitHub
            </a>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>

        <footer className="bg-[#181715] text-[#a09d96] py-16 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 text-sm">
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[#faf9f5] text-base" aria-hidden="true">✱</span>
                <span className="text-[#faf9f5] font-serif-display text-xl">Qodewk</span>
              </div>
              <p className="text-[#a09d96] max-w-sm leading-relaxed">
                Open-source receipt layer for the AI coding agent era. Git tells what changed. Telemetry tells what was consumed.
              </p>
            </div>
            <div className="md:col-span-3 space-y-3">
              <p className="text-[11px] font-mono uppercase tracking-[1.5px] text-[#8e8b82]">Product</p>
              <div className="flex flex-col gap-2">
                <a href="#how-it-works" className="hover:text-[#faf9f5] transition-colors duration-200">How it works</a>
                <a href="#features" className="hover:text-[#faf9f5] transition-colors duration-200">Features</a>
                <a href="#cli-guide" className="hover:text-[#faf9f5] transition-colors duration-200">CLI & NPM</a>
                <a href="#faq" className="hover:text-[#faf9f5] transition-colors duration-200">FAQ</a>
              </div>
            </div>
            <div className="md:col-span-4 space-y-3">
              <p className="text-[11px] font-mono uppercase tracking-[1.5px] text-[#8e8b82]">Trust</p>
              <p className="text-xs font-mono-receipt text-[#8e8b82] leading-relaxed">
                [✓] Source code was never uploaded to Qodewk. Privacy by construction.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href="https://github.com/abushaidislam/Qodewk"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#faf9f5] hover:text-[#cc785c] transition-colors duration-200"
                >
                  GitHub
                </a>
                <a
                  href="https://www.npmjs.com/package/qodewk"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#faf9f5] hover:text-[#cc785c] transition-colors duration-200"
                >
                  NPM
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
