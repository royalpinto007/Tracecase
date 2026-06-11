const suite = [
  ["Greenlite", "https://greenlite.aashinyraa.workers.dev", "https://greenlite.aashinyraa.workers.dev/favicon.svg"],
  ["Resolvd", "https://resolvd.aashinyraa.workers.dev", "https://resolvd.aashinyraa.workers.dev/icon.svg"],
  ["Bridgekit", "https://bridgekit.aashinyraa.workers.dev", "https://bridgekit.aashinyraa.workers.dev/icon.svg"],
  ["Webhands", "https://webhands.aashinyraa.workers.dev", "https://webhands.aashinyraa.workers.dev/icon.svg"],
  ["AgentPostmortem", "https://agentpostmortem.com", "https://agentpostmortem.com/icon"],
] as const;

export function SuiteLinks() {
  return (
    <div className="flex flex-wrap gap-2">
      {suite.map(([name, href, icon]) => (
        <a
          key={name}
          href={href}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-surface/60 px-2 py-1.5 text-[10px] text-muted transition hover:border-accent/40 hover:text-text"
        >
          <img src={icon} alt="" className="h-4 w-4 rounded object-cover" />
          {name}
        </a>
      ))}
    </div>
  );
}
