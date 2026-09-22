import { NextResponse } from "next/server";
import { deriveApprovalGates, factoryStage, paperclipConfigured, paperclipDetail, paperclipStatus, type PcAgent, type PcIssue } from "@/lib/paperclip";
import { deriveRuntime, seatOf } from "@/lib/runtime";
import { hermesHealth, hermesConfigured } from "@/lib/hermes";

export const dynamic = "force-dynamic";

export async function GET() {
  const [paperclip, health] = await Promise.all([paperclipStatus(), hermesHealth()]);
  const { company, agents, issues, runs, approvals, approvalIssues } = paperclip;
  const runtime = await deriveRuntime(agents);
  const stateByName = new Map(runtime.map((r) => [r.name, r.state]));
  const configured = paperclipConfigured();

  const outAgents = agents.map((a: PcAgent) => ({
    id: a.id, name: a.name, role: a.role ?? "", seat: seatOf(a),
    state: stateByName.get(a.name) ?? "idle", model: a.adapterConfig?.model ?? a.adapterType ?? "",
    spendMonthlyCents: a.spentMonthlyCents ?? 0, budgetMonthlyCents: a.budgetMonthlyCents ?? 0,
    lastHeartbeatAt: a.lastHeartbeatAt ?? null,
  }));
  const outIssues = issues.map((i: PcIssue) => ({
    id: i.id, identifier: i.identifier ?? i.id, title: i.title ?? "",
    state: factoryStage(i), assignee: agents.find((a) => a.id === i.assigneeAgentId)?.name ?? null,
    priority: i.priority ?? "",
  }));
  const gates = deriveApprovalGates(approvals, approvalIssues);
  const paperclipHealthy = paperclip.ok && Boolean(company.id ?? agents.length);

  return NextResponse.json({
    source: "live",
    company: configured ? { id: String(company.id ?? ""), name: String(company.name ?? "unknown") } : null,
    agents: outAgents,
    issues: outIssues,
    runs: runs.slice(0, 20).map((r) => ({
      id: r.id,
      agentName: agents.find((a) => a.id === r.agentId)?.name ?? r.agentId ?? "",
      engine: "paperclip", status: r.status ?? "",
      startedAt: r.startedAt ?? null, finishedAt: r.finishedAt ?? null,
      summary: r.resultJson?.summary || r.stdoutExcerpt?.slice(0, 120) || r.error || "",
    })),
    gates,
    engines: {
      paperclip: { ok: configured && paperclipHealthy, detail: paperclipDetail(configured, paperclipHealthy, "connected", "set PAPERCLIP_TOKEN + PAPERCLIP_COMPANY") },
      hermes: { ok: hermesConfigured() && Boolean(health.status), detail: health.version ? `v${health.version}` : hermesConfigured() ? "unreachable" : "set HERMES_API_URL" },
    },
  });
}
