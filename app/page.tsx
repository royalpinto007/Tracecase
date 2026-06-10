import Link from "next/link";
import { db } from "@/lib/supabase";
import type { Run, Suite } from "@/lib/types";

export const dynamic = "force-dynamic";

function pct(passed: number, total: number) {
  if (!total) return 0;
  return Math.round((passed / total) * 100);
}

export default async function Home() {
  const supabase = db();
  const { data: suites } = await supabase
    .from("tc_suites")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: runs } = await supabase
    .from("tc_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  const allRuns = (runs ?? []) as Run[];
  const latestBySuite = new Map<string, Run>();
  for (const r of allRuns) {
    if (!latestBySuite.has(r.suite_id)) latestBySuite.set(r.suite_id, r);
  }

  const list = (suites ?? []) as Suite[];
  const totalRuns = allRuns.length;
  const totalRegressions = allRuns.reduce((a, r) => a + r.regressed, 0);
  const totalFlagged = allRuns.reduce((a, r) => a + r.flagged, 0);

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] uppercase tracking-widest text-muted">
          agent reliability
        </span>
        <h1 className="text-balance text-3xl font-semibold tracking-tight">
          CI for your AI agents.
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-muted">
          Every prompt or model change is replayed against your test suites.
          Tracecase diffs the results, then flags regressions and unsafe tool
          calls before they reach production.
        </p>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <Metric label="Suites" value={list.length} />
        <Metric label="Runs recorded" value={totalRuns} />
        <Metric
          label="Open regressions"
          value={totalRegressions + totalFlagged}
          tone={totalRegressions + totalFlagged > 0 ? "bad" : "good"}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted">Suites</h2>
        {list.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-3">
            {list.map((s) => {
              const run = latestBySuite.get(s.id);
              const rate = run ? pct(run.passed, run.total) : 0;
              return (
                <Link
                  key={s.id}
                  href={run ? `/runs/${run.id}` : "#"}
                  className="group rounded-2xl border border-border bg-surface p-5 shadow-card transition hover:border-accent/50 hover:bg-surface-2"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-medium">{s.name}</div>
                      {s.description && (
                        <div className="mt-0.5 truncate text-[13px] text-muted">
                          {s.description}
                        </div>
                      )}
                      {run && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
                          <span className="text-muted">latest:</span>
                          <span className="rounded-md bg-bg px-2 py-0.5 font-mono text-text">
                            {run.label}
                          </span>
                          {run.regressed > 0 && (
                            <Pill tone="bad">{run.regressed} regressed</Pill>
                          )}
                          {run.flagged > 0 && (
                            <Pill tone="warn">{run.flagged} flagged</Pill>
                          )}
                          {run.regressed === 0 && run.flagged === 0 && (
                            <Pill tone="good">clean</Pill>
                          )}
                        </div>
                      )}
                    </div>
                    {run && <Gauge rate={rate} />}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "good" | "bad";
}) {
  const color =
    tone === "bad" ? "text-bad" : tone === "good" ? "text-good" : "text-text";
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <div className={`text-2xl font-semibold tabular-nums ${color}`}>
        {value}
      </div>
      <div className="mt-1 text-[12px] text-muted">{label}</div>
    </div>
  );
}

function Gauge({ rate }: { rate: number }) {
  const tone = rate === 100 ? "text-good" : rate >= 75 ? "text-warn" : "text-bad";
  const ring =
    rate === 100 ? "#3fb950" : rate >= 75 ? "#e3a008" : "#f85149";
  return (
    <div className="relative grid h-14 w-14 shrink-0 place-items-center">
      <div
        className="h-14 w-14 rounded-full"
        style={{
          background: `conic-gradient(${ring} ${rate * 3.6}deg, #26262e 0deg)`,
        }}
      />
      <div className="absolute grid h-11 w-11 place-items-center rounded-full bg-surface">
        <span className={`text-[13px] font-semibold tabular-nums ${tone}`}>
          {rate}%
        </span>
      </div>
    </div>
  );
}

function Pill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "good" | "bad" | "warn";
}) {
  const cls = {
    good: "bg-good/12 text-good",
    bad: "bg-bad/12 text-bad",
    warn: "bg-warn/12 text-warn",
  }[tone];
  return (
    <span className={`rounded-md px-2 py-0.5 font-medium ${cls}`}>
      {children}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-sm shadow-card">
      <p className="font-medium">No suites yet.</p>
      <p className="mt-1 text-muted">Post your first run from CI (or curl):</p>
      <pre className="mt-3 overflow-x-auto rounded-xl bg-bg p-4 text-xs leading-relaxed text-muted">
        {`curl -X POST "$TRACECASE_URL/api/runs" \\
  -H "x-tracecase-token: $TOKEN" \\
  -H "content-type: application/json" \\
  -d '{ "suite": "refund-agent", "label": "PR #142",
        "results": [ { "caseName": "...", "passed": true } ] }'`}
      </pre>
    </div>
  );
}
