import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tracecase — CI for AI agents",
  description:
    "Record agent runs, replay them against prompt and model changes, and catch regressions and unsafe tool calls before they ship.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-mono antialiased">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <Link href="/" className="text-sm font-semibold tracking-tight">
              tracecase<span className="text-accent">.</span>
            </Link>
            <span className="text-[11px] uppercase tracking-widest text-muted">
              CI for AI agents
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-5 py-10 text-[11px] text-muted">
          Record runs, replay against changes, catch regressions and unsafe tool
          calls.
        </footer>
      </body>
    </html>
  );
}
