// Hermes-style agent API client (:8642).
const BASE = (process.env.HERMES_API_URL || "").replace(/\/$/, "");
const KEY = process.env.HERMES_API_KEY?.trim() ?? process.env.API_SERVER_KEY?.trim() ?? "";

export function hermesConfigured() {
  return Boolean(BASE);
}

async function h<T>(path: string, fallback: T, timeoutMs = 8000): Promise<T> {
  if (!BASE) return fallback;
  try {
    const r = await fetch(`${BASE}${path}`, {
      cache: "no-store",
      headers: KEY ? { Authorization: `Bearer ${KEY}` } : {},
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!r.ok) return fallback;
    return (await r.json()) as T;
  } catch {
    return fallback;
  }
}

export interface HermesHealth { status?: string; platform?: string; version?: string }
export async function hermesHealth() {
  return h<HermesHealth>("/health", {});
}

export async function hermesSkills() {
  const data = await h<{ data?: unknown[] }>("/v1/skills", { data: [] }, 12000);
  return data.data ?? [];
}

export async function hermesToolsets() {
  const data = await h<{ data?: unknown[] }>("/v1/toolsets", { data: [] }, 12000);
  return data.data ?? [];
}

export async function hermesSessions(limit = 20) {
  return h<unknown>(`/api/sessions?limit=${limit}`, []);
}