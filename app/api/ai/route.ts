import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GATEWAY = "https://n8n.agentpostmortem.com/webhook/ai-gw";
const SYSTEM =
  "You are the assistant for Tracecase, a CI / eval harness for AI agents. " +
  "Tracecase records agent test runs, diffs each run against the previous one, " +
  "and flags regressions and unsafe tool calls so CI can block bad prompt or model " +
  "changes before they ship. Answer questions about Tracecase and agent evaluation " +
  "clearly and concisely, in 1-4 short sentences.";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST,OPTIONS",
  "access-control-allow-headers": "content-type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  const { prompt, history, max } = (await req.json().catch(() => ({}))) as {
    prompt?: string;
    history?: { role: string; content: string }[];
    max?: number;
  };
  if (!prompt) {
    return NextResponse.json(
      { error: "prompt required" },
      { status: 400, headers: CORS },
    );
  }
  const secret = process.env.AI_GATEWAY_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "AI not configured" },
      { status: 503, headers: CORS },
    );
  }

  const convo = (Array.isArray(history) ? history.slice(-4) : [])
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");
  const full = convo ? `${convo}\nuser: ${prompt}` : prompt;

  try {
    const r = await fetch(GATEWAY, {
      method: "POST",
      headers: { "content-type": "application/json", "x-ai-secret": secret },
      body: JSON.stringify({ system: SYSTEM, prompt: full, max: typeof max === "number" ? max : undefined }),
    });
    const d = (await r.json()) as { reply?: string; error?: string };
    return NextResponse.json(
      { reply: d.reply || "", error: d.error },
      { headers: CORS },
    );
  } catch {
    return NextResponse.json(
      { error: "AI upstream unreachable" },
      { status: 502, headers: CORS },
    );
  }
}
