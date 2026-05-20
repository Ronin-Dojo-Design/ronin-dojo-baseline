import "dotenv/config"
import path from "node:path"
import { defineConfig, env } from "prisma/config"

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
    // Prisma 7 config only exposes datasource.url/shadowDatabaseUrl.
    // Runtime still uses the pooled DATABASE_URL in services/db.ts; Vercel
    // migration commands normalize DIRECT_URL/DATABASE_URL to Neon's direct
    // host to avoid transaction-pooler advisory-lock races.
    url: prismaCliDatabaseUrl,
    // SHADOW_DATABASE_URL is only used by `prisma migrate dev` locally;
    // production builds (Vercel) don't need it. The conditional spread
    // keeps the field absent when the env var isn't set, avoiding a
    // strict PrismaConfigEnvError during postinstall.
    ...(process.env.SHADOW_DATABASE_URL && {
      shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
    }),
  },
})
