// Typed client for the Forge API contract (src/lib/api-contract.md).
// Plain fetch to relative /api/factory/... paths, never cached — routes are force-dynamic.

const TOKEN_KEY = "forge-auth-token";

export const hasForgeToken = () => typeof window !== "undefined" && Boolean(sessionStorage.getItem(TOKEN_KEY));

export function setForgeToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token.trim());
}

export function clearForgeToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

async function factoryFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const token = typeof window === "undefined" ? "" : sessionStorage.getItem(TOKEN_KEY);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(path, { ...init, headers, cache: "no-store" });
  if (response.status === 401 && typeof window !== "undefined") {
    clearForgeToken();
    window.dispatchEvent(new Event("forge-auth-required"));
  }
  return response;
}

export interface Engine {
  ok: boolean;
  detail: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  seat: string;
  state: string;
  model: string;
  spendMonthlyCents: number;
  budgetMonthlyCents: number;
  lastHeartbeatAt: string | null;
}

export interface Issue {
  id: string;
  identifier: string;
  title: string;
  state: string;
  assignee: string | null;
  priority: string;
}

export interface Run {
  id: string;
  agentName: string;
  engine: "paperclip" | "hermes";
  status: string;
  startedAt: string | null;
  finishedAt: string | null;
  summary: string;
}

export interface Gate {
  id: string;
  issue: string;
  kind: string;
  waitingOn: "human" | "reviewer" | "tester" | "builder";
  reason: string;
}

export interface FactoryStatus {
  source: "stub" | "live";
  company: { id: string; name: string } | null;
  agents: Agent[];
  issues: Issue[];
  runs: Run[];
  gates: Gate[];
  engines: { paperclip: Engine; hermes: Engine };
}

export interface RuntimeEntry {
  name: string;
  seat: string;
  state: "working" | "blocked" | "idle" | "done";
  source: "paperclip-run" | "hermes-run" | "none";
  since: string | null;
  detail: string;
}

export interface MemoryResponse {
  configured: boolean;
  agents: string[];
  entries: { id: string; agent: string; at: string; kind: string; text: string }[];
}

export interface ConnectionsResponse {
  engines: { paperclip: Engine; hermes: Engine };
  toolsets: { name: string; ok: boolean }[];
  skills: { name: string; detail: string }[];
}

export type TaskInput = {
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
};

async function get<T>(path: string): Promise<T> {
  const res = await factoryFetch(path);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return (await res.json()) as T;
}

export const getStatus = () => get<FactoryStatus>("/api/factory/status");
export const getAgents = () => get<{ source: string; agents: Agent[] }>("/api/factory/agents");
export const getTasks = () => get<{ source: string; issues: Issue[] }>("/api/factory/tasks");
export const getRuntime = () => get<{ source: string; agents: RuntimeEntry[] }>("/api/factory/runtime");
export const getMemory = () => get<MemoryResponse>("/api/factory/memory");
export const getConnections = () => get<ConnectionsResponse>("/api/factory/connections");

export async function createTask(input: TaskInput): Promise<{ ok: true; issue: Issue } | { ok: false; error: string }> {
  const res = await factoryFetch("/api/factory/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  return (await res.json()) as { ok: true; issue: Issue } | { ok: false; error: string };
}
