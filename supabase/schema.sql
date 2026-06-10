-- Tracecase schema. Runs in the shared AgentPostmortem Supabase project.
-- All tables prefixed tc_ to namespace them away from the postmortem tables.

create table if not exists tc_suites (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);

-- One run = one execution of a suite against a given agent config
-- (a model + prompt version). Rollups are denormalized for fast dashboards.
create table if not exists tc_runs (
  id             uuid primary key default gen_random_uuid(),
  suite_id       uuid not null references tc_suites(id) on delete cascade,
  label          text not null,            -- e.g. "v3 prompt / opus-4.8"
  model          text,
  prompt_version text,
  total          int  not null default 0,
  passed         int  not null default 0,
  regressed      int  not null default 0,  -- cases that passed in the prior run but fail now
  flagged        int  not null default 0,  -- cases with any safety flag
  created_at     timestamptz not null default now()
);

-- One result = one test case within a run.
create table if not exists tc_results (
  id          uuid primary key default gen_random_uuid(),
  run_id      uuid not null references tc_runs(id) on delete cascade,
  case_name   text not null,
  input       jsonb,
  output      text,
  expected    text,
  tool_calls  jsonb,        -- [{name, args, allowed}]
  passed      boolean not null default false,
  flags       text[] not null default '{}', -- e.g. {hallucination, unsafe_tool, over_budget}
  latency_ms  int,
  created_at  timestamptz not null default now()
);

create index if not exists tc_runs_suite_idx   on tc_runs(suite_id, created_at desc);
create index if not exists tc_results_run_idx   on tc_results(run_id);
create index if not exists tc_results_case_idx  on tc_results(run_id, case_name);

-- The app talks to Supabase with the service-role key from server code only,
-- so RLS can stay restrictive (no anon access).
alter table tc_suites  enable row level security;
alter table tc_runs    enable row level security;
alter table tc_results enable row level security;
