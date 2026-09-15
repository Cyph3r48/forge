import type { Engine } from "@/lib/client";

const BADGE_STATES = ["working", "blocked", "idle", "done"];

const STATE_CLASS: Record<string, string> = {
  running: "working",
  finished: "done",
  completed: "done",
  succeeded: "done",
  failed: "down",
  error: "down",
};

export function StateBadge({ state }: { state: string }) {
  const cls = BADGE_STATES.includes(state) ? state : (STATE_CLASS[state] ?? "idle");
  return <span className={`badge ${cls}`}>{state.replace("factory:", "")}</span>;
}

export function EngineBadge({ engine, name }: { engine: Engine; name: string }) {
  return <span className={`badge ${engine.ok ? "ok" : "down"}`}>{name}</span>;
}