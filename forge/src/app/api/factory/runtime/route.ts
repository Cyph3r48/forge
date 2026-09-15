import { NextResponse } from "next/server";
import { listAgents } from "@/lib/paperclip";
import { deriveRuntime } from "@/lib/runtime";

export const dynamic = "force-dynamic";

export async function GET() {
  const agents = await listAgents();
  const entries = await deriveRuntime(agents);
  return NextResponse.json({ source: "live", agents: entries });
}
