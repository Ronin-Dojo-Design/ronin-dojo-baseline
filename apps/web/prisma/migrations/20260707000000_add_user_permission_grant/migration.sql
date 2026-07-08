-- FI-019: additive per-user global capability grants inside the existing `can()` axis.
CREATE TABLE "UserPermissionGrant" (
  "id" TEXT NOT NULL,
  "grant" TEXT NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  "userId" TEXT NOT NULL,
  "grantedById" TEXT,

  CONSTRAINT "UserPermissionGrant_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserPermissionGrant_userId_revokedAt_idx" ON "UserPermissionGrant"("userId", "revokedAt");
CREATE INDEX "UserPermissionGrant_grant_revokedAt_idx" ON "UserPermissionGrant"("grant", "revokedAt");
CREATE INDEX "UserPermissionGrant_grantedById_idx" ON "UserPermissionGrant"("grantedById");

-- Preserve historical revoked rows while allowing at most one active grant per user/key.
CREATE UNIQUE INDEX "UserPermissionGrant_userId_grant_active_key"
  ON "UserPermissionGrant"("userId", "grant")
  WHERE "revokedAt" IS NULL;

ALTER TABLE "UserPermissionGrant"
  ADD CONSTRAINT "UserPermissionGrant_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserPermissionGrant"
  ADD CONSTRAINT "UserPermissionGrant_grantedById_fkey"
  FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
