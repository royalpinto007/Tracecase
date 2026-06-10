export const metadata = { title: "Help: Tracecase" };

const faqs = [
  {
    q: "How do I post a run?",
    a: "POST your suite results to /api/runs with the x-tracecase-token header. The suite is created automatically on first sight.",
  },
  {
    q: "How does it detect a regression?",
    a: "Each run is diffed against the previous run of the same suite. A case that passed before and fails now is marked REGRESSED.",
  },
  {
    q: "What counts as a flag?",
    a: "Any case you submit with a non-empty flags array (for example unsafe_tool or hallucination) is counted as flagged.",
  },
  {
    q: "How do I fail my CI build on a regression?",
    a: "The POST response includes shouldFail: true when there are regressions or flags. Wire that into your CI step's exit code.",
  },
];

export default function Help() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
      <header className="space-y-2">
        <span className="inline-block rounded-full border border-border bg-surface px-3 py-1 text-[11px] uppercase tracking-widest text-muted">
          help
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          Getting started
        </h1>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-card">
        <h2 className="mb-3 text-sm font-medium">Post your first run</h2>
        <pre className="overflow-x-auto rounded-xl bg-bg p-4 text-xs leading-relaxed text-muted">
          {`curl -X POST "$TRACECASE_URL/api/runs" \\
  -H "x-tracecase-token: $TOKEN" \\
  -H "content-type: application/json" \\
  -d '{
    "suite": "refund-agent",
    "label": "PR #142 / opus-4.8",
    "results": [
      { "caseName": "refund under limit", "passed": true },
      { "caseName": "refund over limit escalates",
        "passed": false, "flags": ["unsafe_tool"] }
    ]
  }'`}
        </pre>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted">FAQ</h2>
        <div className="stagger grid gap-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-border bg-surface p-4 shadow-card"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] font-medium">
                {f.q}
                <span className="text-muted transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
