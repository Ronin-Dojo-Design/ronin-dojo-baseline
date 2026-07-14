"use client";

import { useState } from "react";
import { createLead } from "@/lib/actions";
import type { CreateLeadInput } from "@/lib/types";

/**
 * Baseline — the public inquiry funnel (TASK_03).
 *
 * A prospect (un-authenticated) submits name / email / phone / interest / message;
 * the `createLead` server action validates and inserts a `NEW` Lead. Inline
 * validation client-side, the server is the hard gate. Token-driven styling — no
 * hex, matches the landing page. On success it swaps to a confirmation state.
 */

const INTERESTS = ["Kids", "Adults", "Competition", "Not sure yet"];

const EMPTY: CreateLeadInput = { name: "", email: "", phone: "", interest: "", message: "" };

const FIELD_CLASS =
  "mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-ink outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function InquiryForm() {
  const [form, setForm] = useState<CreateLeadInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function update<K extends keyof CreateLeadInput>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name?.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!form.email?.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createLead(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(true);
    } catch {
      // A thrown error = a real failure (DB/network), not the {ok:false}
      // validation path. Show a generic message; never leave "Sending…" stuck.
      setError("Something went wrong sending your inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        <h2 className="font-display text-2xl font-bold text-ink">Thanks — we'll be in touch!</h2>
        <p className="mt-3 text-muted">
          We got your inquiry and someone from the school will reach out shortly to book your free
          intro class.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-8">
      <h2 className="font-display text-2xl font-bold text-ink">Come train with us</h2>
      <p className="mt-2 text-muted">
        Tell us a little about yourself and we'll book you a free intro class.
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={form.name}
            onChange={update("name")}
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={update("email")}
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-ink">
            Phone <span className="text-muted">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={update("phone")}
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor="interest" className="block text-sm font-medium text-ink">
            Interested in
          </label>
          <select
            id="interest"
            name="interest"
            value={form.interest}
            onChange={update("interest")}
            className={FIELD_CLASS}
          >
            <option value="">Select a program…</option>
            {INTERESTS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className="block text-sm font-medium text-ink">
            Message <span className="text-muted">(optional)</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={form.message}
            onChange={update("message")}
            className={FIELD_CLASS}
          />
        </div>

        {error ? (
          <p role="alert" className="text-sm text-red-400 sm:col-span-2">
            {error}
          </p>
        ) : null}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-primary px-7 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Book my free intro class"}
          </button>
        </div>
      </form>
    </div>
  );
}
