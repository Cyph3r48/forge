// Hermes-style agent API client (:8642).
const BASE = (process.env.HERMES_API_URL || "").replace(/\/$/, "");
const KEY = process.env.HERMES_API_KEY?.trim() ?? process.env.API_SERVER_KEY?.trim() ?? "";
type ReadResult<T> = { value: T; ok: boolean };
type Validator<T> = (value: unknown) => value is T;
const isObject: Validator<Record<string, unknown>> = (value): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isEnvelope: Validator<{ data: unknown[] }> = (value): value is { data: unknown[] } =>
  isObject(value) && Array.isArray(value.data);

export function hermesConfigured() {
  return Boolean(BASE);
}

export function hermesDetail(configured: boolean, healthy: boolean, version: string | undefined, unconfigured: string) {
  return !configured ? unconfigured : healthy && version ? `v${version}` : "unreachable";
}

async function read<T>(path: string, fallback: T, valid: Validator<T>, timeoutMs = 8000): Promise<ReadResult<T>> {
  if (!BASE) return { value: fallback, ok: true };
  try {
    const r = await fetch(`${BASE}${path}`, {
      cache: "no-store",
      headers: KEY ? { Authorization: `Bearer ${KEY}` } : {},
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!r.ok) return { value: fallback, ok: false };
    const value = await r.json();
    return valid(value) ? { value, ok: true } : { value: fallback, ok: false };
  } catch {
    return { value: fallback, ok: false };
  }
}
const anyValue = <T>(_: unknown): _ is T => true;
async function h<T>(path: string, fallback: T, timeoutMs = 8000): Promise<T> {
  return (await read<T>(path, fallback, anyValue, timeoutMs)).value;
}

export interface HermesHealth { status?: string; platform?: string; version?: string }
export async function hermesHealth() {
  return (await read<HermesHealth>("/health", {}, isObject)).value;
}
export async function hermesStatus() {
  const [health, toolsets, skills] = await Promise.all([
    read<HermesHealth>("/health", {}, isObject),
    read<{ data: unknown[] }>("/v1/toolsets", { data: [] }, isEnvelope, 12000),
    read<{ data: unknown[] }>("/v1/skills", { data: [] }, isEnvelope, 12000),
  ]);
  return {
    health: health.value,
    toolsets: toolsets.value.data,
    skills: skills.value.data,
    ok: health.value.status === "ok" && [health, toolsets, skills].every(({ ok }) => ok),
  };
}

export async function hermesSkills() {
  const data = await h<{ data?: unknown[] }>("/v1/skills", { data: [] }, 12000);
  return Array.isArray(data.data) ? data.data : [];
}

export async function hermesToolsets() {
  const data = await h<{ data?: unknown[] }>("/v1/toolsets", { data: [] }, 12000);
  return Array.isArray(data.data) ? data.data : [];
}

export async function hermesSessions(limit = 20) {
  return h<unknown>(`/api/sessions?limit=${limit}`, []);
}
