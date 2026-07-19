"use client";

import { MCard } from "@ronin-dojo/ui-kit";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSalesCockpit, recordContactAttempt } from "@/lib/actions";
import { leadSourceLabel } from "@/lib/lead-source";
import {
  CONTACT_ATTEMPT_CHANNEL_LABELS,
  CONTACT_ATTEMPT_CHANNELS,
  CONTACT_ATTEMPT_OUTCOME_LABELS,
  CONTACT_ATTEMPT_OUTCOMES,
  attemptProgress,
  type ContactAttemptChannel,
  type ContactAttemptOutcome,
  type SalesCockpitReadModel,
  type SalesQueueItem,
} from "@/lib/sales-cockpit";

const fieldClass =
  "w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The sales cockpit could not be loaded.";
}

function formatDue(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function SalesCockpitPage() {
  const [model, setModel] = useState<SalesCockpitReadModel | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [channel, setChannel] = useState<ContactAttemptChannel>("call");
  const [outcome, setOutcome] = useState<ContactAttemptOutcome>("connected");
  const [notes, setNotes] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [nextActionDueAt, setNextActionDueAt] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const nextModel = await getSalesCockpit();
      setModel(nextModel);
      setSelectedProjectId((current) =>
        current && nextModel.roster.some((project) => project.id === current)
          ? current
          : (nextModel.roster[0]?.id ?? null),
      );
    } catch (error) {
      setLoadError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedProject = useMemo(
    () => model?.roster.find((project) => project.id === selectedProjectId) ?? null,
    [model, selectedProjectId],
  );

  async function submitAttempt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProject) return;
    setSaving(true);
    setSaveError(null);
    setConfirmation(null);
    try {
      const nextModel = await recordContactAttempt({
        channel,
        nextAction,
        nextActionDueAt: new Date(nextActionDueAt).toISOString(),
        notes,
        outcome,
        projectId: selectedProject.id,
      });
      setModel(nextModel);
      setNotes("");
      setNextAction("");
      setNextActionDueAt("");
      setConfirmation("Contact Attempt recorded. One owned Next Action is now due.");
    } catch (error) {
      setSaveError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  if (loading && !model) return <LoadingState />;

  if (loadError && !model) {
    return (
      <ErrorState message={loadError} onRetry={() => void load()} />
    );
  }

  if (!model || model.roster.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-surface p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Sales cockpit</p>
        <h1 className="mt-2 font-display text-2xl font-bold">No active Opportunities</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
          Add a sanitized lead or job order first. The queue will appear after its first owned Next Action is set.
        </p>
        <a
          href="/app/new"
          className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover"
        >
          Add job order
        </a>
      </section>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Manual tracer</p>
          <h1 className="font-display text-2xl font-bold">Sales cockpit</h1>
          <p className="mt-1 text-sm text-muted">
            Today queue → lead roster → contact workspace → Contact Attempt → Next Action.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="rounded-md border border-border px-3 py-2 text-sm text-muted hover:border-primary hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {loadError ? (
        <div role="alert" className="mt-4 rounded-md border border-primary/60 bg-surface p-3 text-sm">
          Refresh failed: {loadError} The last successful view remains visible.
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(20rem,1.2fr)]">
        <section aria-labelledby="today-queue-heading">
          <h2 id="today-queue-heading" className="font-display text-lg font-bold">
            Today queue
          </h2>
          <p className="mb-3 text-sm text-muted">Owned, open, due Next Actions only.</p>
          <div className="space-y-5">
            <QueueGroup
              label="Overdue"
              items={model.queue.overdue}
              tone="critical"
              onSelect={setSelectedProjectId}
            />
            <QueueGroup
              label="Today"
              items={model.queue.today}
              tone="accent"
              onSelect={setSelectedProjectId}
            />
            <QueueGroup
              label="Upcoming"
              items={model.queue.upcoming}
              tone="neutral"
              onSelect={setSelectedProjectId}
            />
          </div>
        </section>

        <section aria-labelledby="lead-roster-heading">
          <h2 id="lead-roster-heading" className="font-display text-lg font-bold">
            Lead roster
          </h2>
          <p className="mb-3 text-sm text-muted">Active Opportunities available to this owner.</p>
          <div className="space-y-3">
            {model.roster.map((project) => (
              <MCard
                key={project.id}
                kind="record"
                density="compact"
                selected={project.id === selectedProjectId}
                onSelect={setSelectedProjectId}
                data={{
                  badges: [
                    { label: project.stage, tone: "neutral" },
                    { label: leadSourceLabel(project.source), tone: "neutral" },
                  ],
                  eyebrow: project.contact.companyName ?? "Opportunity",
                  id: project.id,
                  meta: project.name,
                  title: project.contact.name,
                }}
              />
            ))}
          </div>
        </section>

        <section aria-labelledby="contact-workspace-heading">
          <h2 id="contact-workspace-heading" className="font-display text-lg font-bold">
            Contact workspace
          </h2>
          {selectedProject ? (
            <ContactWorkspace
              project={selectedProject}
              channel={channel}
              confirmation={confirmation}
              nextAction={nextAction}
              nextActionDueAt={nextActionDueAt}
              notes={notes}
              outcome={outcome}
              saveError={saveError}
              saving={saving}
              onChannelChange={setChannel}
              onNextActionChange={setNextAction}
              onNextActionDueAtChange={setNextActionDueAt}
              onNotesChange={setNotes}
              onOutcomeChange={setOutcome}
              onSubmit={submitAttempt}
            />
          ) : (
            <p className="mt-3 rounded-lg border border-border bg-surface p-5 text-sm text-muted">
              Choose an Opportunity from the queue or roster.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function QueueGroup({
  items,
  label,
  onSelect,
  tone,
}: {
  items: SalesQueueItem[];
  label: string;
  onSelect: (projectId: string) => void;
  tone: "accent" | "critical" | "neutral";
}) {
  return (
    <div>
      <h3 className="mb-2 flex items-center justify-between text-sm font-semibold">
        {label} <span className="text-muted">{items.length}</span>
      </h3>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted">
          Nothing {label.toLowerCase()}.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <MCard
              key={item.activityId}
              kind="task"
              density="compact"
              onSelect={() => onSelect(item.projectId)}
              data={{
                badges: [{ label, tone }],
                eyebrow: item.contactName,
                focal: { label: "due", tone, value: formatDue(item.dueAt) },
                id: item.activityId,
                meta: item.projectName,
                title: item.title,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type WorkspaceProps = {
  channel: ContactAttemptChannel;
  confirmation: string | null;
  nextAction: string;
  nextActionDueAt: string;
  notes: string;
  onChannelChange: (value: ContactAttemptChannel) => void;
  onNextActionChange: (value: string) => void;
  onNextActionDueAtChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onOutcomeChange: (value: ContactAttemptOutcome) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  outcome: ContactAttemptOutcome;
  project: SalesCockpitReadModel["roster"][number];
  saveError: string | null;
  saving: boolean;
};

function ContactWorkspace(props: WorkspaceProps) {
  const { project } = props;
  return (
    <div className="mt-3 space-y-4">
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="font-semibold">{project.contact.name}</p>
        <p className="text-sm text-muted">{project.contact.companyName ?? "No company linked"}</p>
        <p className="mt-2 text-sm text-muted">{project.contact.email || "No email recorded"}</p>
        <p className="text-sm text-muted">{project.contact.phone || "No phone recorded"}</p>
        <p className="text-sm text-muted">Lead Source: {leadSourceLabel(project.source)}</p>
        <p className="mt-3 text-xs uppercase tracking-wide text-muted">Current Next Action</p>
        <p className="text-sm">{project.nextTask || "No compatibility projection set"}</p>
      </div>

      <AttemptLog project={project} />

      <form onSubmit={props.onSubmit} className="rounded-lg border border-border bg-surface p-4">
        <fieldset disabled={props.saving} className="space-y-3">
          <legend className="font-semibold">Record manual Contact Attempt</legend>
          <p className="text-xs text-muted">
            This records an attempt completed elsewhere. It does not call, email, or send anything.
          </p>
          <label className="block text-sm">
            Channel
            <select
              value={props.channel}
              onChange={(event) => props.onChannelChange(event.target.value as ContactAttemptChannel)}
              className={`mt-1 ${fieldClass}`}
            >
              {CONTACT_ATTEMPT_CHANNELS.map((value) => (
                <option key={value} value={value}>{CONTACT_ATTEMPT_CHANNEL_LABELS[value]}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Provisional outcome
            <select
              value={props.outcome}
              onChange={(event) => props.onOutcomeChange(event.target.value as ContactAttemptOutcome)}
              className={`mt-1 ${fieldClass}`}
            >
              {CONTACT_ATTEMPT_OUTCOMES.map((value) => (
                <option key={value} value={value}>{CONTACT_ATTEMPT_OUTCOME_LABELS[value]}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Attempt notes <span className="text-muted">(optional, 500 characters)</span>
            <textarea
              value={props.notes}
              onChange={(event) => props.onNotesChange(event.target.value)}
              maxLength={500}
              rows={3}
              className={`mt-1 ${fieldClass}`}
            />
          </label>
          <label className="block text-sm">
            Next Action
            <input
              required
              value={props.nextAction}
              onChange={(event) => props.onNextActionChange(event.target.value)}
              maxLength={160}
              placeholder="One concrete owned action"
              className={`mt-1 ${fieldClass}`}
            />
          </label>
          <label className="block text-sm">
            Due
            <input
              required
              type="datetime-local"
              value={props.nextActionDueAt}
              onChange={(event) => props.onNextActionDueAtChange(event.target.value)}
              className={`mt-1 ${fieldClass}`}
            />
          </label>
          {props.saveError ? <p role="alert" className="text-sm text-primary-hover">{props.saveError}</p> : null}
          {props.confirmation ? <p aria-live="polite" className="text-sm text-ink">{props.confirmation}</p> : null}
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {props.saving ? "Recording…" : "Record attempt + replace Next Action"}
          </button>
        </fieldset>
      </form>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Recent activity</h3>
        {project.activities.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted">
            No owner-scoped activity yet.
          </p>
        ) : (
          <ol className="space-y-2">
            {project.activities.map((activity) => (
              <li key={activity.id} className="rounded-md border border-border bg-surface p-3">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="mt-1 text-xs text-muted">
                  {activity.type} · {activity.status} · {formatDue(activity.createdAt)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function AttemptLog({ project }: { project: SalesCockpitReadModel["roster"][number] }) {
  const progress = attemptProgress(project.attempts.length);
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Contact-attempt log</h3>
        <span
          className={`rounded-full border px-2 py-0.5 text-xs ${
            progress.cadenceMet ? "border-primary text-primary" : "border-border text-muted"
          }`}
        >
          {progress.label}
        </span>
      </div>
      {project.attempts.length === 0 ? (
        <p className="mt-2 text-sm text-muted">
          No attempts recorded yet. Attempts land here as Attempt 1, 2, 3.
        </p>
      ) : (
        <ol className="mt-3 space-y-2">
          {project.attempts.map((entry) => (
            <li key={entry.activityId} className="flex items-baseline gap-2 text-sm">
              <span className="shrink-0 font-semibold">Attempt {entry.attemptNumber}</span>
              <span className="min-w-0 flex-1">{entry.summary}</span>
              <span className="shrink-0 text-xs text-muted">{formatDue(entry.occurredAt)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div role="status" aria-label="Loading sales cockpit" className="animate-pulse space-y-4">
      <div className="h-8 w-56 rounded bg-elevated" />
      <div className="grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((value) => <div key={value} className="h-72 rounded-lg bg-surface" />)}
      </div>
      <span className="sr-only">Loading sales cockpit…</span>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section role="alert" className="rounded-lg border border-primary/60 bg-surface p-6">
      <h1 className="font-display text-xl font-bold">Sales cockpit unavailable</h1>
      <p className="mt-2 text-sm text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover"
      >
        Retry
      </button>
    </section>
  );
}
