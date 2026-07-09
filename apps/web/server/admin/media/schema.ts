import { createSearchParamsCache, parseAsInteger, parseAsString } from "nuqs/server"
import { getSortingStateParser } from "~/lib/parsers"
import type { MediaRow } from "./queries"

/**
 * Params/sort schema for the Media gallery (`/app/media`), mirroring the People list
 * (`server/admin/people/schema.ts`) so `/app/media` consumes the ONE `AdminCollection`
 * frame instead of a hand-rolled grid (ADR 0045).
 *
 * The single search axis is keyed `title` (a real `MediaRow` key that is ALSO the Title
 * column id) so the toolbar renders the search input and `useDataTable` targets that
 * column; the derived `title` URL param is fanned across title + description in
 * `findMedia` (the old hand-rolled page's `q` param, renamed to the column id per the
 * People exemplar). Default sort `createdAt desc` matches the gallery's prior ordering.
 */
export const mediaTableParamsSchema = {
  title: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(24),
  sort: getSortingStateParser<MediaRow>().withDefault([{ id: "createdAt", desc: true }]),
}

export const mediaTableParamsCache = createSearchParamsCache(mediaTableParamsSchema)
export type MediaTableSchema = Awaited<ReturnType<typeof mediaTableParamsCache.parse>>
