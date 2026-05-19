export const parseSort = <T extends readonly string[]>(
  sort: string | undefined,
  columns: T,
  defaultOrder: "asc" | "desc" = "asc",
): { sortBy: T[number] | undefined; sortOrder: "asc" | "desc" } => {
  const [rawSortBy, rawSortOrder] = sort ? sort.split(".") : [undefined, undefined]
  const sortBy = (columns as readonly string[]).includes(rawSortBy ?? "")
    ? (rawSortBy as T[number])
    : undefined
  const sortOrder = rawSortOrder === "desc" ? "desc" : defaultOrder === "desc" ? "desc" : "asc"
  return { sortBy, sortOrder }
}
