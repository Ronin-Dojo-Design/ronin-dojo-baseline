import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import { PlanningIntakeStatus } from "~/.generated/prisma/browser"
import { getSortingStateParser } from "~/lib/parsers"
import type { PlanningIntakeAdminRow } from "./queries"

/**
 * Params/sort schema for the PlanningIntake triage index (`/app/planning-intake`, SESSION_0592) —
 * an AdminCollection sibling of `/app/techniques`. `status` defaults to `NEW` so the surface opens
 * on the untriaged queue (the reason this list exists); `"all"` clears it. `body` backs the
 * toolbar search field (mirrors `techniques`' `name` / `reports`' `message`).
 */
export const planningIntakeTableParamsSchema = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  sort: getSortingStateParser<PlanningIntakeAdminRow>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  body: parseAsString.withDefault(""),
  status: parseAsStringEnum([...Object.values(PlanningIntakeStatus), "all"] as const).withDefault(
    PlanningIntakeStatus.NEW,
  ),
}

export const planningIntakeTableParamsCache = createSearchParamsCache(
  planningIntakeTableParamsSchema,
)
export type PlanningIntakeTableSchema = Awaited<
  ReturnType<typeof planningIntakeTableParamsCache.parse>
>
