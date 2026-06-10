export const metadata = { title: "About: Tracecase" };

export default function About() {
  return (
    <article className="prose-invert mx-auto max-w-2xl space-y-6 animate-fade-up">
      <header className="space-y-2">
        <span className="inline-block rounded-full border border-border bg-surface px-3 py-1 text-[11px] uppercase tracking-widest text-muted">
          about
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          Why Tracecase exists
        </h1>
      </header>

      <p className="text-[15px] leading-relaxed text-muted">
        Teams ship AI agents and have no way to know that a prompt tweak or a
        model bump did not quietly break behavior. The agent still answers, it
        just answers worse, or calls a tool it should not. Most teams find out
        in production. Tracecase is the test layer that catches it first.
      </p>

      <Section title="What it does">
        <ul className="space-y-2 text-[14px] text-muted">
          <li>Records every agent run: inputs, outputs, tool calls, latency.</li>
          <li>Replays a suite against a new prompt or model and diffs the result.</li>
          <li>Flags regressions (passed before, fails now) and unsafe tool calls.</li>
          <li>Returns a shouldFail signal so CI can block the merge.</li>
        </ul>
      </Section>

      <Section title="How it is built">
        <p className="text-[14px] leading-relaxed text-muted">
          Next.js on Cloudflare Workers, a Supabase Postgres backend, and a
          token-protected ingest API. It is exercised continuously by an n8n
          workflow that posts fresh runs every 30 minutes, so the dashboard is
          always live.
        </p>
      </Section>

      <Section title="Who it is for">
        <p className="text-[14px] leading-relaxed text-muted">
          Anyone shipping LLM agents in production: support bots, coding agents,
          research agents. If a prompt change can break something, Tracecase
          tells you before your users do.
        </p>
      </Section>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <h2 className="mb-3 text-sm font-medium">{title}</h2>
      {children}
    </section>
  );
}
