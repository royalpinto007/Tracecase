const suite = [
  {
    name: "Greenlite",
    href: "https://greenlite.agentpostmortem.com",
    icon: "https://greenlite.agentpostmortem.com/favicon.svg",
    role: "Human approval cockpit",
  },
  {
    name: "Resolvd",
    href: "https://resolvd.agentpostmortem.com",
    icon: "https://resolvd.agentpostmortem.com/icon.svg",
    role: "Support inbox operator",
  },
  {
    name: "Bridgekit",
    href: "https://bridgekit.agentpostmortem.com",
    icon: "https://bridgekit.agentpostmortem.com/icon.svg",
    role: "Scoped MCP tools",
  },
  {
    name: "Webhands",
    href: "https://webhands.agentpostmortem.com",
    icon: "https://webhands.agentpostmortem.com/icon.svg",
    role: "Browser-use agents",
  },
  {
    name: "AgentPostmortem",
    href: "https://agentpostmortem.com",
    icon: "https://agentpostmortem.com/icon",
    role: "Failure case studies",
  },
] as const;

export function SuiteLinks() {
  return (
    <section className="rounded-2xl border border-border-soft bg-surface/60 p-4">
      <div className="mb-3 max-w-xl">
        <p className="text-[11px] uppercase tracking-widest text-accent">
          Agent operating suite
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-muted">
          Tracecase is the test layer. The surrounding suite helps agents act,
          ask for approval, use tools, operate browsers, and learn from failures.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {suite.map((product) => (
          <a
            key={product.name}
            href={product.href}
            className="rounded-xl border border-border-soft bg-bg/45 p-3 transition hover:border-accent/40 hover:bg-surface-2"
          >
            <img
              src={product.icon}
              alt=""
              className="h-7 w-7 rounded-lg object-cover"
            />
            <div className="mt-2 text-[12px] font-semibold text-text">
              {product.name}
            </div>
            <div className="mt-0.5 text-[10px] text-muted">
              {product.role}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
