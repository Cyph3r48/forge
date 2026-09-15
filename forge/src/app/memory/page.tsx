"use client";

import { useEffect, useState } from "react";
import { getMemory, type MemoryResponse } from "@/lib/client";
import { Zone } from "@/components/Zone";

const fmt = (s: string) => new Date(s).toLocaleString();

export default function MemoryPage() {
  const [data, setData] = useState<MemoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMemory().then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className="error">Memory failed to load: {error}</p>;
  if (!data) return <p className="empty">Loading memory...</p>;

  if (!data.configured) {
    return (
      <div>
        <Zone title="Memory" sub="Agent memory" />
        <p className="empty">No memory provider connected.</p>
      </div>
    );
  }

  return (
    <div>
      <Zone title="Memory" sub="Entries per agent" />
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Agent</th>
              <th>At</th>
              <th>Kind</th>
              <th>Text</th>
            </tr>
          </thead>
          <tbody>
            {data.entries.map((e) => (
              <tr key={e.id}>
                <td>{e.agent}</td>
                <td>{fmt(e.at)}</td>
                <td>{e.kind}</td>
                <td>{e.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.entries.length === 0 && <p className="empty">No memory entries yet.</p>}
      </div>
    </div>
  );
}
