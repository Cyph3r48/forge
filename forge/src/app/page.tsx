"use client";

import { useEffect, useState } from "react";
import { getStatus, type FactoryStatus } from "@/lib/client";
import { Zone } from "@/components/Zone";
import { EngineBadge, StateBadge } from "@/components/badges";

const dollars = (c: number) => `$${(c / 100).toFixed(2)}`;
const fmt = (s: string | null) => (s ? new Date(s).toLocaleString() : "-");

export default function StatusPage() {
  const [data, setData] = useState<FactoryStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStatus().then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className="error">Status failed to load: {error}</p>;
  if (!data) return <p className="empty">Loading status...</p>;

  const counts: Record<string, number> = {};
  for (const a of data.agents) counts[a.state] = (counts[a.state] ?? 0) + 1;

  return (
    <div>
      <Zone title={data.company?.name ?? "The Forge"} sub="Control plane for the Software Factory company." />
      <div className="card">
        <div className="grid">
          <div>
            <EngineBadge engine={data.engines.paperclip} name="paperclip" /> <span className="sub">{data.engines.paperclip.detail}</span>
          </div>
          <div>
            <EngineBadge engine={data.engines.hermes} name="hermes" /> <span className="sub">{data.engines.hermes.detail}</span>
          </div>
        </div>
      </div>
      <div className="card">
        <p>
          {Object.entries(counts).map(([state, n]) => (
            <span key={state}>
              <StateBadge state={state} /> {n}{" "}
            </span>
          ))}
          {data.agents.length === 0 && <span className="empty">No agents.</span>}
        </p>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Agent</th>
              <th>Engine</th>
              <th>Status</th>
              <th>Started</th>
              <th>Summary</th>
            </tr>
          </thead>
          <tbody>
            {data.runs.map((r) => (
              <tr key={r.id}>
                <td>{r.agentName}</td>
                <td>{r.engine}</td>
                <td>
                  <StateBadge state={r.status} />
                </td>
                <td>{fmt(r.startedAt)}</td>
                <td>{r.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.runs.length === 0 && <p className="empty">No recent runs.</p>}
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Issue</th>
              <th>Kind</th>
              <th>Waiting on</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {data.gates.map((g) => (
              <tr key={g.id}>
                <td>{g.issue}</td>
                <td>{g.kind}</td>
                <td>
                  <StateBadge state={g.waitingOn} />
                </td>
                <td>{g.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.gates.length === 0 && <p className="empty">No open gates.</p>}
      </div>
      <p className="sub">
        Spend this month: {dollars(data.agents.reduce((s, a) => s + a.spendMonthlyCents, 0))}
      </p>
    </div>
  );
}
