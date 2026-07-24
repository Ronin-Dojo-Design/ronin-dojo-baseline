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
import { useEffect, useRef, useState } from "react";
import {
  answeredCount,
  flatQuestions,
  toMarkdown,
  type IntakeHeader,
  type QuestionnaireSection,
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

const sectionAnswered = (section: QuestionnaireSection, answers: Record<string, string>): number =>
  section.questions.filter((q) => (answers[q.id] ?? "").trim().length > 0).length;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}

function CommitPanel({
  answered,
  blockers,
  commit,
  commitName,
  copyFailed,
  onArm,
  onCommit,
  onCopy,
  onDownload,
  onStartNew,
  copied,
}: {
  answered: number;
  blockers: string[];
  commit: CommitState;
  commitName: string;
  copied: boolean;
  copyFailed: boolean;
  onArm: () => void;
  onCommit: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onStartNew: () => void;
}) {
  const doneHeadingRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (commit.phase === "done") {
      doneHeadingRef.current?.focus();
    }
  }, [commit.phase]);

  if (commit.phase === "done") {
    return (
      <div className="mt-3" role="status">
        <p ref={doneHeadingRef} tabIndex={-1} className="text-sm outline-none">
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
    );
  }

  const armed = commit.phase === "confirm" || commit.phase === "committing";
  return (
    <>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={onCopy} className={secondaryButtonClass}>
          {copied ? "Copied ✓" : "Copy Markdown"}
        </button>
        <button type="button" onClick={onDownload} className={secondaryButtonClass}>
          Download .md
        </button>
        {armed ? (
          <button
            type="button"
            onClick={onCommit}
            disabled={commit.phase === "committing"}
            className={primaryButtonClass}
          >
            {commit.phase === "committing" ? "Committing…" : `Confirm — write ${commitName} to the CRM`}
          </button>
        ) : (
          <button
            type="button"
            onClick={onArm}
            disabled={blockers.length > 0}
            className={primaryButtonClass}
          >
            Commit to CRM…
          </button>
        )}
      </div>
      {blockers.length > 0 ? (
        <p className="mt-2 text-xs text-muted">To commit: {blockers.join("; ")}.</p>
      ) : null}
      {armed && commit.phase === "confirm" ? (
        <p className="mt-2 text-xs text-muted">
          Writes one contact + one lead-stage project ({answered} answer
          {answered === 1 ? "" : "s"} in the notes). If the contact is already in the CRM, the lead
          attaches to it — nothing on the existing contact is changed.
        </p>
      ) : null}
      {copyFailed ? (
        <p role="alert" className="mt-2 text-sm text-primary-hover">
          Copy failed — the browser blocked clipboard access. Use Download .md instead.
        </p>
      ) : null}
      {commit.phase === "error" ? (
        <p role="alert" className="mt-2 text-sm text-primary-hover">
          {commit.message}
        </p>
      ) : null}
    </>
  );
}

export default function DiscoveryIntakePage() {
  const [capture, setCapture, hydrated] = useLocalStorage<Capture>(
    `mmb-intake:${INTAKE_QUESTIONNAIRE.id}`,
    EMPTY_CAPTURE,
  );
  const [commit, setCommit] = useState<CommitState>({ phase: "idle" });
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  // Default the meeting date to today AFTER hydration — a render-time `new Date()` would make the
  // server and first client paint disagree.
  useEffect(() => {
    if (hydrated && !capture.meetingDate) {
      setCapture((prev) => ({ ...prev, meetingDate: new Date().toISOString().slice(0, 10) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const answered = answeredCount(INTAKE_QUESTIONNAIRE, capture.answers);
  const blockers: string[] = [];
  if (emailKey(capture.email) === null && phoneKey(capture.phone) === null) {
    blockers.push("add a valid email or phone (without one the lead can't be deduped)");
  }
  if (answered === 0) {
    blockers.push("answer at least one question");
  }

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
    setCopyFailed(false);
    try {
      await navigator.clipboard.writeText(
        toMarkdown(INTAKE_QUESTIONNAIRE, exportHeader, capture.answers),
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyFailed(true);
    }
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
    window.scrollTo({ top: 0 });
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
          <Field label="Company / client">
            <input
              className={fieldClass}
              autoComplete="organization"
              value={capture.client}
              onChange={(event) => setField("client")(event.target.value)}
            />
          </Field>
          <Field label="Contact name">
            <input
              className={fieldClass}
              autoComplete="name"
              value={capture.contactName}
              onChange={(event) => setField("contactName")(event.target.value)}
            />
          </Field>
          <Field label="Email">
            <input
              className={fieldClass}
              type="email"
              autoComplete="email"
              value={capture.email}
              onChange={(event) => setField("email")(event.target.value)}
            />
          </Field>
          <Field label="Phone">
            <input
              className={fieldClass}
              type="tel"
              autoComplete="tel"
              value={capture.phone}
              onChange={(event) => setField("phone")(event.target.value)}
            />
          </Field>
          <Field label="Meeting date">
            <input
              className={fieldClass}
              type="date"
              value={capture.meetingDate}
              onChange={(event) => setField("meetingDate")(event.target.value)}
            />
          </Field>
          <Field label="Lead source">
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
          </Field>
        </div>
      </section>

      {INTAKE_QUESTIONNAIRE.sections.map((section) => (
        <section
          key={section.title}
          aria-label={section.title}
          className="rounded-lg border border-border bg-surface p-5"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-lg font-bold">{section.title}</h2>
            <span className="text-xs text-muted">
              {sectionAnswered(section, capture.answers)}/{section.questions.length}
            </span>
          </div>
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
        <CommitPanel
          answered={answered}
          blockers={blockers}
          commit={commit}
          commitName={capture.contactName.trim() || capture.client.trim() || "this lead"}
          copied={copied}
          copyFailed={copyFailed}
          onArm={() => setCommit({ phase: "confirm" })}
          onCommit={() => void onCommit()}
          onCopy={() => void onCopy()}
          onDownload={onDownload}
          onStartNew={onStartNew}
        />
      </section>
    </main>
  );
}
