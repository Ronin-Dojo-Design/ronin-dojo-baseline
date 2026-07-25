"use client";

/**
 * /login — the Mammoth CRM sign-in surface (SESSION_0632). The Better Auth email+password API
 * has existed since ADR 0038 D5, but no UI ever fronted it — the 0582 UAT signed in via scripted
 * fetches, so a human operator had literally no way in. This page closes that gap: sign in, or
 * create the account first (open sign-up mirrors the server posture — internal CRM, no email
 * verification until a sender is wired; `requireOwner` materializes the owner record on the first
 * authenticated action).
 *
 * Talks straight to the Better Auth endpoints with fetch — no extra client dep for two forms.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const fieldClass =
  "w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30";

const primaryButtonClass =
  "rounded-md bg-primary px-4 py-2 text-sm font-semibold text-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover disabled:cursor-not-allowed disabled:opacity-50";

type Mode = "sign-in" | "sign-up";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const endpoint = mode === "sign-in" ? "/api/auth/sign-in/email" : "/api/auth/sign-up/email";
    const body =
      mode === "sign-in"
        ? { email, password }
        : { email, password, name: name.trim() || email.split("@")[0] };
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const detail = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(
          detail?.message ??
            (mode === "sign-in"
              ? "Sign-in failed — check the email and password."
              : "Sign-up failed — is the account already created?"),
        );
        return;
      }
      router.push("/app");
      router.refresh();
    } catch {
      setError("Could not reach the auth service — is the server running?");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5 py-10">
      <Link href="/" className="font-display text-lg font-bold tracking-wide">
        MAMMOTH<span className="text-primary">.</span>crm
      </Link>
      <h1 className="mt-6 font-display text-2xl font-bold">
        {mode === "sign-in" ? "Sign in" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {mode === "sign-in"
          ? "Email and password — no magic links on this app."
          : "First time here? Create the account, then you land on the pipeline."}
      </p>

      <form onSubmit={(event) => void onSubmit(event)} className="mt-6 flex flex-col gap-4">
        {mode === "sign-up" ? (
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold text-muted">Name</span>
            <input
              className={fieldClass}
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        ) : null}
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-muted">Email</span>
          <input
            className={fieldClass}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-muted">Password</span>
          <input
            className={fieldClass}
            type="password"
            required
            minLength={8}
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? (
          <p role="alert" className="text-sm text-primary-hover">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={busy} className={primaryButtonClass}>
          {busy ? "Working…" : mode === "sign-in" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "sign-in" ? "sign-up" : "sign-in");
          setError(null);
        }}
        className="mt-4 text-left text-sm text-muted hover:text-ink"
      >
        {mode === "sign-in" ? "No account yet? Create one →" : "Have an account? Sign in →"}
      </button>
    </main>
  );
}
