/**
 * Pure parser for the retired localStorage AdminTaskBoard payload (`bbl_admin_taskboard_v1`).
 *
 * Extracted from the client migration effect so it is unit-testable and side-effect-free: raw JSON
 * string in → the minimal `LegacyTaskInput[]` the importer needs out. Resolves each task's project id to
 * its display name (the migrated card keeps it as a provenance badge). Corrupt/empty input → `[]`.
 */

/** The minimal slice the importer lifts from a legacy task (also the `importTasks` input shape). */
export type LegacyTaskInput = {
  id: string
  title: string
  done: boolean
  lane?: "QF" | "HF" | null
  due?: string | null
  project?: string | null
}

type LegacyStoredTask = {
  id: string
  title: string
  done?: boolean
  lane?: "QF" | "HF" | null
  due?: string | null
  project?: string
}
type LegacyStoredBoard = { projects?: { id: string; name: string }[]; tasks?: LegacyStoredTask[] }

export function parseLegacyTaskBoard(raw: string | null): LegacyTaskInput[] {
  if (!raw) {
    return []
  }
  let data: LegacyStoredBoard
  try {
    data = JSON.parse(raw) as LegacyStoredBoard
  } catch {
    return []
  }
  const projectName = (id?: string) => data.projects?.find(p => p.id === id)?.name ?? id ?? null
  return (data.tasks ?? [])
    .filter(t => t?.id && t?.title)
    .map(t => ({
      id: t.id,
      title: t.title,
      done: Boolean(t.done),
      lane: t.lane ?? null,
      due: t.due ?? null,
      project: projectName(t.project),
    }))
}
