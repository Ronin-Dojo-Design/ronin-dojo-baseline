import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

// Baseline — Prisma config (ADR 0038: one database per product).
//
// Prisma 7 moved the Migrate connection URL out of schema.prisma into here.
// Local-first: a single DATABASE_URL (baseline_dev), no Neon pooled/direct split
// yet — that's the deploy phase (operator-gated), where this file grows to mirror
// apps/web/prisma.config.ts (which normalizes Neon's pooled/direct hosts for
// Vercel migrations).
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),

  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "bun prisma/seed.ts",
  },

  datasource: {
    url: env("DATABASE_URL"),
  },
});
