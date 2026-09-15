import { NextResponse } from "next/server";
import { getCompany, paperclipConfigured } from "@/lib/paperclip";
import { hermesHealth, hermesSkills, hermesToolsets, hermesConfigured } from "@/lib/hermes";

export const dynamic = "force-dynamic";

export async function GET() {
  const [company, health, toolsets, skills] = await Promise.all([
    getCompany(), hermesHealth(), hermesToolsets(), hermesSkills(),
  ]);
  const name = (t: unknown) => (typeof t === "object" && t !== null ? ((t as { name?: string; id?: string }).name ?? (t as { id?: string }).id ?? "") : String(t));
  return NextResponse.json({
    engines: {
      paperclip: { ok: paperclipConfigured() && Boolean(company.id ?? company.name), detail: paperclipConfigured() ? String(company.name ?? "connected") : "not configured" },
      hermes: { ok: hermesConfigured() && Boolean(health.status), detail: health.version ? `v${health.version}` : "unreachable" },
    },
    toolsets: toolsets.map((t) => ({ name: name(t), ok: true })),
    skills: skills.map((s) => ({ name: name(s), detail: "" })),
  });
}
