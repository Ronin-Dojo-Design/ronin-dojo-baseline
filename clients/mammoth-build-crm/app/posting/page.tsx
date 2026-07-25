"use client";

/**
 * Posting pipeline — draft/approval queue (SESSION_0687).
 *
 * Renders a posting-templates.md template into a draft, then approves it. Approving NEVER posts —
 * publishing to a platform is a separate, later step + an explicit operator action outside this
 * page. Standalone top-level route (not nested under /app) so this lane's owned subtree
 * (app/posting/**) never touches the shared /app shell (app/app/layout.tsx) — see
 * docs/sprints/SESSION_0687.md "## Proposed ledger edits" for the follow-up nav wiring.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { MCard, type MCardBadge } from "@ronin-dojo/ui-kit";
import {
  approvePostingDraft,
  generatePostingDraft,
  listPostingDrafts,
} from "@/lib/posting/actions";
import { extractPlaceholders } from "@/lib/posting/generator";
import {
  POSTING_PLATFORMS,
  POSTING_TEMPLATES,
  getPostingTemplate,
  type PostingPlatform,
  type PostingTemplateKey,
} from "@/lib/posting/templates";
import type { PostingDraftRecord } from "@/lib/posting/types";

const PLATFORM_LABELS: Record<PostingPlatform, string> = {
  facebook: "Facebook",
  google_business_profile: "Google Business Profile",
  instagram: "Instagram",
};

const STATUS_TONE: Record<PostingDraftRecord["status"], MCardBadge["tone"]> = {
  approved: "positive",
  draft: "neutral",
  posted: "accent",
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

const fieldClass =
  "w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm capitalize text-muted">{label}</span>
      {children}
    </label>
  );
}

export default function PostingPipelinePage() {
  const [drafts, setDrafts] = useState<PostingDraftRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [templateKey, setTemplateKey] = useState<PostingTemplateKey>(POSTING_TEMPLATES[0]!.key);
  const [platform, setPlatform] = useState<PostingPlatform>("facebook");
  const [projectId, setProjectId] = useState("");
  const [context, setContext] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);

  const template = getPostingTemplate(templateKey);
  const placeholders = useMemo(
    () => extractPlaceholders(template.copy[platform]).map((token) => token.slice(1, -1)),
    [template, platform],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setDrafts(await listPostingDrafts());
    } catch (error) {
      setLoadError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    // Switching template/platform resets the context fields — a stale value from a different
    // template's placeholder shouldn't silently carry over into the new render.
    setContext({});
  }, [templateKey, platform]);

  async function onGenerate(event: React.FormEvent) {
    event.preventDefault();
    setGenerating(true);
    setGenerateError(null);
    try {
      const draft = await generatePostingDraft({
        context,
        platform,
        projectId: projectId.trim() || null,
        scheduledFor: null,
        templateKey,
      });
      setDrafts((current) => [draft, ...(current ?? [])]);
      setContext({});
    } catch (error) {
      setGenerateError(errorMessage(error));
    } finally {
      setGenerating(false);
    }
  }

  async function onApprove(id: string) {
    setApprovingId(id);
    setApproveError(null);
    try {
      const updated = await approvePostingDraft(id);
      setDrafts((current) => (current ?? []).map((d) => (d.id === id ? updated : d)));
    } catch (error) {
      setApproveError(errorMessage(error));
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Draft → approval
          </p>
          <h1 className="font-display text-2xl font-bold">Posting pipeline</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Render a template into a draft, review it, then approve. Approving never posts —
            publishing to Facebook, Instagram, or Google Business Profile is a separate, later step.
          </p>
        </div>
        <a href="/app" className="text-sm text-muted transition-colors hover:text-ink">
          ← CRM pipeline
        </a>
      </header>

      <section className="mt-6 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-display text-lg font-bold">Generate a draft</h2>
        <form onSubmit={onGenerate} className="mt-3 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Template">
              <select
                value={templateKey}
                onChange={(e) => setTemplateKey(e.target.value as PostingTemplateKey)}
                className={fieldClass}
              >
                {POSTING_TEMPLATES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Platform">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PostingPlatform)}
                className={fieldClass}
              >
                {POSTING_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_LABELS[p]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <p className="text-xs text-muted">
            {template.usageNote} Asset: {template.asset}
          </p>

          <Field label="CRM Project id (optional)">
            <input
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Leave blank if this post isn't tied to one project"
              className={fieldClass}
            />
          </Field>

          {placeholders.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {placeholders.map((key) => (
                <Field key={key} label={key.replaceAll("_", " ").toLowerCase()}>
                  <input
                    value={context[key] ?? ""}
                    onChange={(e) => setContext((c) => ({ ...c, [key]: e.target.value }))}
                    placeholder="Leave blank to keep the [PLACEHOLDER]"
                    className={fieldClass}
                  />
                </Field>
              ))}
            </div>
          ) : null}

          {generateError ? (
            <p role="alert" className="text-sm text-primary-hover">
              {generateError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={generating}
            className="rounded-md bg-primary px-5 py-2.5 font-semibold text-bg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? "Rendering…" : "Render draft"}
          </button>
        </form>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-lg font-bold">Drafts</h2>
        {approveError ? (
          <p role="alert" className="mt-2 text-sm text-primary-hover">
            {approveError}
          </p>
        ) : null}

        {loading && !drafts ? (
          <p className="mt-3 text-sm text-muted">Loading…</p>
        ) : loadError && !drafts ? (
          <p role="alert" className="mt-3 text-sm text-primary-hover">
            {loadError}
          </p>
        ) : !drafts || drafts.length === 0 ? (
          <p className="mt-3 rounded-md border border-dashed border-border p-4 text-sm text-muted">
            No drafts yet. Render one above.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {drafts.map((draft) => {
              const badges: MCardBadge[] = [
                { label: draft.status, tone: STATUS_TONE[draft.status] },
                { label: PLATFORM_LABELS[draft.platform], tone: "neutral" },
              ];
              if (draft.missingPlaceholders.length > 0) {
                badges.push({
                  label: `${draft.missingPlaceholders.length} placeholder${
                    draft.missingPlaceholders.length === 1 ? "" : "s"
                  } left`,
                  tone: "warning",
                });
              }
              return (
                <MCard
                  key={draft.id}
                  kind="task"
                  density="rich"
                  data={{
                    badges,
                    eyebrow: getPostingTemplate(draft.templateKey).title,
                    footnote: draft.body,
                    id: draft.id,
                    meta: draft.projectId ? `Project ${draft.projectId}` : "No linked project",
                    title: `Drafted ${new Date(draft.createdAt).toLocaleString()}`,
                  }}
                  actions={
                    draft.status === "draft" ? (
                      <button
                        type="button"
                        onClick={() => void onApprove(draft.id)}
                        disabled={approvingId === draft.id || draft.missingPlaceholders.length > 0}
                        className="rounded-md border border-primary px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-bg disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {approvingId === draft.id ? "Approving…" : "Approve"}
                      </button>
                    ) : null
                  }
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
