"use client";

import { useEffect, useState } from "react";
import { clearForgeToken, hasForgeToken, setForgeToken } from "@/lib/client";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [rejected, setRejected] = useState(false);

  useEffect(() => {
    setAuthenticated(hasForgeToken());
    const requireAuth = () => {
      setRejected(true);
      setAuthenticated(false);
    };
    window.addEventListener("forge-auth-required", requireAuth);
    return () => window.removeEventListener("forge-auth-required", requireAuth);
  }, []);

  if (authenticated === null) return null;

  if (!authenticated) {
    return (
      <main className="auth-panel">
        <form
          className="card"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            setForgeToken(String(form.get("token") ?? ""));
            setRejected(false);
            setAuthenticated(true);
          }}
        >
          <h1>Sign in to The Forge</h1>
          <p className="sub">Enter the access token configured on this server.</p>
          <label htmlFor="forge-token">Access token</label>
          <input id="forge-token" name="token" type="password" autoComplete="current-password" required autoFocus />
          {rejected && <p className="error" role="alert">That token was rejected.</p>}
          <button type="submit">Sign in</button>
        </form>
      </main>
    );
  }

  return (
    <>
      {children}
      <button
        className="auth-signout"
        type="button"
        onClick={() => {
          clearForgeToken();
          setAuthenticated(false);
        }}
      >
        Sign out
      </button>
    </>
  );
}
