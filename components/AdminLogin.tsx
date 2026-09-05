"use client";

import { useState } from "react";

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
      credentials: "include",
    });
    if (res.ok) {
      onLogin();
    } else {
      setError(true);
      setPassword("");
    }
  }

  return (
    <div className="admin-login">
      <h1>Admin Access</h1>
      <p>Enter the admin password to manage artworks.</p>
      <form onSubmit={submit}>
        <input
          type="password" value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false); }}
          placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
          autoFocus
        />
        {error && <p className="error">Incorrect password. Try again.</p>}
      </form>
    </div>
  );
}
