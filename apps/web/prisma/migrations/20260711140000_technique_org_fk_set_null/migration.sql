-- SESSION_0528 (ADR 0046 D1, Doug P2) — flip Technique.organizationId FK from ON DELETE CASCADE to
-- ON DELETE SET NULL. The org is a SOFT grouping (the author's school); the Passport is the owner.
-- Deleting a school Organization must DEMOTE its techniques to profile-only (organizationId -> NULL),
-- never hard-delete a member's authored curriculum.
--
-- Additive / backward-safe: no rows change, only the FK's ON DELETE action. Drop + re-add is the only
-- way to alter an existing FK's referential action in Postgres.
ALTER TABLE "Technique" DROP CONSTRAINT "Technique_organizationId_fkey";

ALTER TABLE "Technique" ADD CONSTRAINT "Technique_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
