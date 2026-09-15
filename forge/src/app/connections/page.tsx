"use client";

import { useEffect, useState } from "react";
import { getConnections, type ConnectionsResponse } from "@/lib/client";
import { Zone } from "@/components/Zone";
import { EngineBadge } from "@/components/badges";

export default function ConnectionsPage() {
  const [data, setData] = useState<ConnectionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getConnections().then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className="error">Connections failed to load: {error}</p>;
  if (!data) return <p className="empty">Loading connections...</p>;

  return (
    <div>
      <Zone title="Connections" sub="Engines, toolsets, and skills the factory can reach." />
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
        <h1>Toolsets</h1>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.toolsets.map((t) => (
              <tr key={t.name}>
                <td>{t.name}</td>
                <td>
                  <span className={`badge ${t.ok ? "ok" : "down"}`}>{t.ok ? "ok" : "down"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.toolsets.length === 0 && <p className="empty">No toolsets.</p>}
      </div>
      <div className="card">
        <h1>Skills</h1>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {data.skills.map((s) => (
              <tr key={s.name}>
                <td>{s.name}</td>
                <td>{s.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.skills.length === 0 && <p className="empty">No skills.</p>}
      </div>
    </div>
  );
}
