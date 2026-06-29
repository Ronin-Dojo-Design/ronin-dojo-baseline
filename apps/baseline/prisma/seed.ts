// Baseline — seed stub.
//
// The starter schema is lean (Lead + SchoolSettings). Seeding real data is OUT
// of scope for the scaffold (SESSION_0463 guard: "do NOT seed real data"). This
// only ensures the single SchoolSettings row exists with template defaults so a
// fresh `bunx prisma migrate dev && bun run db:seed` yields a runnable site.
//
// `bun run db:seed` runs this file (see prisma.config.ts migrations.seed).

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../.generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed Baseline (ADR 0038: own DB).");
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  await db.schoolSettings.upsert({
    where: { singleton: true },
    update: {},
    create: {
      singleton: true,
      schoolName: "Baseline Martial Arts",
      tagline: "Train where the lineage runs deep.",
      heroHeadline: "Find your dojo.",
      heroSub: "A modern school site, ready to make yours.",
    },
  });
  console.log("Seeded SchoolSettings (template defaults). No leads seeded.");
}

main()
  .then(() => db.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await db.$disconnect();
    process.exit(1);
  });
