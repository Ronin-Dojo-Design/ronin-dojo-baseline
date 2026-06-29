import "dotenv/config"
import path from "node:path"
import { defineConfig, env } from "prisma/config"

// Mammoth Build CRM — Prisma config (ADR 0038: one database per product).
//
// Prisma 7 moved the Migrate connection URL out of schema.prisma into here.
// Local dev = a single DATABASE_URL (mammoth_dev). On a Vercel deploy (Neon
// staging), migrations must run against Neon's DIRECT (non-pooled) host —
// transaction-pooler connections don't support the advisory locks Prisma Migrate
// takes — so we normalize the URL the same way apps/web/prisma.config.ts does:
// prefer DIRECT_URL, strip Neon's "-pooler" host suffix + the pgbouncer flag.
// The RUNTIME client (lib/db.ts) still uses the pooled DATABASE_URL.
const isVercelDeploy =
  process.env.VERCEL_ENV === "preview" || process.env.VERCEL_ENV === "production"

const toNeonDirectUrl = (connectionString: string | undefined) => {
  if (!connectionString) {
    return undefined
  }
  try {
    const url = new URL(connectionString)
    url.hostname = url.hostname.replace("-pooler", "")
    url.searchParams.delete("pgbouncer")
    return url.toString()
  } catch {
    return connectionString.replace("-pooler", "")
  }
}

const prismaCliDatabaseUrl = isVercelDeploy
  ? (toNeonDirectUrl(process.env.DIRECT_URL) ?? toNeonDirectUrl(process.env.DATABASE_URL))
  : (process.env.DIRECT_URL ?? env("DATABASE_URL"))

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),

  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "bun prisma/seed.ts",
  },

  datasource: {
    url: prismaCliDatabaseUrl,
    // Only set locally for `prisma migrate dev`; conditional spread keeps the
    // field absent (no PrismaConfigEnvError) when SHADOW_DATABASE_URL is unset.
    ...(process.env.SHADOW_DATABASE_URL && {
      shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
    }),
  },
})
