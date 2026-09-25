export type TransitionStatus =
  | "committed"
  | "pending-memory"
  | "pending-projection"
  | "rejected"
  | "conflict";

export type OwnerPrincipal = { kind: "owner"; id: string };

export type IntakeAcceptance = {
  decision: "accepted";
  scope: "in-scope";
  priority: "critical" | "high" | "medium" | "low";
  nextAction: string;
  evidenceRef: string;
};

export type TransitionInput = {
  issueId: string;
  outcomeId: string;
  principal: OwnerPrincipal | { kind: string; id: string };
  expectedStage: "factory:intake";
  requestedStage: "factory:architect";
  acceptance: IntakeAcceptance;
  evidence?: unknown;
  currentCommit?: string;
};

export type TransitionRecord = {
  transitionId: string;
  issueId: string;
  outcomeId: string;
  actorId: string;
  acceptance: IntakeAcceptance;
  inputFingerprint: string;
  fromStage: string;
  toStage: string;
  memoryStatus: "pending" | "confirmed";
  projectionStatus: "pending" | "confirmed";
};

export type ControlRecord = { transitions: Record<string, TransitionRecord> };

export type RevisionCasStore = {
  read: () => Promise<{ revisionId: string; record: ControlRecord }>;
  compareAndSet: (baseRevisionId: string, record: ControlRecord) => Promise<boolean>;
};

export type TransitionDependencies = {
  control: RevisionCasStore;
  confirmMemory: (transitionId: string, input: TransitionInput) => Promise<boolean>;
  readStage: (issueId: string) => Promise<string>;
  compareAndSetStage: (issueId: string, expected: string, requested: string) => Promise<boolean>;
};

export type TransitionResult = {
  status: TransitionStatus;
  transitionId?: string;
  reason: string;
};

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)]));
  }
  return value;
}

function fingerprint(input: TransitionInput) {
  return JSON.stringify(canonical({
    issueId: input.issueId,
    outcomeId: input.outcomeId,
    principal: input.principal,
    expectedStage: input.expectedStage,
    requestedStage: input.requestedStage,
    acceptance: input.acceptance,
    evidence: input.evidence,
    currentCommit: input.currentCommit,
  }));
}

function result(status: TransitionStatus, transitionId: string | undefined, reason: string): TransitionResult {
  return transitionId ? { status, transitionId, reason } : { status, reason };
}

async function save(control: RevisionCasStore, revisionId: string, record: ControlRecord) {
  try {
    return await control.compareAndSet(revisionId, record);
  } catch {
    return false;
  }
}

