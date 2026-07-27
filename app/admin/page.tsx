"use client";

import { useState, useEffect } from "react";
import AdminLogin from "@/components/AdminLogin";
import AdminPanel from "@/components/AdminPanel";

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/admin/check").then((r) => {
      if (r.ok) setLoggedIn(true);
      setChecking(false);
    });
  }, []);

  if (checking) return null;

  if (!loggedIn) return <AdminLogin onLogin={() => setLoggedIn(true)} />;

  return <AdminPanel />;
}
