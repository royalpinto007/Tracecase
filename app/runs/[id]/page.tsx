import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/supabase";
import type { Result, Run } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RunPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = db();

  const { data: run } = await supabase
    .from("tc_runs")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!run) notFound();
  const r = run as Run;

  const { data: results } = await supabase
    .from("tc_results")
    .select("*")
    .eq("run_id", r.id)
    .order("case_name", { ascending: true });

  // Find the previous run of the same suite to diff against.
  const { data: prev } = await supabase
    .from("tc_runs")
    .select("id, label, created_at")
    .eq("suite_id", r.suite_id)
    .lt("created_at", r.created_at)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let prevPass = new Map<string, boolean>();
  if (prev) {
    const { data: prevResults } = await supabase
      .from("tc_results")
      .select("case_name, passed")
      .eq("run_id", (prev as { id: string }).id);
    prevPass = new Map(
      (prevResults ?? []).map((x: { case_name: string; passed: boolean }) => [
        x.case_name,
        x.passed,
      ]),
    );
  }

  const rows = (results ?? []) as Result[];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-xs text-accent hover:underline">
          ← all suites
        </Link>
        <h1 className="mt-2 text-lg font-semibold">{r.label}</h1>
        <p className="mt-1 text-xs text-muted">
          {r.model ?? "model n/a"} · prompt {r.prompt_version ?? "n/a"} ·{" "}
          {new Date(r.created_at).toISOString().slice(0, 16).replace("T", " ")}
        </p>
        <div className="mt-3 flex gap-4 text-sm">
          <Stat label="passed" value={`${r.passed}/${r.total}`} tone="good" />
          <Stat label="regressed" value={r.regressed} tone="bad" />
          <Stat label="flagged" value={r.flagged} tone="warn" />
          {prev && (
            <span className="self-center text-xs text-muted">
              diffed vs {(prev as { label: string }).label}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((row) => {
          const wasPassing = prevPass.get(row.case_name);
          const regressed = wasPassing === true && !row.passed;
          const fixed = wasPassing === false && row.passed;
          return (
            <div
              key={row.id}
              className={`rounded-lg border p-4 ${
                row.passed ? "border-border" : "border-bad/40"
              } bg-surface`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{row.case_name}</span>
                <span className="flex items-center gap-2 text-xs">
                  {regressed && (
                    <span className="rounded bg-bad/15 px-2 py-0.5 text-bad">
                      REGRESSED
                    </span>
                  )}
                  {fixed && (
                    <span className="rounded bg-good/15 px-2 py-0.5 text-good">
                      FIXED
                    </span>
                  )}
                  {row.flags.map((f) => (
                    <span
                      key={f}
                      className="rounded bg-warn/15 px-2 py-0.5 text-warn"
                    >
                      {f}
                    </span>
                  ))}
                  <span className={row.passed ? "text-good" : "text-bad"}>
                    {row.passed ? "PASS" : "FAIL"}
                  </span>
                </span>
              </div>

              {(row.output || row.expected) && (
                <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                  {row.expected && (
                    <Field label="expected" value={row.expected} />
                  )}
                  {row.output && <Field label="output" value={row.output} />}
                </div>
              )}

              {row.tool_calls && row.tool_calls.length > 0 && (
                <div className="mt-3 text-xs">
                  <div className="mb-1 text-[11px] uppercase tracking-widest text-muted">
                    tool calls
                  </div>
                  <div className="space-y-1">
                    {row.tool_calls.map((tc, i) => (
                      <div
                        key={i}
                        className={`rounded px-2 py-1 ${
                          tc.allowed === false
                            ? "bg-bad/10 text-bad"
                            : "bg-bg text-text"
                        }`}
                      >
                        {tc.name}
                        {tc.allowed === false && " — not allowed"}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {row.latency_ms != null && (
                <div className="mt-2 text-[11px] text-muted">
                  {row.latency_ms} ms
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "good" | "bad" | "warn";
}) {
  const toneClass = { good: "text-good", bad: "text-bad", warn: "text-warn" }[
    tone
  ];
  const color = value === 0 || value === "0" ? "text-muted" : toneClass;
  return (
    <span className="rounded border border-border bg-surface px-3 py-1">
      <span className={`text-sm ${color}`}>{value}</span>{" "}
      <span className="text-[11px] text-muted">{label}</span>
    </span>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-bg p-2">
      <div className="mb-1 text-[11px] uppercase tracking-widest text-muted">
        {label}
      </div>
      <div className="whitespace-pre-wrap break-words text-text">{value}</div>
    </div>
  );
}
