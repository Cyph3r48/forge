"use client";

import { useEffect, useState } from "react";
import { getRuntime, type RuntimeEntry } from "@/lib/client";
import { Zone } from "@/components/Zone";
import { StateBadge } from "@/components/badges";

const fmt = (s: string | null) => (s ? new Date(s).toLocaleString() : "-");

export default function RuntimePage() {
  const [agents, setAgents] = useState<RuntimeEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRuntime()
      .then((d) => setAgents(d.agents))
      .catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className="error">Runtime failed to load: {error}</p>;
  if (!agents) return <p className="empty">Loading runtime...</p>;

  return (
    <div>
      <Zone title="Runtime" sub="Derived agent states behind the frozen /api/factory/runtime interface." />
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Agent</th>
              <th>Seat</th>
              <th>State</th>
              <th>Source</th>
              <th>Since</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.name}>
                <td>{a.name}</td>
                <td>{a.seat || "-"}</td>
                <td>
                  <StateBadge state={a.state} />
                </td>
                <td>{a.source}</td>
                <td>{fmt(a.since)}</td>
                <td>{a.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {agents.length === 0 && <p className="empty">No runtime entries.</p>}
      </div>
    </div>
  );
}