import { NextRequest, NextResponse } from "next/server";
import { db, checkIngestToken } from "@/lib/supabase";
import type { IngestPayload } from "@/lib/types";

export const runtime = "nodejs";

// POST /api/runs — a CI job posts one run of a suite after a prompt/model change.
// Tracecase upserts the suite, stores every result, diffs against the previous
// run of the same suite, and returns the regression/flag summary so CI can fail
// the build when something regressed.
export async function POST(req: NextRequest) {
  if (!checkIngestToken(req.headers.get("x-tracecase-token"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: IngestPayload;
  try {
    body = (await req.json()) as IngestPayload;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!body.suite || !body.label || !Array.isArray(body.results)) {
    return NextResponse.json(
      { error: "suite, label and results[] are required" },
      { status: 400 },
    );
  }

  const supabase = db();

  // Upsert suite by name.
  let suiteId: string;
  const { data: existing } = await supabase
    .from("tc_suites")
    .select("id")
    .eq("name", body.suite)
    .maybeSingle();
  if (existing) {
    suiteId = (existing as { id: string }).id;
  } else {
    const { data: created, error } = await supabase
      .from("tc_suites")
      .insert({ name: body.suite })
      .select("id")
      .single();
    if (error || !created) {
      return NextResponse.json(
        { error: "could not create suite", detail: error?.message },
        { status: 500 },
      );
    }
    suiteId = (created as { id: string }).id;
  }

  // Pull the previous run's per-case pass map for regression diffing.
  const { data: prevRun } = await supabase
    .from("tc_runs")
    .select("id")
    .eq("suite_id", suiteId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const prevPass = new Map<string, boolean>();
  if (prevRun) {
    const { data: prevResults } = await supabase
      .from("tc_results")
      .select("case_name, passed")
      .eq("run_id", (prevRun as { id: string }).id);
    for (const x of prevResults ?? []) {
      prevPass.set(
        (x as { case_name: string }).case_name,
        (x as { passed: boolean }).passed,
      );
    }
  }

  const total = body.results.length;
  const passed = body.results.filter((r) => r.passed).length;
  const flagged = body.results.filter((r) => (r.flags?.length ?? 0) > 0).length;
  const regressed = body.results.filter(
    (r) => prevPass.get(r.caseName) === true && !r.passed,
  ).length;

  const { data: run, error: runErr } = await supabase
    .from("tc_runs")
    .insert({
      suite_id: suiteId,
      label: body.label,
      model: body.model ?? null,
      prompt_version: body.promptVersion ?? null,
      total,
      passed,
      regressed,
      flagged,
    })
    .select("id")
    .single();

  if (runErr || !run) {
    return NextResponse.json(
      { error: "could not create run", detail: runErr?.message },
      { status: 500 },
    );
  }
  const runId = (run as { id: string }).id;

  const rows = body.results.map((r) => ({
    run_id: runId,
    case_name: r.caseName,
    input: r.input ?? null,
    output: r.output ?? null,
    expected: r.expected ?? null,
    tool_calls: r.toolCalls ?? null,
    passed: r.passed,
    flags: r.flags ?? [],
    latency_ms: r.latencyMs ?? null,
  }));

  const { error: resErr } = await supabase.from("tc_results").insert(rows);
  if (resErr) {
    return NextResponse.json(
      { error: "could not store results", detail: resErr.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    runId,
    total,
    passed,
    regressed,
    flagged,
    // CI convention: non-zero regressions or flags should fail the build.
    shouldFail: regressed > 0 || flagged > 0,
  });
}