export async function transition(input: TransitionInput, deps: TransitionDependencies): Promise<TransitionResult> {
  if (input.principal.kind !== "owner" || !input.principal.id.trim()) return result("rejected", undefined, "owner authentication required");
  if (!input.issueId.trim() || !input.outcomeId.trim()) return result("rejected", undefined, "issue and outcome IDs are required");
  if (input.expectedStage !== "factory:intake" || input.requestedStage !== "factory:architect") {
    return result("rejected", undefined, "only owner-accepted Intake to Architect is supported");
  }
  const acceptance = input.acceptance;
  if (acceptance?.decision !== "accepted" || acceptance.scope !== "in-scope" ||
      !["critical", "high", "medium", "low"].includes(acceptance.priority) ||
      !acceptance.nextAction?.trim() || !acceptance.evidenceRef?.trim()) {
    return result("rejected", undefined, "complete owner acceptance is required");
  }

  const key = JSON.stringify([input.issueId, input.outcomeId]);
  const transitionId = `transition:${key}`;
  const inputFingerprint = fingerprint(input);
  let loaded: Awaited<ReturnType<RevisionCasStore["read"]>>;
  try { loaded = await deps.control.read(); } catch { return result("rejected", undefined, "control read failed"); }
  const existing = loaded.record.transitions[key];
  if (existing && existing.inputFingerprint !== inputFingerprint) return result("conflict", existing.transitionId, "outcome identity was reused with different input");
  if (existing?.memoryStatus === "confirmed" && existing.projectionStatus === "confirmed") {
    let stage: string;
    try { stage = await deps.readStage(input.issueId); } catch { return result("pending-projection", existing.transitionId, "stage read failed"); }
    return stage === input.requestedStage
      ? result("committed", existing.transitionId, "transition committed")
      : result("pending-projection", existing.transitionId, "committed transition label drifted");
  }
  if (!existing) {
    const pending = Object.values(loaded.record.transitions).find((item) => item.issueId === input.issueId && (item.memoryStatus !== "confirmed" || item.projectionStatus !== "confirmed"));
    if (pending) return result("rejected", pending.transitionId, "another transition is pending for this issue");
    let stage: string;
    try { stage = await deps.readStage(input.issueId); } catch { return result("rejected", undefined, "stage read failed"); }
    if (stage !== input.expectedStage) return result("rejected", undefined, "issue is not at the expected Intake stage");
  }

  let record = existing ?? {
    transitionId,
    issueId: input.issueId,
    outcomeId: input.outcomeId,
    actorId: input.principal.id,
    acceptance,
    inputFingerprint,
    fromStage: input.expectedStage,
    toStage: input.requestedStage,
    memoryStatus: "pending" as const,
    projectionStatus: "pending" as const,
  };

  if (!existing) {
    const next = { ...loaded.record, transitions: { ...loaded.record.transitions, [key]: record } };
    if (!(await save(deps.control, loaded.revisionId, next))) return result("conflict", transitionId, "stale control revision");
  }

  if (record.memoryStatus !== "confirmed") {
    let confirmed = false;
    try { confirmed = await deps.confirmMemory(record.transitionId, input); } catch { confirmed = false; }
    if (!confirmed) return result("pending-memory", record.transitionId, "transition memory is not confirmed");
    let refreshed: Awaited<ReturnType<RevisionCasStore["read"]>>;
    try { refreshed = await deps.control.read(); } catch { return result("pending-memory", record.transitionId, "control read failed after memory confirmation"); }
    const current = refreshed.record.transitions[key];
    if (!current || current.inputFingerprint !== inputFingerprint) return result("conflict", record.transitionId, "transition changed while confirming memory");
    record = { ...current, memoryStatus: "confirmed" };
    const next = { ...refreshed.record, transitions: { ...refreshed.record.transitions, [key]: record } };
    if (!(await save(deps.control, refreshed.revisionId, next))) return result("pending-memory", record.transitionId, "memory confirmed but record update needs retry");
  }

  let stage: string;
  try { stage = await deps.readStage(input.issueId); } catch { return result("pending-projection", record.transitionId, "stage read failed"); }
  if (stage === input.expectedStage) {
    let projected = false;
    try { projected = await deps.compareAndSetStage(input.issueId, input.expectedStage, input.requestedStage); } catch { projected = false; }
    if (!projected) return result("pending-projection", record.transitionId, "stage projection needs retry");
  } else if (stage !== input.requestedStage) {
    return result("pending-projection", record.transitionId, "stage does not match transition projection");
  }

  let refreshed: Awaited<ReturnType<RevisionCasStore["read"]>>;
  try { refreshed = await deps.control.read(); } catch { return result("pending-projection", record.transitionId, "control read failed before commit"); }
  const current = refreshed.record.transitions[key];
  if (!current || current.inputFingerprint !== inputFingerprint) return result("conflict", record.transitionId, "transition changed before commit");
  const committed = { ...current, memoryStatus: "confirmed" as const, projectionStatus: "confirmed" as const };
  const next = { ...refreshed.record, transitions: { ...refreshed.record.transitions, [key]: committed } };
  if (!(await save(deps.control, refreshed.revisionId, next))) return result("pending-projection", record.transitionId, "stage projected; commit record needs retry");
  return result("committed", record.transitionId, "transition committed");
}
