"use client";

import { useCallback, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { SEED_PROJECTS } from "./content";
import { ORDER_STAGE, nextStage, stageIndex } from "./stages";
import type { BuildPhoto, Project, StageId } from "./types";

const KEY = "mbcrm.projects.v1";
const SEED_FLAG = "mbcrm.seeded.v1";

export function genId(prefix = "mb"): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function genOrderNumber(): string {
  return `MB-${Math.floor(1000 + Math.random() * 9000)}`;
}

export interface NewProjectInput {
  name: string;
  contactName: string;
  contactEmail: string;
  buildingType: string;
  use: string;
  region: string;
  width: number | null;
  length: number | null;
  eaveHeight: number | null;
  notes: string;
}

export function useProjects() {
  const [projects, setProjects, hydrated] = useLocalStorage<Project[]>(KEY, []);

  // One-time seed so the MVP has something to click through. Never reseeds
  // after the user has touched the data (guarded by a separate flag).
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }
    if (window.localStorage.getItem(SEED_FLAG)) {
      return;
    }
    window.localStorage.setItem(SEED_FLAG, "1");
    if (projects.length === 0) {
      setProjects(SEED_PROJECTS);
    }
  }, [hydrated, projects.length, setProjects]);

  const create = useCallback(
    (input: NewProjectInput): Project => {
      const ts = new Date().toISOString();
      const project: Project = {
        id: genId(),
        ...input,
        stage: "lead",
        nextTask: "First-touch follow-up within 24h",
        orderConfirmed: false,
        orderNumber: null,
        photos: [],
        createdAt: ts,
        updatedAt: ts,
      };
      setProjects((prev) => [project, ...prev]);
      return project;
    },
    [setProjects],
  );

  const patch = useCallback(
    (id: string, changes: Partial<Project>) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, ...changes, updatedAt: new Date().toISOString() }
            : p,
        ),
      );
    },
    [setProjects],
  );

  const setStage = useCallback(
    (id: string, stage: StageId) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== id) {
            return p;
          }
          // Crossing into the deposit stage = this is now an actual order.
          const becomesOrder = stageIndex(stage) >= stageIndex(ORDER_STAGE);
          return {
            ...p,
            stage,
            orderConfirmed: becomesOrder ? true : p.orderConfirmed,
            orderNumber:
              becomesOrder && !p.orderNumber ? genOrderNumber() : p.orderNumber,
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [setProjects],
  );

  const advance = useCallback(
    (id: string) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== id) {
            return p;
          }
          const next = nextStage(p.stage);
          // Guardrail: a deal cannot reach "complete" unless it became a real order.
          if (next === "complete" && !p.orderConfirmed) {
            return p;
          }
          if (!next) {
            return p;
          }
          const becomesOrder = stageIndex(next) >= stageIndex(ORDER_STAGE);
          return {
            ...p,
            stage: next,
            orderConfirmed: becomesOrder ? true : p.orderConfirmed,
            orderNumber:
              becomesOrder && !p.orderNumber ? genOrderNumber() : p.orderNumber,
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [setProjects],
  );

  const addPhoto = useCallback(
    (id: string, photo: Omit<BuildPhoto, "id">) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                photos: [...p.photos, { ...photo, id: genId("ph") }],
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
      );
    },
    [setProjects],
  );

  const removePhoto = useCallback(
    (id: string, photoId: string) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, photos: p.photos.filter((ph) => ph.id !== photoId) }
            : p,
        ),
      );
    },
    [setProjects],
  );

  const remove = useCallback(
    (id: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    },
    [setProjects],
  );

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
