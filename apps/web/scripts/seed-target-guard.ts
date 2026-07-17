import {
  CI_E2E_DATABASE_NAME,
  LOCAL_E2E_DATABASE_NAME,
  parseLocalPostgresTarget,
  type DatabaseGuardOptions,
} from "./e2e-db-env"

const LOCAL_SEED_DATABASES = new Set([LOCAL_E2E_DATABASE_NAME, "ronindojo_dev"])

/**
 * The full Prisma seed is destructive by design. Preserve the documented local dev/e2e/scratch
 * targets, but require a parsed loopback PostgreSQL authority. CI may additionally use its exact
 * disposable test database.
 */
export function assertSafeSeedTarget(
  databaseUrl: string | undefined,
  options: DatabaseGuardOptions = {},
): asserts databaseUrl is string {
  let database: string
  try {
    database = parseLocalPostgresTarget(databaseUrl, "DATABASE_URL").database
  } catch (error) {
    throw new Error(`Refusing to seed: ${(error as Error).message}`)
  }

  const isCi = options.isCi ?? process.env.CI === "true"
  const isNamedScratch = /^ronindojo_[a-z0-9_-]*scratch[a-z0-9_-]*$/i.test(database)
  const isAllowed =
    LOCAL_SEED_DATABASES.has(database) ||
    isNamedScratch ||
    (isCi && database === CI_E2E_DATABASE_NAME)

  if (!isAllowed) {
    const expected = isCi
      ? `${LOCAL_E2E_DATABASE_NAME}, ronindojo_dev, ronindojo_*scratch*, or CI-only ${CI_E2E_DATABASE_NAME}`
      : `${LOCAL_E2E_DATABASE_NAME}, ronindojo_dev, or ronindojo_*scratch*`
    throw new Error(
      `Refusing to seed protected database "${database}". Expected exact local ${expected}.`,
    )
  }
}
