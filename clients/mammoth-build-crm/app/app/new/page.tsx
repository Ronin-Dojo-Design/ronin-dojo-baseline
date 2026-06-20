"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BUILDING_TYPES } from "@/lib/content";
import { useProjects, type NewProjectInput } from "@/lib/store";

const EMPTY: NewProjectInput = {
  name: "",
  contactName: "",
  contactEmail: "",
  buildingType: "",
  use: "",
  region: "",
  width: null,
  length: null,
  eaveHeight: null,
  notes: "",
};

export default function NewJobOrderPage() {
  const router = useRouter();
  const { create } = useProjects();
  const [form, setForm] = useState<NewProjectInput>(EMPTY);

  const set = (field: keyof NewProjectInput, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));
  const setNum = (field: keyof NewProjectInput, value: string) =>
    setForm((f) => ({ ...f, [field]: value === "" ? null : Number(value) }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name =
      form.name.trim() ||
      `${form.contactName || "New"} — ${form.buildingType || "Building"}`;
    const project = create({ ...form, name });
    router.push(`/app/project/${project.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold">New Job Order</h1>
      <p className="text-sm text-muted">
        Start of the job. This creates a project at the Lead stage — and it can't be
        dropped without a reason.
      </p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <Field label="Project name (optional)">
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Auto-generated if blank"
            className={input}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact name">
            <input required value={form.contactName} onChange={(e) => set("contactName", e.target.value)} className={input} />
          </Field>
          <Field label="Contact email">
            <input required type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} className={input} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Building type">
            <select required value={form.buildingType} onChange={(e) => set("buildingType", e.target.value)} className={input}>
              <option value="">Select…</option>
              {BUILDING_TYPES.map((b) => (
                <option key={b.id} value={b.title}>
                  {b.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Region / site">
            <input value={form.region} onChange={(e) => set("region", e.target.value)} placeholder="City, State" className={input} />
          </Field>
        </div>

        <Field label="Intended use">
          <input value={form.use} onChange={(e) => set("use", e.target.value)} placeholder="e.g. 6-bay auto service" className={input} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Width (ft)">
            <input type="number" min={0} value={form.width ?? ""} onChange={(e) => setNum("width", e.target.value)} className={input} />
          </Field>
          <Field label="Length (ft)">
            <input type="number" min={0} value={form.length ?? ""} onChange={(e) => setNum("length", e.target.value)} className={input} />
          </Field>
          <Field label="Eave height (ft)">
            <input type="number" min={0} value={form.eaveHeight ?? ""} onChange={(e) => setNum("eaveHeight", e.target.value)} className={input} />
          </Field>
        </div>

        <Field label="Notes">
          <textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} className={input} />
        </Field>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-md bg-primary px-5 py-2.5 font-semibold text-bg transition-colors hover:bg-primary-hover"
          >
            Create project
          </button>
          <button
            type="button"
            onClick={() => router.push("/app")}
            className="rounded-md border border-border px-5 py-2.5 font-medium transition-colors hover:border-primary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const input =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-ink outline-none transition-colors focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}
