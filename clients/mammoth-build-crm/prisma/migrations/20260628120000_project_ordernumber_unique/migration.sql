-- Order number is a business key — enforce uniqueness at the database (app-side allocation in
-- lib/actions.ts also collision-checks). Postgres treats NULLs as distinct, so pre-order projects
-- (orderNumber IS NULL) are unaffected.

-- CreateIndex
CREATE UNIQUE INDEX "Project_orderNumber_key" ON "Project"("orderNumber");
