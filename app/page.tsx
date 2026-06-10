import Link from "next/link";
import { db } from "@/lib/supabase";
import type { Run, Suite } from "@/lib/types";
import { DemoButton } from "@/components/DemoButton";

export const dynamic = "force-dynamic";

function pct(passed: number, total: number) {
  if (!total) return 0;
  return Math.round((passed / total) * 100);
}

const PER_PAGE = 12;

export default async function Home({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
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
  const suiteName = new Map<string, string>();
  for (const r of allRuns) {
    if (!latestBySuite.has(r.suite_id)) latestBySuite.set(r.suite_id, r);
  }

  const list = (suites ?? []) as Suite[];
  for (const s of list) suiteName.set(s.id, s.name);
  const totalRuns = allRuns.length;
  const totalRegressions = allRuns.reduce((a, r) => a + r.regressed, 0);
  const totalFlagged = allRuns.reduce((a, r) => a + r.flagged, 0);

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(totalRuns / PER_PAGE));
  const pageRuns = allRuns.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-10">
      <section className="space-y-3 animate-fade-up">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] uppercase tracking-widest text-muted">
          agent reliability
        </span>
        <h1 className="gradient-text text-balance text-4xl font-semibold tracking-tight sm:text-[2.9rem]">
          CI for your AI agents.
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-muted">
          Every prompt or model change is replayed against your test suites.
          Tracecase diffs the results, then flags regressions and unsafe tool
          calls before they reach production.
        </p>
        <div className="flex items-center gap-3 pt-1">
          <DemoButton />
          <span className="text-[12px] text-muted">
            triggers a sample run, watch it appear below
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 animate-fade-in sm:grid-cols-3">
        <Metric label="Suites" value={list.length} />
        <Metric label="Runs recorded" value={totalRuns} />
        <Metric
          label="Open regressions"
          value={totalRegressions + totalFlagged}
          tone={totalRegressions + totalFlagged > 0 ? "bad" : "good"}
        />
      </section>

      <HowItWorks />

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted">Suites</h2>
        {list.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="stagger grid gap-3 lg:grid-cols-2">
            {list.map((s) => {
              const run = latestBySuite.get(s.id);
              const rate = run ? pct(run.passed, run.total) : 0;
              return (
                <Link
                  key={s.id}
                  href={run ? `/runs/${run.id}` : "#"}
                  className="group glass hover-lift rounded-2xl p-5"
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

      {totalRuns > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted">Recent runs</h2>
          <div className="glass overflow-hidden rounded-2xl">
            {pageRuns.map((r) => (
              <Link
                key={r.id}
                href={`/runs/${r.id}`}
                className="flex items-center justify-between gap-3 border-b border-border-soft px-4 py-3 text-[13px] transition last:border-0 hover:bg-surface-2"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-mono text-text">{r.label}</span>
                  <span className="hidden truncate text-muted sm:inline">
                    {suiteName.get(r.suite_id) ?? ""}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {r.regressed > 0 && <Pill tone="bad">{r.regressed} reg</Pill>}
                  {r.flagged > 0 && <Pill tone="warn">{r.flagged} flag</Pill>}
                  <span
                    className={
                      r.passed === r.total ? "text-good" : "text-warn"
                    }
                  >
                    {r.passed}/{r.total}
                  </span>
                </span>
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} />
          )}
        </section>
      )}
    </div>
  );
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const linkCls =
    "rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] transition hover:border-accent/50 hover:text-text";
  const disabled = "pointer-events-none opacity-40";
  return (
    <nav className="flex items-center justify-between pt-1 text-muted">
      <a
        href={`/?page=${page - 1}`}
        className={`${linkCls} ${page <= 1 ? disabled : ""}`}
      >
        ← Newer
      </a>
      <span className="text-[12px]">
        Page {page} of {totalPages}
      </span>
      <a
        href={`/?page=${page + 1}`}
        className={`${linkCls} ${page >= totalPages ? disabled : ""}`}
      >
        Older →
      </a>
    </nav>
  );
}

function HowItWorks() {
  const steps = [
    { t: "CI posts a run", d: "After each prompt or model change, your pipeline posts the suite results." },
    { t: "Tracecase diffs it", d: "Compared against the previous run to find what changed." },
    { t: "Regressions flagged", d: "Cases that newly fail or make unsafe tool calls are surfaced." },
    { t: "Build gated", d: "shouldFail comes back so CI can block the merge." },
  ];
  const dur = 2.8;
  return (
    <section className="glass rounded-2xl p-5 sm:p-6 animate-fade-in">
      <h2 className="mb-6 flex items-center gap-2 text-sm font-medium text-muted">
        How it works
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          running
        </span>
      </h2>
      <div className="relative">
        <div className="flow-track" />
        <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-4">
          {steps.map((s, i) => (
            <div
              key={s.t}
              className="flex flex-col items-center text-center sm:items-start sm:text-left"
            >
              <div
                className="flow-ico grid h-[42px] w-[42px] place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-[15px] font-bold text-bg"
                style={{ animationDelay: `${((i * dur) / steps.length).toFixed(2)}s` }}
              >
                {i + 1}
              </div>
              <div className="mt-3 text-[13.5px] font-semibold">{s.t}</div>
              <div className="mt-1 text-[12px] leading-relaxed text-muted">
                {s.d}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
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
    <div className="glass rounded-2xl p-4">
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
