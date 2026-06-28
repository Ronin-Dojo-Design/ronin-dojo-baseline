"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addPhoto as addPhotoAction,
  advanceProject,
  createProject,
  listProjects,
  patchProject,
  removePhoto as removePhotoAction,
  removeProject,
  setProjectStage,
} from "./actions";
import type { BuildPhoto, NewProjectInput, Project, StageId } from "./types";

export type { NewProjectInput } from "./types";

/**
 * useProjects — the CRM data hook (ADR 0038 Phase 2).
 *
 * Same surface the components already consume, now backed by Prisma server
 * actions over `mammoth_dev` instead of localStorage. The guardrails (order
 * confirmation at deposit, can't-complete-without-order) live server-side in
 * `lib/actions.ts`; this hook just calls them and mirrors the authoritative
 * result into local state. `patch` is optimistic so per-keystroke edits (the
 * next-step field) stay responsive; click actions apply the server's result.
 */
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    listProjects().then((list) => {
      if (alive) {
        setProjects(list);
        setHydrated(true);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const replace = useCallback((updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const create = useCallback(async (input: NewProjectInput): Promise<Project> => {
    const project = await createProject(input);
    setProjects((prev) => [project, ...prev]);
    return project;
  }, []);

  const patch = useCallback(
    async (id: string, changes: Partial<Project>) => {
      // Optimistic: reflect the edit immediately, then persist in the background.
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, ...changes, updatedAt: new Date().toISOString() } : p,
        ),
      );
      await patchProject(id, changes);
    },
    [],
  );

  const setStage = useCallback(
    async (id: string, stage: StageId) => {
      replace(await setProjectStage(id, stage));
    },
    [replace],
  );

  const advance = useCallback(
    async (id: string) => {
      replace(await advanceProject(id));
    },
    [replace],
  );

  const addPhoto = useCallback(
    async (id: string, photo: Omit<BuildPhoto, "id">) => {
      replace(await addPhotoAction(id, photo));
    },
    [replace],
  );

  const removePhoto = useCallback(
    async (id: string, photoId: string) => {
      replace(await removePhotoAction(id, photoId));
    },
    [replace],
  );

  const remove = useCallback(async (id: string) => {
    await removeProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    projects,
    hydrated,
    create,
    patch,
    setStage,
    advance,
    addPhoto,
    removePhoto,
    remove,
  };
}
