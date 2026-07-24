"use client";

/**
 * Discovery intake — the Metal Building Sales questionnaire, live on Mammoth's own app
 * (SESSION_0632). The questionnaire + serializer come from the kernel
 * (`@ronin-dojo/ui-kit/intake`); this page is the Mammoth instance: capture answers during the
 * call (localStorage until committed), then EXPLICITLY commit the capture as one Contact + one
 * lead-stage Project via `commitIntakeCapture` — deduped server-side by the ONE matcher, matched
 * contacts attached-to and reported, never enriched or overwritten (MB-LEAD-002 posture).
 *
 * No demo-safe toggle here (SESSION_0632 fork 4): real prospect data is the point of a CRM
 * intake, and it flows to the CRM DB — the Markdown export is stamped `contains_real_data: true`.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  answeredCount,
  flatQuestions,
  toMarkdown,
  type IntakeHeader,
} from "@ronin-dojo/ui-kit/intake";
import { commitIntakeCapture } from "@/lib/actions";
import { emailKey, phoneKey } from "@/lib/contact-match";
import {
  INTAKE_QUESTIONNAIRE,
  type IntakeCaptureInput,
  type IntakeCommitReport,
} from "@/lib/intake-commit";
import { LEAD_SOURCES, LEAD_SOURCE_LABELS, type LeadSourceValue } from "@/lib/lead-source";
import { useLocalStorage } from "@/lib/useLocalStorage";

const fieldClass =
  "w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30";

const secondaryButtonClass =
  "rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:border-primary hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

const primaryButtonClass =
  "rounded-md bg-primary px-4 py-2 text-sm font-semibold text-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover disabled:cursor-not-allowed disabled:opacity-50";

type Capture = {
  client: string;
  contactName: string;
  email: string;
  phone: string;
  meetingDate: string;
  source: LeadSourceValue;
  answers: Record<string, string>;
};

const EMPTY_CAPTURE: Capture = {
  client: "",
  contactName: "",
  email: "",
  phone: "",
  meetingDate: "",
  source: "phone",
  answers: {},
};

type CommitState =
  | { phase: "idle" }
  | { phase: "confirm" }
  | { phase: "committing" }
  | { phase: "done"; report: Extract<IntakeCommitReport, { ok: true }> }
  | { phase: "error"; message: string };

const QUESTION_TOTAL = flatQuestions(INTAKE_QUESTIONNAIRE).length;

export default function DiscoveryIntakePage() {
  const [capture, setCapture, hydrated] = useLocalStorage<Capture>(
    `mmb-intake:${INTAKE_QUESTIONNAIRE.id}`,
    EMPTY_CAPTURE,
  );
  const [commit, setCommit] = useState<CommitState>({ phase: "idle" });
  const [copied, setCopied] = useState(false);

  // Default the meeting date to today AFTER hydration — a render-time `new Date()` would make the
  // server and first client paint disagree.
  useEffect(() => {
    if (hydrated && !capture.meetingDate) {
      setCapture((prev) => ({ ...prev, meetingDate: new Date().toISOString().slice(0, 10) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const answered = answeredCount(INTAKE_QUESTIONNAIRE, capture.answers);
  const hasDedupeKey = emailKey(capture.email) !== null || phoneKey(capture.phone) !== null;

  const setField =
    (field: "client" | "contactName" | "email" | "phone" | "meetingDate") => (value: string) => {
      setCommit({ phase: "idle" });
      setCapture((prev) => ({ ...prev, [field]: value }));
    };

  const setSource = (value: string) => {
    const source = (LEAD_SOURCES as readonly string[]).includes(value)
      ? (value as LeadSourceValue)
      : "other";
    setCommit({ phase: "idle" });
    setCapture((prev) => ({ ...prev, source }));
  };

  const setAnswer = (id: string, value: string) => {
    setCommit({ phase: "idle" });
    setCapture((prev) => ({ ...prev, answers: { ...prev.answers, [id]: value } }));
  };

  const exportHeader: IntakeHeader = {
    client: capture.client,
    contact: capture.contactName,
    meetingDate: capture.meetingDate,
    // Real prospect data is the point of a CRM intake — the export always says so.
    containsRealData: true,
  };

  const onCopy = async () => {
    await navigator.clipboard.writeText(
      toMarkdown(INTAKE_QUESTIONNAIRE, exportHeader, capture.answers),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onDownload = () => {
    const md = toMarkdown(INTAKE_QUESTIONNAIRE, exportHeader, capture.answers);
    const url = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${INTAKE_QUESTIONNAIRE.id}-${capture.meetingDate || "capture"}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const onCommit = async () => {
    setCommit({ phase: "committing" });
    const input: IntakeCaptureInput = {
      client: capture.client,
      contactName: capture.contactName,
      email: capture.email,
      phone: capture.phone,
      meetingDate: capture.meetingDate,
      source: capture.source,
      answers: capture.answers,
    };
    try {
      const report = await commitIntakeCapture(input);
      if (report.ok) {
        setCommit({ phase: "done", report });
      } else {
        setCommit({ phase: "error", message: report.error });
      }
    } catch {
      setCommit({ phase: "error", message: "Commit failed — are you signed in as an owner?" });
    }
  };

  const onStartNew = () => {
    setCapture({ ...EMPTY_CAPTURE, meetingDate: new Date().toISOString().slice(0, 10) });
    setCommit({ phase: "idle" });
  };

  return (
    <main className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Discovery intake</h1>
          <p className="mt-1 text-sm text-muted">
            {INTAKE_QUESTIONNAIRE.title} — capture the call, then commit it to the pipeline as a
            lead. Nothing is written until you commit.
          </p>
        </div>
        <p className="text-sm text-muted" aria-live="polite">
          {answered} of {QUESTION_TOTAL} answered
        </p>
      </header>

      <section
        aria-labelledby="intake-contact-heading"
        className="rounded-lg border border-border bg-surface p-5"
      >
        <h2 id="intake-contact-heading" className="font-display text-lg font-bold">
          Who&apos;s on the call
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold text-muted">Company / client</span>
            <input
              className={fieldClass}
              value={capture.client}
              onChange={(event) => setField("client")(event.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold text-muted">Contact name</span>
            <input
              className={fieldClass}
              value={capture.contactName}
              onChange={(event) => setField("contactName")(event.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold text-muted">Email</span>
            <input
              className={fieldClass}
              type="email"
              value={capture.email}
              onChange={(event) => setField("email")(event.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold text-muted">Phone</span>
            <input
              className={fieldClass}
              type="tel"
              value={capture.phone}
              onChange={(event) => setField("phone")(event.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold text-muted">Meeting date</span>
            <input
              className={fieldClass}
              type="date"
              value={capture.meetingDate}
              onChange={(event) => setField("meetingDate")(event.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold text-muted">Lead source</span>
            <select
              className={fieldClass}
              value={capture.source}
              onChange={(event) => setSource(event.target.value)}
            >
              {LEAD_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {LEAD_SOURCE_LABELS[source]}
                </option>
              ))}
            </select>
          </label>
        </div>
        {!hasDedupeKey ? (
          <p className="mt-3 text-xs text-muted">
            Add a valid email or phone — without one the lead can&apos;t be deduped, so it
            can&apos;t be committed.
          </p>
        ) : null}
      </section>

      {INTAKE_QUESTIONNAIRE.sections.map((section) => (
        <section
          key={section.title}
          aria-label={section.title}
          className="rounded-lg border border-border bg-surface p-5"
        >
          <h2 className="font-display text-lg font-bold">{section.title}</h2>
          <div className="mt-3 flex flex-col gap-4">
            {section.questions.map((question) => (
              <label key={question.id} className="block text-sm">
                <span className="mb-0.5 block font-semibold">{question.prompt}</span>
                <span className="mb-1.5 block text-xs text-muted">{question.why}</span>
                <textarea
                  className={fieldClass}
                  rows={3}
                  value={capture.answers[question.id] ?? ""}
                  onChange={(event) => setAnswer(question.id, event.target.value)}
                />
              </label>
            ))}
          </div>
        </section>
      ))}

      <section
        aria-labelledby="intake-commit-heading"
        className="rounded-lg border border-border bg-surface p-5"
      >
        <h2 id="intake-commit-heading" className="font-display text-lg font-bold">
          Finish the capture
        </h2>

        {commit.phase === "done" ? (
          <div className="mt-3">
            <p className="text-sm">
              Lead committed:{" "}
              <Link
                href={`/app/project/${commit.report.projectId}`}
                className="font-semibold text-primary hover:underline"
              >
                {commit.report.projectName}
              </Link>{" "}
              {commit.report.contactMatched
                ? "— attached to a contact already in the CRM (nothing on it was changed)."
                : "— new contact created."}
            </p>
            <button type="button" onClick={onStartNew} className={`mt-3 ${secondaryButtonClass}`}>
              Start a new capture
            </button>
          </div>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => void onCopy()} className={secondaryButtonClass}>
                {copied ? "Copied ✓" : "Copy Markdown"}
              </button>
              <button type="button" onClick={onDownload} className={secondaryButtonClass}>
                Download .md
              </button>
              {commit.phase === "confirm" || commit.phase === "committing" ? (
                <button
                  type="button"
                  onClick={() => void onCommit()}
                  disabled={commit.phase === "committing"}
                  className={primaryButtonClass}
                >
                  {commit.phase === "committing"
                    ? "Committing…"
                    : `Confirm — write ${capture.contactName.trim() || capture.client.trim() || "this lead"} to the CRM`}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCommit({ phase: "confirm" })}
                  disabled={!hasDedupeKey || answered === 0}
                  className={primaryButtonClass}
                >
                  Commit to CRM…
                </button>
              )}
            </div>
            {commit.phase === "confirm" ? (
              <p className="mt-2 text-xs text-muted">
                Writes one contact + one lead-stage project ({answered} answer
                {answered === 1 ? "" : "s"} in the notes). If the contact is already in the CRM,
                the lead attaches to it — nothing on the existing contact is changed.
              </p>
            ) : null}
            {commit.phase === "error" ? (
              <p role="alert" className="mt-2 text-sm text-primary-hover">
                {commit.message}
              </p>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}
