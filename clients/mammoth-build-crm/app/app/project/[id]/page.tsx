"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PhotoDocumentation } from "@/components/crm/PhotoDocumentation";
import { StageBadge } from "@/components/crm/StageBadge";
import { useProjects } from "@/lib/store";
import { getStage, nextStage } from "@/lib/stages";

export default function ProjectDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { projects, hydrated, advance, setStage, patch, addPhoto, removePhoto } = useProjects();

  if (!hydrated) {
    return <p className="text-muted">Loading…</p>;
  }

  const project = projects.find((p) => p.id === id);
  if (!project) {
    return (
      <div>
        <p className="text-muted">Project not found.</p>
        <Link href="/app" className="text-primary-hover underline">
          ← Back to pipeline
        </Link>
      </div>
    );
  }

  const next = nextStage(project.stage);
  const blockedToComplete = next === "complete" && !project.orderConfirmed;

  const markLost = async () => {
    const reason = window.prompt("Reason for closing this project as lost? (required)");
    if (!reason || !reason.trim()) {
      return;
    }
    // Await the stage move before patching so the two writes don't race the row.
    await setStage(project.id, "lost");
    await patch(project.id, {
      nextTask: "",
      notes: `${project.notes}\n[Closed-Lost] ${reason.trim()}`.trim(),
    });
  };

  const dims =
    project.width && project.length
      ? `${project.width}×${project.length}${project.eaveHeight ? ` · ${project.eaveHeight}ft eave` : ""}`
      : "Dimensions TBD";

  return (
    <div>
      <Link href="/app" className="text-sm text-muted hover:text-ink">
        ← Pipeline
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{project.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {project.buildingType} · {project.use || "Use TBD"} · {project.region || "Region TBD"} · {dims}
          </p>
          <p className="text-sm text-muted">
            {project.contactName} · {project.contactEmail}
          </p>
        </div>
        <div className="text-right">
          <StageBadge stage={project.stage} />
          {project.orderConfirmed && project.orderNumber && (
            <p className="mt-2 text-sm font-medium text-primary-hover">
              ✓ Order {project.orderNumber}
            </p>
          )}
        </div>
      </div>

      {/* Stage controls */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-4">
        <p className="text-sm text-muted">
          Gate to clear: <span className="text-ink">{getStage(project.stage).gate}</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {next && (
            <button
              type="button"
              onClick={() => void advance(project.id)}
              disabled={blockedToComplete}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-bg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              title={blockedToComplete ? "Can't complete: not a confirmed order yet" : undefined}
            >
              Advance to {getStage(next).label} →
            </button>
          )}
          {project.stage !== "lost" && project.stage !== "complete" && (
            <button
              type="button"
              onClick={() => void markLost()}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-primary hover:text-ink"
            >
              Mark Lost
            </button>
          )}
        </div>
        {blockedToComplete && (
          <p className="mt-2 text-xs text-primary-hover">
            Guardrail: a project can't be completed until it's a confirmed order (deposit stage or beyond).
          </p>
        )}
      </div>

      {/* Next-step guardrail */}
      <div className="mt-4 rounded-lg border border-border bg-surface p-4">
        <label className="block">
          <span className="mb-1 block text-sm text-muted">
            Next step (required — a project with no next step is flagged at risk)
          </span>
          <input
            value={project.nextTask}
            onChange={(e) => void patch(project.id, { nextTask: e.target.value })}
            placeholder="What happens next?"
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        {project.nextTask.trim() === "" && project.stage !== "complete" && project.stage !== "lost" && (
          <p className="mt-2 text-xs text-primary-hover">⚠ No next step set — this project is at risk of being dropped.</p>
        )}
      </div>

      {/* Build documentation */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-bold">Build documentation</h2>
        <p className="mt-1 text-sm text-muted">
          Before / during / after proof at every step. (MVP stores compressed thumbnails locally;
          full-resolution originals move to cloud storage in the backend phase.)
        </p>
        <div className="mt-4">
          <PhotoDocumentation
            project={project}
            onAdd={(photo) => addPhoto(project.id, photo)}
            onRemove={(photoId) => removePhoto(project.id, photoId)}
          />
        </div>
      </section>
    </div>
  );
}
