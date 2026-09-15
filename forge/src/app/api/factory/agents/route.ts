import { NextResponse } from "next/server";
import { listAgents } from "@/lib/paperclip";
import { deriveRuntime, seatOf } from "@/lib/runtime";

export const dynamic = "force-dynamic";

export async function GET() {
  const agents = await listAgents();
  const runtime = await deriveRuntime(agents);
  const stateByName = new Map(runtime.map((r) => [r.name, r.state]));
  return NextResponse.json({
    source: "live",
    agents: agents.map((a) => ({
      id: a.id, name: a.name, role: a.role ?? "", seat: seatOf(a),
      state: stateByName.get(a.name) ?? "idle", model: a.adapterConfig?.model ?? a.adapterType ?? "",
      spendMonthlyCents: a.spentMonthlyCents ?? 0, budgetMonthlyCents: a.budgetMonthlyCents ?? 0,
      lastHeartbeatAt: a.lastHeartbeatAt ?? null,
    })),
  });
}
