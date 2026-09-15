"use client";

import { useEffect, useState } from "react";
import { createTask, getTasks, type Issue, type TaskInput } from "@/lib/client";
import { Zone } from "@/components/Zone";
import { StateBadge } from "@/components/badges";

export default function WorkPage() {
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskInput["priority"]>("medium");
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState<Issue | null>(null);
  const [postError, setPostError] = useState<string | null>(null);

  async function load() {
    try {
      const d = await getTasks();
      setIssues(d.issues);
    } catch (e) {
      setError(String(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPosting(true);
    setPosted(null);
    setPostError(null);
    const res = await createTask({ title, description, priority });
    if (res.ok) {
      setPosted(res.issue);
      setTitle("");
      setDescription("");
      setPriority("medium");
      await load();
    } else {
      setPostError(res.error);
    }
    setPosting(false);
  }

  return (
    <div>
      <Zone title="Work" sub="Paperclip issues across the seven pipeline states." />
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>State</th>
              <th>Assignee</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {issues?.map((i) => (
              <tr key={i.id}>
                <td>{i.identifier}</td>
                <td>{i.title}</td>
                <td>
                  <StateBadge state={i.state} />
                </td>
                <td>{i.assignee ?? "-"}</td>
                <td>{i.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {issues !== null && issues.length === 0 && <p className="empty">No issues yet.</p>}
        {issues === null && !error && <p className="empty">Loading issues...</p>}
        {error && <p className="error">Issues failed to load: {error}</p>}
      </div>
      <div className="card">
        <h1>File a task</h1>
        <p className="sub">Lands as a Paperclip issue in state factory:intake.</p>
        <form onSubmit={submit}>
          <p>
            <input
              style={{ width: "100%" }}
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </p>
          <p>
            <textarea
              style={{ width: "100%" }}
              rows={3}
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </p>
          <p>
            <select value={priority} onChange={(e) => setPriority(e.target.value as TaskInput["priority"])}>
              <option value="critical">critical</option>
              <option value="high">high</option>
              <option value="medium">medium</option>
              <option value="low">low</option>
            </select>{" "}
            <button type="submit" disabled={posting}>
              {posting ? "Filing..." : "File task"}
            </button>
          </p>
        </form>
        {posted && (
          <p>
            Filed: <strong>{posted.identifier}</strong> <StateBadge state={posted.state} />
          </p>
        )}
        {postError && <p className="error">Could not file task: {postError}</p>}
      </div>
    </div>
  );
}