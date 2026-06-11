const suite = [
  {
    name: "Greenlite",
    href: "https://greenlite.agentpostmortem.com",
    mark: "G",
    accent: "from-fuchsia-500 to-purple-500",
    role: "Human approval cockpit",
  },
  {
    name: "Resolvd",
    href: "https://resolvd.agentpostmortem.com",
    mark: "R",
    accent: "from-sky-400 to-cyan-400",
    role: "Support inbox operator",
  },
  {
    name: "Bridgekit",
    href: "https://bridgekit.agentpostmortem.com",
    mark: "B",
    accent: "from-indigo-500 to-teal-400",
    role: "Scoped MCP tools",
  },
  {
    name: "Webhands",
    href: "https://webhands.agentpostmortem.com",
    mark: "W",
    accent: "from-cyan-400 to-blue-400",
    role: "Browser-use agents",
  },
  {
    name: "AgentPostmortem",
    href: "https://agentpostmortem.com",
    mark: "A",
    accent: "from-red-500 to-rose-500",
    role: "Failure case studies",
  },
] as const;

export function SuiteLinks() {
  return (
    <section className="rounded-2xl border border-border-soft bg-surface/50 p-4 shadow-[0_18px_60px_-42px_rgba(16,185,129,0.7)]">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="text-[11px] uppercase tracking-widest text-accent">
          Agent operating suite
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            Tracecase is the test layer. The surrounding suite helps agents act,
            ask for approval, use tools, operate browsers, and learn from failures.
          </p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {suite.map((product) => (
          <a
            key={product.name}
            href={product.href}
            className="group flex min-w-0 items-center gap-3 rounded-xl border border-border-soft bg-bg/45 p-3 transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface-2"
          >
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${product.accent} text-[12px] font-bold text-white shadow-lg shadow-black/20`}
            >
              {product.mark}
            </span>
            <div className="min-w-0">
              <div className="truncate text-[12px] font-semibold text-text transition group-hover:text-accent">
                {product.name}
              </div>
              <div className="truncate text-[10px] text-muted">
                {product.role}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
