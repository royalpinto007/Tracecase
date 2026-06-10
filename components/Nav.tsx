import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-2 shadow-glow">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 18V6m0 12 5-5 4 3 7-8"
            stroke="#08080a"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-text">
        tracecase
      </span>
    </span>
  );
}

export function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-border-soft bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1.5 text-[13px] text-muted sm:gap-4">
          <Link
            href="/about"
            className="rounded-md px-2 py-1 transition hover:text-text"
          >
            About
          </Link>
          <Link
            href="/help"
            className="rounded-md px-2 py-1 transition hover:text-text"
          >
            Help
          </Link>
          <span className="hidden items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-good" />
            live
          </span>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
