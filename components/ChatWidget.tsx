"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export function ChatWidget({
  name,
  greeting,
}: {
  name: string;
  greeting: string;
}) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: greeting },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    const next = [...msgs, { role: "user" as const, content: q }];
    setMsgs(next);
    setBusy(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: q, history: next.slice(-5) }),
      });
      const d = (await res.json()) as { reply?: string; error?: string };
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content: d.reply || `Sorry, the model is unavailable (${d.error}).`,
        },
      ]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "assistant", content: "Network error, please try again." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Ask AI"
        className="fixed bottom-5 right-5 z-50 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-bg shadow-glow transition hover:scale-105"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 3a9 9 0 0 0-9 9 9 9 0 0 0 1.3 4.6L3 21l4.6-1.3A9 9 0 1 0 12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <circle cx="8.5" cy="12" r="1.1" fill="currentColor" />
            <circle cx="12" cy="12" r="1.1" fill="currentColor" />
            <circle cx="15.5" cy="12" r="1.1" fill="currentColor" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-50 flex h-[460px] w-[min(92vw,370px)] flex-col overflow-hidden rounded-2xl glass shadow-lift">
          <div className="flex items-center gap-2 border-b border-border-soft px-4 py-3">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-accent to-accent-2 text-[11px] font-bold text-bg">
              AI
            </span>
            <span className="text-[13px] font-semibold">{name} assistant</span>
            <span className="ml-auto text-[10px] text-muted">llama3.2 · Ollama</span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-accent/15 text-text"
                      : "bg-bg text-text"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-bg px-3 py-2 text-[13px] text-muted">
                  thinking…
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="flex gap-2 border-t border-border-soft p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${name}…`}
              className="min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-[13px] outline-none focus:border-accent/60"
            />
            <button
              type="submit"
              disabled={busy}
              className="shrink-0 rounded-lg bg-gradient-to-br from-accent to-accent-2 px-3 text-[13px] font-semibold text-bg disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
