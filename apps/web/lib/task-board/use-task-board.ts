"use client"

/**
 * useTaskBoard — the board state hook (spec "Data wiring flow").
 *
 * - localStorage-first hydrate, then one-time AdminTaskForge migration if the
 *   board store is empty but Forge data exists (spec "Migration note").
 * - Optimistic in-memory updates; every change is debounced-saved through the
 *   BoardStore PORT (ADR 0033 D2) — the hook never names a backend.
 * - Pure reducer so the add / toggle / reschedule transitions are testable.
 */

import { useCallback, useEffect, useReducer, useRef, useState } from "react"
import { localStorageBoardStore, type BoardStore } from "./board-store"
import { readAndMigrateForge } from "./migrate-forge"
import { makeId } from "./seed"
import type { BoardData, Task, TaskLane, TaskPriority } from "./types"

type AddTaskInput = {
  project: string
  title: string
  due?: string | null
  lane?: TaskLane | null
  priority?: TaskPriority | null
  labels?: string[]
}

type Action =
  | { type: "hydrate"; data: BoardData }
  | { type: "add"; input: AddTaskInput }
  | { type: "toggleDone"; id: string }
  | { type: "reschedule"; id: string; due: string | null }
  | { type: "setLane"; id: string; lane: TaskLane | null }
  | { type: "clearQF" }
  | { type: "remove"; id: string }

export function boardReducer(state: BoardData, action: Action): BoardData {
  switch (action.type) {
    case "hydrate":
      return action.data

    case "add": {
      const task: Task = {
        id: makeId(),
        project: action.input.project,
        title: action.input.title.trim(),
        due: action.input.due ?? null,
        lane: action.input.lane ?? null,
        status: "active",
        priority: action.input.priority ?? null,
        labels: action.input.labels,
        done: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      }
      // Optimistic insert at the top of the list (spec behavior #1).
      return { ...state, tasks: [task, ...state.tasks] }
    }

    case "toggleDone":
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.id
            ? {
                ...t,
                done: !t.done,
                completedAt: !t.done ? new Date().toISOString() : null,
              }
            : t,
        ),
      }

    case "reschedule":
      return {
        ...state,
        tasks: state.tasks.map(t => (t.id === action.id ? { ...t, due: action.due } : t)),
      }

    case "setLane":
      return {
        ...state,
        tasks: state.tasks.map(t => (t.id === action.id ? { ...t, lane: action.lane } : t)),
      }

    case "clearQF":
      // "Clear all QF" batch action (spec behavior #5): mark done, stamp.
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.lane === "QF" && !t.done
            ? { ...t, done: true, completedAt: new Date().toISOString() }
            : t,
        ),
      }

    case "remove":
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) }

    default:
      return state
  }
}

const SAVE_DEBOUNCE_MS = 400

export function useTaskBoard(initial: BoardData, store: BoardStore = localStorageBoardStore) {
  const [state, dispatch] = useReducer(boardReducer, initial)
  const [hydrated, setHydrated] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didHydrate = useRef(false)

  // Hydrate once on mount: store first, then Forge migration, else keep the seed.
  useEffect(() => {
    if (didHydrate.current) return
    didHydrate.current = true
    let cancelled = false
    void (async () => {
      const stored = await store.load()
      if (cancelled) return
      if (stored) {
        dispatch({ type: "hydrate", data: stored })
      } else {
        const migrated = readAndMigrateForge()
        if (migrated) {
          dispatch({ type: "hydrate", data: migrated })
          void store.save(migrated)
        }
      }
      setHydrated(true)
    })()
    return () => {
      cancelled = true
    }
  }, [store])

  // Debounced persistence through the port. Only after the first hydrate so we
  // never clobber stored data with the seed on mount.
  useEffect(() => {
    if (!hydrated) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      void store.save(state)
    }, SAVE_DEBOUNCE_MS)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [state, hydrated, store])

  const addTask = useCallback((input: AddTaskInput) => dispatch({ type: "add", input }), [])
  const toggleDone = useCallback((id: string) => dispatch({ type: "toggleDone", id }), [])
  const reschedule = useCallback(
    (id: string, due: string | null) => dispatch({ type: "reschedule", id, due }),
    [],
  )
  const setLane = useCallback(
    (id: string, lane: TaskLane | null) => dispatch({ type: "setLane", id, lane }),
    [],
  )
  const clearQF = useCallback(() => dispatch({ type: "clearQF" }), [])
  const removeTask = useCallback((id: string) => dispatch({ type: "remove", id }), [])

  return { state, hydrated, addTask, toggleDone, reschedule, setLane, clearQF, removeTask }
}

export type { AddTaskInput }
