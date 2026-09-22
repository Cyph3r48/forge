import { NextResponse } from "next/server";
import { createIssue, factoryStage, listIssues, listAgents, paperclipConfigured } from "@/lib/paperclip";

export const dynamic = "force-dynamic";

export async function GET() {
  const [issues, agents] = await Promise.all([listIssues(), listAgents()]);
  return NextResponse.json({
    source: "live",
    issues: issues.map((i) => ({
      id: i.id, identifier: i.identifier ?? i.id, title: i.title ?? "", state: factoryStage(i),
      assignee: agents.find((a) => a.id === i.assigneeAgentId)?.name ?? null, priority: i.priority ?? "",
    })),
  });
}

export async function POST(req: Request) {
  if (!paperclipConfigured()) {
    return NextResponse.json({ ok: false, error: "Paperclip not configured (PAPERCLIP_TOKEN, PAPERCLIP_COMPANY)" }, { status: 503 });
  }
  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ ok: false, error: "title is required" }, { status: 400 });
  const priority = ["critical", "high", "medium", "low"].includes(body?.priority) ? body.priority : "medium";
  const description = typeof body?.description === "string" ? body.description : "";
  const result = await createIssue({ title, description, priority });
  if (!result.ok) return NextResponse.json(result, { status: 502 });
  const issue = result.issue;
  return NextResponse.json({
    ok: true,
    issue: {
      id: issue.id, identifier: issue.identifier ?? issue.id, title,
      state: factoryStage(issue), assignee: result.assignee, priority,
    },
  });
}
