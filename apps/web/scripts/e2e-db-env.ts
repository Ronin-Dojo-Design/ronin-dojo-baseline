export const LOCAL_E2E_DATABASE_NAME = "ronindojo_e2e"
export const CI_E2E_DATABASE_NAME = "ronindojo_test"

const POSTGRES_PROTOCOLS = new Set(["postgres:", "postgresql:"])
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1"])
const POSTGRES_DEFAULT_PORT = "5432"

export interface DatabaseGuardOptions {
  /** `ronindojo_test` is accepted only for an explicitly identified CI process. */
  isCi?: boolean
}

export interface LocalPostgresTarget {
  host: string
  port: string
  database: string
}

function explicitCi(options: DatabaseGuardOptions): boolean {
  return options.isCi ?? process.env.CI === "true"
}

function expectedDatabaseDescription(options: DatabaseGuardOptions): string {
  return explicitCi(options)
    ? `"${LOCAL_E2E_DATABASE_NAME}" or CI-only "${CI_E2E_DATABASE_NAME}"`
    : `"${LOCAL_E2E_DATABASE_NAME}"`
}

/**
 * Parse the effective endpoint of a local PostgreSQL URL without connecting to it.
 *
 * `pg-connection-string` lets `?host=` and `?port=` override the authority, so those query
 * parameters are rejected rather than trusting only `URL.hostname` / `URL.port`.
 */
export function parseLocalPostgresTarget(
  databaseUrl: string | undefined,
  label = "DATABASE_URL",
): LocalPostgresTarget {
  if (!databaseUrl) throw new Error(`${label} is required`)

  let parsed: URL
  try {
    parsed = new URL(databaseUrl)
  } catch {
    throw new Error(`Refusing invalid ${label}`)
  }

  if (!POSTGRES_PROTOCOLS.has(parsed.protocol)) {
    throw new Error(`Refusing non-Postgres ${label} protocol "${parsed.protocol}"`)
  }

  if (parsed.searchParams.has("host") || parsed.searchParams.has("port")) {
    throw new Error(`Refusing ${label} endpoint overrides in query parameters`)
  }

  const bracketlessHost = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase()
  if (!LOOPBACK_HOSTS.has(bracketlessHost)) {
    throw new Error(`Refusing non-loopback ${label} host`)
  }

  let database: string
  try {
    database = decodeURIComponent(parsed.pathname.replace(/^\//, ""))
  } catch {
    throw new Error(`Refusing invalid ${label} database name`)
  }

  return {
    host: bracketlessHost,
    port: parsed.port || POSTGRES_DEFAULT_PORT,
    database,
  }
}

export function assertLiteralLocalE2eUrl(
  databaseUrl: string | undefined,
  label = "DATABASE_URL",
  options: DatabaseGuardOptions = {},
): asserts databaseUrl is string {
  const target = parseLocalPostgresTarget(databaseUrl, label)
  const databaseIsAllowed =
    target.database === LOCAL_E2E_DATABASE_NAME ||
    (explicitCi(options) && target.database === CI_E2E_DATABASE_NAME)

  if (!databaseIsAllowed) {
    throw new Error(
      `Refusing non-e2e ${label} target "${target.database}"; expected ${expectedDatabaseDescription(options)}`,
    )
  }
}

export function assertLiteralLocalE2eUrls(
  databaseUrl: string | undefined,
  directUrl: string | undefined,
  options: DatabaseGuardOptions = {},
): asserts databaseUrl is string {
  if (!databaseUrl) throw new Error("DATABASE_URL is required for local e2e")
  if (!directUrl) throw new Error("DIRECT_URL is required for local e2e")

  assertLiteralLocalE2eUrl(databaseUrl, "DATABASE_URL", options)
  assertLiteralLocalE2eUrl(directUrl, "DIRECT_URL", options)

  const databaseTarget = parseLocalPostgresTarget(databaseUrl, "DATABASE_URL")
  const directTarget = parseLocalPostgresTarget(directUrl, "DIRECT_URL")
  if (
    databaseTarget.host !== directTarget.host ||
    databaseTarget.port !== directTarget.port ||
    databaseTarget.database !== directTarget.database
  ) {
    throw new Error(
      "Refusing divergent DATABASE_URL and DIRECT_URL endpoints; normalized host, port, and database must match",
    )
  }
}

/**
 * Prisma CLI prefers DIRECT_URL over DATABASE_URL locally. Bun also auto-loads `.env`, so a
 * missing DIRECT_URL in `.env.e2e` can otherwise be filled from `.env` when Prisma config imports
 * `dotenv/config`, leaving the child pointed at prodsnap even when DATABASE_URL names ronindojo_e2e.
 * Force both URLs from the already-validated e2e URL.
 */
export function e2ePrismaChildEnv<T extends Readonly<Record<string, string | undefined>>>(
  parent: T,
  databaseUrl: string,
  options: DatabaseGuardOptions = {},
): T & { DATABASE_URL: string; DIRECT_URL: string } {
  assertLiteralLocalE2eUrl(databaseUrl, "Prisma", options)
  return { ...parent, DATABASE_URL: databaseUrl, DIRECT_URL: databaseUrl }
}
