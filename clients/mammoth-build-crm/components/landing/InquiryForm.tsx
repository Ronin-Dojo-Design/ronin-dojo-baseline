"use client";

import { useEffect, useState } from "react";
import { BUILDING_TYPES } from "@/lib/content";
import { useLocalStorage } from "@/lib/useLocalStorage";

interface Draft {
  name: string;
  email: string;
  buildingType: string;
  message: string;
}

const EMPTY: Draft = { name: "", email: "", buildingType: "", message: "" };

export function InquiryForm() {
  const [draft, setDraft, hydrated] = useLocalStorage<Draft>("mammoth:inquiry-draft", EMPTY);
  const [interests] = useLocalStorage<string[]>("mammoth:interests", []);
  const [, setSubmitted] = useLocalStorage<Draft[]>("mammoth:submitted", []);
  const [done, setDone] = useState(false);
  const [restored, setRestored] = useState(false);

  // Pre-fill building type from the first saved interest (browse → inquire flow).
  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!draft.buildingType && interests.length > 0) {
      const first = BUILDING_TYPES.find((b) => b.id === interests[0]);
      if (first) {
        setDraft((d) => ({ ...d, buildingType: first.title }));
      }
    }
    if (draft.name || draft.email || draft.message) {
      setRestored(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const update = (field: keyof Draft, value: string) =>
    setDraft((d) => ({ ...d, [field]: value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted((prev) => [...prev, draft]);
    setDraft(EMPTY);
    setDone(true);
  };

  if (done) {
    return (
      <div className="rounded-lg border border-primary bg-elevated p-6 text-center">
        <p className="font-display text-xl font-semibold">Saved locally — we'll be in touch.</p>
        <p className="mt-2 text-sm text-muted">
          (MVP: this inquiry is stored on your device only. In production it routes
          into the Mammoth CRM as a new lead.)
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-4 text-sm text-primary-hover underline"
        >
          Start another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {restored && (
        <p className="text-xs text-muted">We saved your draft — pick up where you left off.</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input
            required
            value={draft.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            value={draft.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>
      <Field label="Building type">
        <select
          value={draft.buildingType}
          onChange={(e) => update("buildingType", e.target.value)}
          className={inputCls}
        >
          <option value="">Select…</option>
          {BUILDING_TYPES.map((b) => (
            <option key={b.id} value={b.title}>
              {b.title}
            </option>
          ))}
        </select>
      </Field>
      <Field label="What are you building?">
        <textarea
          rows={3}
          value={draft.message}
          onChange={(e) => update("message", e.target.value)}
          className={inputCls}
        />
      </Field>
      <button
        type="submit"
        className="w-full rounded-md bg-primary px-5 py-3 font-semibold text-bg transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:w-auto"
      >
        Start Your Build
      </button>
    </form>
  );
}

const inputCls =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-ink outline-none transition-colors focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}
