// Derived runtime states — the frozen /api/factory/runtime interface's v1 backing.
// No terminal layer: states are derived from Paperclip heartbeat-runs (and later Hermes runs).
import { listRuns, type PcAgent, type PcRun } from "./paperclip";

export interface RuntimeEntry {
  name: string; seat: string; state: "working" | "blocked" | "idle" | "done";
  source: "paperclip-run" | "hermes-run" | "none"; since: string | null; detail: string;
}

export function seatOf(agent: Pick<PcAgent, "role" | "title">): string {
  const role = `${agent.role ?? ""} ${agent.title ?? ""}`.toLowerCase();
  if (role.includes("foreman")) return "Foreman";
  if (role.includes("builder")) return "Builder";
  if (role.includes("tester")) return "Tester";
  if (role.includes("reviewer")) return "Reviewer";
  return "";
}

function latestRunFor(runs: PcRun[], agentId: string): PcRun | null {
  const mine = runs.filter((r) => r.agentId === agentId);
  if (mine.length === 0) return null;
  return mine.sort((a, b) => String(b.startedAt ?? b.createdAt ?? "").localeCompare(String(a.startedAt ?? a.createdAt ?? "")))[0];
}

function classify(run: PcRun | null): { state: RuntimeEntry["state"]; source: RuntimeEntry["source"]; since: string | null; detail: string } {
  if (!run) return { state: "idle", source: "none", since: null, detail: "no run in flight" };
  const status = (run.status ?? "").toLowerCase();
  const since = run.startedAt ?? run.createdAt ?? null;
  const terminal = new Set(["succeeded", "interrupted", "failed", "cancelled", "timed_out"]);
  if (terminal.has(status)) return { state: "done", source: "paperclip-run", since: run.finishedAt ?? since, detail: excerpt(run) || `${status} run finished` };
  // ponytail: blocked detection is heuristic on run status/output; upgrade to
  // polling hermes run status (waiting_for_approval) once run ids are tracked per agent.
  const output = `${run.resultJson?.summary ?? ""} ${run.resultJson?.text ?? ""} ${run.stdoutExcerpt ?? ""}`.toLowerCase();
  const looksBlocked = status.includes("waiting") || status.includes("blocked") || status.includes("question") ||
    /\?\s*$/.test(output.trim().slice(-80));
  if (looksBlocked) return { state: "blocked", source: "paperclip-run", since, detail: excerpt(run) || status || "waiting" };
  if (!run.finishedAt && (status === "running" || status === "in_progress" || status === "started" || status === "")) {
    return { state: "working", source: "paperclip-run", since, detail: excerpt(run) || `run ${run.id}` };
  }
  if (run.finishedAt) return { state: "done", source: "paperclip-run", since: run.finishedAt, detail: excerpt(run) || `run ${run.id} finished` };
  return { state: "working", source: "paperclip-run", since, detail: excerpt(run) || status || "active" };
}

function excerpt(run: PcRun): string {
  const s = run.resultJson?.summary || run.resultJson?.text || run.stdoutExcerpt || run.error || "";
  return s.slice(0, 120);
}

export async function deriveRuntime(agents: PcAgent[]): Promise<RuntimeEntry[]> {
  const runs = await listRuns(60);
  return agents.map((a) => {
    const c = classify(latestRunFor(runs, a.id));
    return { name: a.name, seat: seatOf(a), ...c };
  });
}
