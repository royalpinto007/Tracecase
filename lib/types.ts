export type ToolCall = {
  name: string;
  args?: unknown;
  allowed?: boolean;
};

export type Suite = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type Run = {
  id: string;
  suite_id: string;
  label: string;
  model: string | null;
  prompt_version: string | null;
  total: number;
  passed: number;
  regressed: number;
  flagged: number;
  created_at: string;
};

export type Result = {
  id: string;
  run_id: string;
  case_name: string;
  input: unknown;
  output: string | null;
  expected: string | null;
  tool_calls: ToolCall[] | null;
  passed: boolean;
  flags: string[];
  latency_ms: number | null;
  created_at: string;
};

// Shape a CI job POSTs to /api/runs.
export type IngestPayload = {
  suite: string; // suite name; created on first sight
  label: string; // human label for this run, e.g. "PR #142 / opus-4.8"
  model?: string;
  promptVersion?: string;
  results: Array<{
    caseName: string;
    input?: unknown;
    output?: string;
    expected?: string;
    toolCalls?: ToolCall[];
    passed: boolean;
    flags?: string[];
    latencyMs?: number;
  }>;
};
