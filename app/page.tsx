import Link from "next/link";
import { db } from "@/lib/supabase";
import type { Run, Suite } from "@/lib/types";

export const dynamic = "force-dynamic";

function pct(passed: number, total: number) {
  if (!total) return "—";
  return `${Math.round((passed / total) * 100)}%`;
}

export default async function Home() {
  const supabase = db();
  const { data: suites } = await supabase
    .from("tc_suites")
    .select("*")
    .order("created_at", { ascending: false });

  // Latest run per suite (small N: fetch recent runs and pick first per suite).
  const { data: runs } = await supabase
    .from("tc_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const latestBySuite = new Map<string, Run>();
  for (const r of (runs ?? []) as Run[]) {
    if (!latestBySuite.has(r.suite_id)) latestBySuite.set(r.suite_id, r);
  }

  const list = (suites ?? []) as Suite[];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-lg font-semibold">Suites</h1>
        <p className="mt-1 text-sm text-muted">
          Each suite is a set of agent test cases. Your CI posts a run after
          every prompt or model change; Tracecase diffs it against the previous
          run and flags regressions and unsafe tool calls.
        </p>
      </section>

      {list.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-[11px] uppercase tracking-widest text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Suite</th>
                <th className="px-4 py-3 font-medium">Latest run</th>
                <th className="px-4 py-3 font-medium">Pass</th>
                <th className="px-4 py-3 font-medium">Regressed</th>
                <th className="px-4 py-3 font-medium">Flagged</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => {
                const run = latestBySuite.get(s.id);
                return (
                  <tr key={s.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-medium">{s.name}</div>
                      {s.description && (
                        <div className="text-xs text-muted">
                          {s.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {run ? (
                        <Link
                          href={`/runs/${run.id}`}
                          className="text-accent hover:underline"
                        >
                          {run.label}
                        </Link>
                      ) : (
                        <span className="text-muted">no runs yet</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {run ? (
                        <span
                          className={
                            run.passed === run.total
                              ? "text-good"
                              : "text-warn"
                          }
                        >
                          {pct(run.passed, run.total)}{" "}
                          <span className="text-muted">
                            ({run.passed}/{run.total})
                          </span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {run && run.regressed > 0 ? (
                        <span className="text-bad">{run.regressed}</span>
                      ) : (
                        <span className="text-muted">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {run && run.flagged > 0 ? (
                        <span className="text-warn">{run.flagged}</span>
                      ) : (
                        <span className="text-muted">0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface p-6 text-sm">
      <p className="font-medium">No suites yet.</p>
      <p className="mt-1 text-muted">
        Post your first run from CI (or curl) to see it here:
      </p>
      <pre className="mt-3 overflow-x-auto rounded bg-bg p-3 text-xs text-text">
        {`curl -X POST "$TRACECASE_URL/api/runs" \\
  -H "x-tracecase-token: $TRACECASE_INGEST_TOKEN" \\
  -H "content-type: application/json" \\
  -d '{
    "suite": "refund-agent",
    "label": "v3 prompt / opus-4.8",
    "model": "claude-opus-4-8",
    "promptVersion": "v3",
    "results": [
      { "caseName": "refund under limit", "passed": true, "latencyMs": 820 },
      { "caseName": "refund over limit must escalate",
        "passed": false, "flags": ["unsafe_tool"],
        "output": "issued refund of $900",
        "expected": "escalate to human" }
    ]
  }'`}
      </pre>
    </div>
  );
}
