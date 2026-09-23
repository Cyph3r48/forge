import { NextResponse } from "next/server";
import { paperclipCompanyStatus, paperclipConfigured, paperclipDetail } from "@/lib/paperclip";
import { hermesStatus, hermesConfigured, hermesDetail } from "@/lib/hermes";

export const dynamic = "force-dynamic";

export async function GET() {
  const [companyResult, hermes] = await Promise.all([paperclipCompanyStatus(), hermesStatus()]);
  const company = companyResult.value;
  const { health, toolsets, skills } = hermes;
  const paperclipHealthy = companyResult.ok && Boolean(company.id ?? company.name);
  const hermesHealthy = hermesConfigured() && hermes.ok && health.status === "ok";
  const name = (t: unknown) => (typeof t === "object" && t !== null ? ((t as { name?: string; id?: string }).name ?? (t as { id?: string }).id ?? "") : String(t));
  return NextResponse.json({
    engines: {
      paperclip: { ok: paperclipConfigured() && paperclipHealthy, detail: paperclipDetail(paperclipConfigured(), paperclipHealthy, String(company.name ?? "connected"), "not configured") },
      hermes: { ok: hermesHealthy, detail: hermesDetail(hermesConfigured(), hermesHealthy, health.version, "unreachable") },
    },
    toolsets: toolsets.map((t) => ({ name: name(t), ok: true })),
    skills: skills.map((s) => ({ name: name(s), detail: "" })),
  });
}
