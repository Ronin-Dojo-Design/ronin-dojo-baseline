const ALLOWED_SEED_DATABASES = new Set(["ronindojo_test", "ronindojo_e2e", "ronindojo_dev"])

export function assertSafeSeedTarget(
  databaseUrl: string | undefined,
): asserts databaseUrl is string {
  if (!databaseUrl) throw new Error("Refusing to seed: DATABASE_URL is unset")

  let dbName: string
  try {
    dbName = decodeURIComponent(new URL(databaseUrl).pathname.replace(/^\//, ""))
  } catch {
    throw new Error("Refusing to seed: DATABASE_URL is invalid")
  }

  const isNamedScratch = /^ronindojo_[a-z0-9_-]*scratch[a-z0-9_-]*$/i.test(dbName)
  if (!ALLOWED_SEED_DATABASES.has(dbName) && !isNamedScratch) {
    throw new Error(
      `Refusing to seed protected database "${dbName}". Use ronindojo_test, ronindojo_e2e, ronindojo_dev, or a named ronindojo_*scratch* database.`,
    )
  }
}
