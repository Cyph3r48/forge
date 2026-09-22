import { NextResponse } from "next/server";
import { paperclipCompanyStatus, paperclipConfigured } from "@/lib/paperclip";
import { hermesStatus, hermesConfigured } from "@/lib/hermes";

export const dynamic = "force-dynamic";

export async function GET() {
  const [companyResult, hermes] = await Promise.all([paperclipCompanyStatus(), hermesStatus()]);
  const company = companyResult.value;
  const { health, toolsets, skills } = hermes;
  const name = (t: unknown) => (typeof t === "object" && t !== null ? ((t as { name?: string; id?: string }).name ?? (t as { id?: string }).id ?? "") : String(t));
  return NextResponse.json({
    engines: {
      paperclip: { ok: paperclipConfigured() && companyResult.ok && Boolean(company.id ?? company.name), detail: paperclipConfigured() ? String(company.name ?? "connected") : "not configured" },
      hermes: { ok: hermesConfigured() && hermes.ok && Boolean(health.status), detail: health.version ? `v${health.version}` : "unreachable" },
    },
    toolsets: toolsets.map((t) => ({ name: name(t), ok: true })),
    skills: skills.map((s) => ({ name: name(s), detail: "" })),
  });
}
