"use client";

import { useCallback, useEffect, useState } from "react";
import { getStatus, type FactoryStatus } from "@/lib/client";
import { Zone } from "@/components/Zone";
import { EngineBadge, StateBadge } from "@/components/badges";

const fmt = (s: string | null) => (s ? new Date(s).toLocaleString() : "-");

export default function LivePage() {
  const [data, setData] = useState<FactoryStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getStatus()
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => setError(String(e)));
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 15_000);
    return () => clearInterval(id);
  }, [load]);

  if (error && !data) return <p className="error">Live failed to load: {error}</p>;
  if (!data) return <p className="empty">Loading live...</p>;

  return (
    <div>
      <Zone title="Live" sub="Current runs and gates, auto-refreshed every 15 seconds." />
      <div className="card">
        <p>
          <EngineBadge engine={data.engines.paperclip} name="paperclip" />{" "}
          <EngineBadge engine={data.engines.hermes} name="hermes" />
        </p>
        <table>
          <thead>
            <tr>
              <th>Run</th>
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
                <td>{r.id}</td>
                <td>{r.agentName}</td>
                <td>
                  <StateBadge state={r.engine} />
                </td>
                <td>
                  <StateBadge state={r.status} />
                </td>
                <td>{fmt(r.startedAt)}</td>
                <td>{r.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.runs.length === 0 && <p className="empty">No runs in flight.</p>}
      </div>
      <div className="card">
        <h1>Gates waiting</h1>
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
        {data.gates.length === 0 && <p className="empty">No gates waiting.</p>}
      </div>
      {error && <p className="error">Refresh failed: {error}</p>}
    </div>
  );
}
