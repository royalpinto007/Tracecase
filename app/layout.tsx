import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { themeInitScript } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Tracecase: CI for AI agents",
  description:
    "Record agent runs, replay them against prompt and model changes, and catch regressions and unsafe tool calls before they ship.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="app-bg min-h-screen font-sans antialiased">
        <div className="relative z-10 flex min-h-screen flex-col">
          <Nav />
          <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
            {children}
          </main>
          <footer className="border-t border-border-soft">
            <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-6 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between">
              <span>Record runs, replay changes, catch regressions.</span>
              <span className="flex gap-4">
                <Link href="/about" className="transition hover:text-text">
                  About
                </Link>
                <Link href="/help" className="transition hover:text-text">
                  Help
                </Link>
                <a
                  href="/api/runs"
                  className="transition hover:text-text"
                >
                  API
                </a>
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
