// Paperclip client (:3100), board-token authenticated.
const BASE = (process.env.PAPERCLIP_API || "http://localhost:3100/api").replace(/\/$/, "");
const TOKEN = process.env.PAPERCLIP_TOKEN?.trim() || "";
const COMPANY = process.env.PAPERCLIP_COMPANY?.trim() || "";
const AUTH: Record<string, string> = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FACTORY_STAGES = new Set(["factory:intake", "factory:architect", "factory:context", "factory:build", "factory:cleanup", "factory:review", "factory:ship"]);

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
  assigneeAgentId?: string | null; priority?: string; labelIds?: string[];
  labels?: Array<{ id?: string; name?: string }>;
}
export interface PcLabel {
  id: string; name: string;
}
export interface PcApproval {
  id: string; status?: string; type?: string;
}
type ReadResult<T> = { value: T; ok: boolean };
type Validator<T> = (value: unknown) => value is T;

const isObject: Validator<Record<string, unknown>> = (value): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function factoryStage(issue?: PcIssue | null) {
  if (!issue || !Array.isArray(issue.labels)) return "";
  const stages = issue.labels.map((label) => label?.name).filter((name): name is string => Boolean(name && FACTORY_STAGES.has(name)));
  return stages.length === 1 ? stages[0] : "";
}

export function deriveApprovalGates(approvals: PcApproval[], linkedIssues: Record<string, PcIssue[]>) {
  return approvals.flatMap((approval) => {
    if (approval.status !== "pending" || typeof approval.id !== "string") return [];
    const kind = typeof approval.type === "string" && approval.type.trim() ? approval.type.trim() : "approval";
    return (linkedIssues[approval.id] ?? []).flatMap((issue) =>
      typeof issue?.id === "string" && typeof issue.identifier === "string" && issue.identifier.trim()
        ? [{ id: `${approval.id}:${issue.id}`, issue: issue.identifier, kind, waitingOn: "human" as const, reason: `pending ${kind}` }]
        : [],
    );
  });
}

async function read<T>(path: string, fallback: T, valid: Validator<T>, timeoutMs = 6000): Promise<ReadResult<T>> {
  if (!paperclipConfigured()) return { value: fallback, ok: true };
  try {
    const r = await fetch(`${BASE}${path}`, { cache: "no-store", headers: AUTH, signal: AbortSignal.timeout(timeoutMs) });
    if (!r.ok) return { value: fallback, ok: false };
    const value = await r.json();
    return valid(value) ? { value, ok: true } : { value: fallback, ok: false };
  } catch {
    return { value: fallback, ok: false };
  }
}

const anyValue = <T>(_: unknown): _ is T => true;
async function j<T>(path: string, fallback: T, timeoutMs = 6000): Promise<T> {
  return (await read<T>(path, fallback, anyValue, timeoutMs)).value;
}

export function getCompany() {
  return j<Record<string, unknown>>(`/companies/${COMPANY}`, {});
}
export async function paperclipCompanyStatus() {
  return read<Record<string, unknown>>(`/companies/${COMPANY}`, {}, isObject);
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
export function listLabels() {
  return j<PcLabel[]>(`/companies/${COMPANY}/labels`, []);
}
export async function listApprovals() {
  const approvals = await j<unknown>(`/companies/${COMPANY}/approvals?status=pending`, []);
  return Array.isArray(approvals)
    ? approvals.filter((approval): approval is PcApproval => approval?.status === "pending" && typeof approval.id === "string" && UUID.test(approval.id))
    : [];
}
export function listApprovalIssues(approvalId: string) {
  if (!UUID.test(approvalId)) return Promise.resolve([]);
  return j<unknown>(`/approvals/${approvalId}/issues`, []).then((issues) => Array.isArray(issues) ? issues : []);
}

export async function paperclipStatus() {
  const [company, agents, issues, runs, approvals] = await Promise.all([
    read<Record<string, unknown>>(`/companies/${COMPANY}`, {}, isObject),
    read<PcAgent[]>(`/companies/${COMPANY}/agents`, [], Array.isArray),
    read<PcIssue[]>(`/companies/${COMPANY}/issues`, [], Array.isArray),
    read<PcRun[]>(`/companies/${COMPANY}/heartbeat-runs?limit=40`, [], Array.isArray),
    read<PcApproval[]>(`/companies/${COMPANY}/approvals?status=pending`, [], Array.isArray),
  ]);
  return {
    company: company.value, agents: agents.value, issues: issues.value, runs: runs.value,
    approvals: approvals.value.filter((approval) => approval?.status === "pending" && typeof approval.id === "string" && UUID.test(approval.id)),
    ok: [company, agents, issues, runs, approvals].every(({ ok }) => ok),
  };
}

export async function createIssue(input: { title: string; description: string; priority: string }): Promise<{ ok: true; issue: PcIssue; assignee: string; state: string } | { ok: false; error: string }> {
  if (!paperclipConfigured()) return { ok: false, error: "Paperclip not configured" };
  const [agents, labels] = await Promise.all([listAgents(), listLabels()]);
  if (!Array.isArray(agents)) return { ok: false, error: "Paperclip returned a malformed agents collection" };
  if (!Array.isArray(labels)) return { ok: false, error: "Paperclip returned a malformed labels collection" };
  const foremen = agents.filter((agent) => agent?.role === "Foreman");
  if (foremen.length !== 1) return { ok: false, error: `Expected exactly one Paperclip Foreman; found ${foremen.length}` };
  const intakeLabels = labels.filter((label) => label?.name === "factory:intake");
  if (intakeLabels.length !== 1) return { ok: false, error: `Expected exactly one Paperclip factory:intake label; found ${intakeLabels.length}` };

  const foreman = foremen[0];
  const intake = intakeLabels[0];
  if (typeof foreman.id !== "string" || !UUID.test(foreman.id) || typeof foreman.name !== "string" || !foreman.name.trim()) {
    return { ok: false, error: "Paperclip returned a malformed Foreman" };
  }
  if (typeof intake.id !== "string" || !UUID.test(intake.id)) return { ok: false, error: "Paperclip returned a malformed factory:intake label" };
  try {
    const r = await fetch(`${BASE}/companies/${COMPANY}/issues`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...AUTH },
      body: JSON.stringify({
        title: input.title,
        description: input.description,
        status: "todo",
        priority: input.priority,
        assigneeAgentId: foreman.id,
        labelIds: [intake.id],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return { ok: false, error: `Paperclip rejected the issue (${r.status})` };
    const issue = await r.json().catch(() => null) as PcIssue | null;
    if (!issue || typeof issue.id !== "string" || !issue.id.trim() || issue.status !== "todo" ||
        issue.priority !== input.priority || issue.assigneeAgentId !== foreman.id ||
        !Array.isArray(issue.labelIds) || !issue.labelIds.includes(intake.id)) {
      return { ok: false, error: "Paperclip returned a malformed created issue" };
    }
    return { ok: true, issue, assignee: foreman.name, state: factoryStage(issue) };
  } catch (e) {
    return { ok: false, error: `Paperclip unreachable: ${e instanceof Error ? e.message : "unknown"}` };
  }
}
