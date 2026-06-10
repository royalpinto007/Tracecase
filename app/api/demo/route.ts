import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export const runtime = "nodejs";

// POST /api/demo, public, no token. Lets a website visitor trigger one sample
// eval run so the dashboard is interactive. Writes a clearly-labelled "demo
// (web)" run into the refund-agent suite, diffs it, and prunes to the cap.
export async function POST() {
  const supabase = db();

  const { data: suite } = await supabase
    .from("tc_suites")
    .select("id")
    .eq("name", "refund-agent")
    .maybeSingle();

  let suiteId = (suite as { id: string } | null)?.id;
  if (!suiteId) {
    const { data: created } = await supabase
      .from("tc_suites")
      .insert({
        name: "refund-agent",
        description: "Support agent that issues refunds within policy",
      })
      .select("id")
      .single();
    suiteId = (created as { id: string }).id;
  }

  // A bit of variation so demo runs differ (and sometimes regress).
  const r = () => Math.random();
  const results = [
    { case_name: "refund under limit", passed: true, flags: [] as string[] },
    {
      case_name: "refund over limit escalates",
      passed: r() > 0.4,
      flags: r() > 0.6 ? ["unsafe_tool"] : [],
    },
    { case_name: "order status lookup", passed: true, flags: [] as string[] },
    {
      case_name: "unknown intent",
      passed: r() > 0.3,
      flags: r() > 0.7 ? ["hallucination"] : [],
    },
  ];

  const { data: prevRun } = await supabase
    .from("tc_runs")
    .select("id")
    .eq("suite_id", suiteId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const prevPass = new Map<string, boolean>();
  if (prevRun) {
    const { data: pr } = await supabase
      .from("tc_results")
      .select("case_name, passed")
      .eq("run_id", (prevRun as { id: string }).id);
    for (const x of pr ?? [])
      prevPass.set(
        (x as { case_name: string }).case_name,
        (x as { passed: boolean }).passed,
      );
  }

  const total = results.length;
  const passed = results.filter((x) => x.passed).length;
  const flagged = results.filter((x) => x.flags.length > 0).length;
  const regressed = results.filter(
    (x) => prevPass.get(x.case_name) === true && !x.passed,
  ).length;

  const { data: run } = await supabase
    .from("tc_runs")
    .insert({
      suite_id: suiteId,
      label: "demo (web)",
      model: "claude-opus-4-8",
      prompt_version: "v3",
      total,
      passed,
      regressed,
      flagged,
    })
    .select("id")
    .single();
  const runId = (run as { id: string }).id;

  await supabase.from("tc_results").insert(
    results.map((x) => ({
      run_id: runId,
      case_name: x.case_name,
      passed: x.passed,
      flags: x.flags,
      latency_ms: 600 + Math.floor(Math.random() * 400),
    })),
  );

  // Prune to the cap (keep newest 50).
  const CAP = 50;
  const { data: edge } = await supabase
    .from("tc_runs")
    .select("created_at")
    .order("created_at", { ascending: false })
    .range(CAP, CAP);
  const cutoff = (edge as { created_at: string }[] | null)?.[0]?.created_at;
  if (cutoff) await supabase.from("tc_runs").delete().lt("created_at", cutoff);

  return NextResponse.json({ ok: true, runId, passed, total, regressed });
}
