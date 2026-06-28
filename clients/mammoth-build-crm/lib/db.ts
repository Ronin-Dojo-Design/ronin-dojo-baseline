import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../.generated/prisma/client";

/**
 * Mammoth Build CRM — Prisma client singleton (ADR 0038: own DB per product).
 *
 * Mirrors `apps/web/services/db.ts`'s driver-adapter pattern, trimmed to a
 * single local DATABASE_URL (`mammoth_dev`). Prisma 7 `engineType = "client"`
 * has no Rust query engine — it talks to Postgres through a runtime driver
 * adapter (`@prisma/adapter-pg` over `pg`), so the client MUST be constructed
 * with an `adapter`. The Neon pooled/direct-URL split that `apps/web` does for
 * Vercel migrations is a Phase-2 concern (provisioned at SHIP), not local dev.
 *
 * Cached on `globalThis` in dev so Next's hot-reload doesn't open a new pool per
 * edit (the standard Next + Prisma singleton guard).
 */
const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  mammothDbGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const db = globalThis.mammothDbGlobal ?? prismaClientSingleton();

export { db };

if (process.env.NODE_ENV !== "production") {
  globalThis.mammothDbGlobal = db;
}
