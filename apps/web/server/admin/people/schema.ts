import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import { getSortingStateParser } from "~/lib/parsers"
import type { PersonRow } from "./queries"

/**
 * Params/sort schema for the Passport-keyed People list (`/app/users`). Mirrors the
 * users params cache but the sort generic is the Passport `PersonRow` (not `User`) — the
 * list is keyed on Passport (ADR 0025) so accountless roster placeholders appear. Default
 * sort `createdAt desc`; the search param stays `name`.
 */
export const peopleTableParamsSchema = {
  // The single search axis. Keyed `displayName` (not `name`) so it matches BOTH the Name
  // column id and the `DataTableFilterField` id — nuqs derives the URL param from the field
  // id and `useDataTable` targets the same-id column. The term is fanned across the Passport
  // identity fields + the linked account in `findPeople`.
  displayName: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(50),
  sort: getSortingStateParser<PersonRow>().withDefault([{ id: "createdAt", desc: true }]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}

export const peopleTableParamsCache = createSearchParamsCache(peopleTableParamsSchema)
export type PeopleTableSchema = Awaited<ReturnType<typeof peopleTableParamsCache.parse>>
