"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Posts to the Better Auth sign-out endpoint, then lands back on /login. */
export function SignOutButton({ name }: { name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onSignOut = async () => {
    setBusy(true);
    try {
      // Better Auth 415s a bodyless POST — it requires the JSON content type.
      await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={() => void onSignOut()}
      disabled={busy}
      className="text-muted transition-colors hover:text-ink disabled:opacity-50"
      title={`Signed in as ${name}`}
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
