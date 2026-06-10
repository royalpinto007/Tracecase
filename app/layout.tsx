import type { Metadata } from "next";
import "./globals.css";
import { Sidebar, MobileBar } from "@/components/Sidebar";
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
        <div className="relative z-10 flex min-h-screen">
          <Sidebar />
          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <MobileBar />
            <main className="flex-1 px-5 py-8 md:px-10 lg:px-14">
              <div className="mx-auto w-full max-w-6xl">{children}</div>
            </main>
            <footer className="border-t border-border-soft px-5 py-5 md:px-10 lg:px-14">
              <div className="mx-auto w-full max-w-6xl font-mono text-[11px] text-muted">
                tracecase · record runs · replay changes · catch regressions
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
