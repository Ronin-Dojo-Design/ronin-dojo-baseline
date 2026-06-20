"use client";

import { useRef, useState } from "react";
import { fileToThumbnail } from "@/lib/image";
import { getStage } from "@/lib/stages";
import type { BuildPhoto, PhotoPhase, Project } from "@/lib/types";

const PHASES: { id: PhotoPhase; label: string }[] = [
  { id: "before", label: "Before" },
  { id: "during", label: "During" },
  { id: "after", label: "After" },
];

export function PhotoDocumentation({
  project,
  onAdd,
  onRemove,
}: {
  project: Project;
  onAdd: (photo: Omit<BuildPhoto, "id">) => void;
  onRemove: (photoId: string) => void;
}) {
  const [phase, setPhase] = useState<PhotoPhase>("before");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const dataUrl = await fileToThumbnail(file);
        onAdd({
          phase,
          stage: project.stage,
          dataUrl,
          caption: caption.trim(),
          takenAt: new Date().toISOString(),
        });
      }
      setCaption("");
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    } catch {
      setError("Could not process that image. Try a JPG or PNG.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-4">
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Phase</span>
          <select
            value={phase}
            onChange={(e) => setPhase(e.target.value as PhotoPhase)}
            className="rounded-md border border-border bg-bg px-3 py-2 text-sm"
          >
            {PHASES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block grow">
          <span className="mb-1 block text-xs text-muted">Caption (optional)</span>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={`e.g. ${getStage(project.stage).label} — north elevation`}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-bg transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {busy ? "Adding…" : "+ Add photo"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && <p className="mt-2 text-sm text-primary-hover">{error}</p>}

      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        {PHASES.map((p) => {
          const shots = project.photos.filter((ph) => ph.phase === p.id);
          return (
            <div key={p.id}>
              <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
                {p.label}{" "}
                <span className="text-primary-hover">{shots.length > 0 ? `· ${shots.length}` : ""}</span>
              </h4>
              <div className="mt-2 space-y-3">
                {shots.length === 0 && (
                  <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted">
                    No {p.label.toLowerCase()} photos yet
                  </p>
                )}
                {shots.map((ph) => (
                  <figure key={ph.id} className="overflow-hidden rounded-md border border-border bg-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ph.dataUrl} alt={ph.caption || `${p.label} photo`} className="w-full" />
                    <figcaption className="flex items-center justify-between gap-2 p-2 text-xs">
                      <span className="truncate text-muted">
                        {ph.caption || getStage(ph.stage).label}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemove(ph.id)}
                        className="shrink-0 text-muted hover:text-primary-hover"
                        aria-label="Remove photo"
                      >
                        ✕
                      </button>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
