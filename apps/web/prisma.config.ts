import "dotenv/config"
import path from "node:path"
import { defineConfig, env } from "prisma/config"

const isVercelDeploy =
  process.env.VERCEL_ENV === "preview" || process.env.VERCEL_ENV === "production"

const prismaCliDatabaseUrl =
  isVercelDeploy || process.env.DIRECT_URL ? env("DIRECT_URL") : env("DATABASE_URL")

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),

  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "bun prisma/seed.ts",
  },

  datasource: {
    // Prisma 7 config only exposes datasource.url/shadowDatabaseUrl.
    // Runtime still uses the pooled DATABASE_URL in services/db.ts; Vercel
    // migration commands use DIRECT_URL to avoid Neon's transaction pooler
    // holding or racing Prisma's session-level advisory lock.
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
