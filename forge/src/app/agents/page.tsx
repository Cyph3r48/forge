"use client";

import { useEffect, useState } from "react";
import { getAgents, type Agent } from "@/lib/client";
import { Zone } from "@/components/Zone";
import { StateBadge } from "@/components/badges";

const dollars = (c: number) => `$${(c / 100).toFixed(2)}`;
const fmt = (s: string | null) => (s ? new Date(s).toLocaleString() : "-");

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAgents()
      .then((d) => setAgents(d.agents))
      .catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className="error">Agents failed to load: {error}</p>;
  if (!agents) return <p className="empty">Loading agents...</p>;

  return (
    <div>
      <Zone title="Agents" sub="Who exists: roster, seats, spend against budget." />
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Seat</th>
              <th>State</th>
              <th>Model</th>
              <th>Spend</th>
              <th>Last heartbeat</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.seat || "-"}</td>
                <td>
                  <StateBadge state={a.state} />
                </td>
                <td>{a.model}</td>
                <td>
                  {dollars(a.spendMonthlyCents)} / {dollars(a.budgetMonthlyCents)}
                </td>
                <td>{fmt(a.lastHeartbeatAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {agents.length === 0 && <p className="empty">No agents yet.</p>}
      </div>
    </div>
  );
}