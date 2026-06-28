import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../.generated/prisma/client";

/**
 * Baseline — Prisma client singleton (ADR 0038: own DB per product).
 *
 * Mirrors `apps/web/services/db.ts` and `clients/mammoth-build-crm/lib/db.ts`'s
 * driver-adapter pattern, trimmed to a single local DATABASE_URL (`baseline_dev`).
 * Prisma 7 `engineType = "client"` has no Rust query engine — it talks to Postgres
 * through a runtime driver adapter (`@prisma/adapter-pg` over `pg`), so the client
 * MUST be constructed with an `adapter`. The Neon pooled/direct-URL split that
 * `apps/web` does for Vercel migrations is a deploy-phase concern (operator-gated),
 * not local dev.
 *
 * Cached on `globalThis` in dev so Next's hot-reload doesn't open a new pool per
 * edit (the standard Next + Prisma singleton guard).
 */
const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Fail loud at construction (clear message) rather than with an opaque pg
    // connection error at the first query — mirrors apps/web's validated env contract.
    throw new Error("DATABASE_URL is required (Baseline owns its own database — ADR 0038).");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  baselineDbGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const db = globalThis.baselineDbGlobal ?? prismaClientSingleton();

export { db };

if (process.env.NODE_ENV !== "production") {
  globalThis.baselineDbGlobal = db;
}
