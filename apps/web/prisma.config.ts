import "dotenv/config"
import path from "node:path"
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),

  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "bun prisma/seed.ts",
  },

  datasource: {
    url: env("DATABASE_URL"),
    // SHADOW_DATABASE_URL is only used by `prisma migrate dev` locally;
    // production builds (Vercel) don't need it. The conditional spread
    // keeps the field absent when the env var isn't set, avoiding a
    // strict PrismaConfigEnvError during postinstall.
    ...(process.env.SHADOW_DATABASE_URL && {
      shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
    }),
  },
})
