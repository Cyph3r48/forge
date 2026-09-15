// Paperclip client (:3100), board-token authenticated.
const BASE = (process.env.PAPERCLIP_API || "http://localhost:3100/api").replace(/\/$/, "");
const TOKEN = process.env.PAPERCLIP_TOKEN?.trim() || "";
const COMPANY = process.env.PAPERCLIP_COMPANY?.trim() || "";
const AUTH: Record<string, string> = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};

export function paperclipConfigured() {
  return Boolean(COMPANY && TOKEN);
}

export interface PcAgent {
  id: string; name: string; role?: string; title?: string; status?: string;
  adapterType?: string; adapterConfig?: { model?: string; provider?: string };
  budgetMonthlyCents?: number; spentMonthlyCents?: number; lastHeartbeatAt?: string | null;
}
export interface PcRun {
  id: string; agentId?: string; status?: string; startedAt?: string | null;
  finishedAt?: string | null; createdAt?: string;
  resultJson?: { text?: string; summary?: string } | null; stdoutExcerpt?: string; error?: string;
}
export interface PcIssue {
  id: string; title?: string; status?: string; identifier?: string;
  assigneeAgentId?: string | null; priority?: string;
}

async function j<T>(path: string, fallback: T, timeoutMs = 6000): Promise<T> {
  if (!paperclipConfigured()) return fallback;
  try {
    const r = await fetch(`${BASE}${path}`, { cache: "no-store", headers: AUTH, signal: AbortSignal.timeout(timeoutMs) });
    if (!r.ok) return fallback;
    return (await r.json()) as T;
  } catch {
    return fallback;
  }
}

export function getCompany() {
  return j<Record<string, unknown>>(`/companies/${COMPANY}`, {});
}
export function listAgents() {
  return j<PcAgent[]>(`/companies/${COMPANY}/agents`, []);
}
export function listRuns(limit = 40) {
  return j<PcRun[]>(`/companies/${COMPANY}/heartbeat-runs?limit=${limit}`, []);
}
export function listIssues() {
  return j<PcIssue[]>(`/companies/${COMPANY}/issues`, []);
}

// ponytail: createIssue body shape is the API's documented REST guess; verify against
// the live Paperclip on first deploy and fix the field names there if it differs.
export async function createIssue(input: { title: string; description: string; priority: string }): Promise<{ ok: true; issue: PcIssue } | { ok: false; error: string }> {
  if (!paperclipConfigured()) return { ok: false, error: "Paperclip not configured" };
  try {
    const r = await fetch(`${BASE}/companies/${COMPANY}/issues`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...AUTH },
      body: JSON.stringify({
        title: input.title,
        description: input.description,
        labels: ["factory:intake", `priority:${input.priority}`],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return { ok: false, error: `Paperclip rejected the issue (${r.status})` };
    const issue = (await r.json()) as PcIssue;
    return { ok: true, issue: { ...issue, status: issue.status ?? "factory:intake" } };
  } catch (e) {
    return { ok: false, error: `Paperclip unreachable: ${e instanceof Error ? e.message : "unknown"}` };
  }
}
