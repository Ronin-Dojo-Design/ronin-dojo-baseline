/**
 * Seed `mammoth_dev` from the MVP demo projects (ADR 0038 Phase 2).
 *
 * Idempotent: keyed on the stable seed ids (`seed-ridgeline`, …) so re-running
 * updates in place rather than duplicating, and the kernel board cards (which
 * key off `Project.id`) stay stable across re-seeds. Run: `bun run db:seed`.
 *
 * The seed's relative timestamps drive the board's rotting / stage-SLA
 * automations, but `Project.updatedAt` is `@updatedAt` (Prisma forces it to
 * now() on write), so we stamp createdAt/updatedAt with a final raw UPDATE to
 * preserve the at-risk demo fidelity.
 */

import { SEED_PROJECTS } from "../lib/content";
import { db } from "../lib/db";

async function main() {
  for (const p of SEED_PROJECTS) {
    const existing = await db.project.findUnique({ where: { id: p.id } });

    let contactId: string;
    if (existing) {
      contactId = existing.contactId;
      await db.contact.update({
        where: { id: contactId },
        data: { name: p.contactName, email: p.contactEmail },
      });
    } else {
      const contact = await db.contact.create({
        data: { name: p.contactName, email: p.contactEmail },
      });
      contactId = contact.id;
    }

    const fields = {
      name: p.name,
      buildingType: p.buildingType,
      use: p.use,
      region: p.region,
      width: p.width,
      length: p.length,
      eaveHeight: p.eaveHeight,
      stage: p.stage,
      nextTask: p.nextTask,
      orderConfirmed: p.orderConfirmed,
      orderNumber: p.orderNumber,
      notes: p.notes,
    };

    await db.project.upsert({
      where: { id: p.id },
      create: { id: p.id, contactId, ...fields },
      update: { ...fields },
    });

    // Preserve the demo's relative timestamps (bypasses @updatedAt).
    await db.$executeRaw`UPDATE "Project" SET "createdAt" = ${new Date(
      p.createdAt,
    )}, "updatedAt" = ${new Date(p.updatedAt)} WHERE id = ${p.id}`;
  }

  const count = await db.project.count();
  console.log(`✅ Seeded ${SEED_PROJECTS.length} projects · ${count} total in mammoth_dev`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
