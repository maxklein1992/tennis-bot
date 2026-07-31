-- Converts Account from a hardcoded singleton (id always 1, shared by
-- everyone) into one row per User, and gives BookingSchedule an explicit
-- owning Account. Until now there was at most one User and one Account in
-- any given database, so the backfill below links the existing Account
-- (id=1, if present) to the oldest existing User, and every existing
-- BookingSchedule to that same Account. On a fresh install (no rows yet)
-- every UPDATE/backfill statement here is a no-op.
--
-- An Account row that ends up with no linked User (only possible on a
-- non-production environment where seedFromEnvIfEmpty() ran at boot but
-- nobody ever registered) is unreachable/ownerless data; it — and any
-- BookingSchedule/BookingAttempt rows that depended on it — is deleted here.

-- AlterTable: add Account.userId as nullable first so we can backfill it.
ALTER TABLE "Account" ADD COLUMN "userId" TEXT;

-- Backfill: the existing singleton Account -> the oldest existing User.
UPDATE "Account"
SET "userId" = (SELECT "id" FROM "User" ORDER BY "createdAt" ASC LIMIT 1)
WHERE "userId" IS NULL;

-- AlterTable: add BookingSchedule.accountId as nullable so we can backfill
-- it too, before we might delete an orphaned Account below (we need this
-- column populated first so the orphan cleanup can find dependent rows).
ALTER TABLE "BookingSchedule" ADD COLUMN "accountId" INTEGER;

-- Backfill: every existing BookingSchedule -> the (until now, only)
-- existing Account, whether or not that Account turned out to be orphaned.
UPDATE "BookingSchedule"
SET "accountId" = (SELECT "id" FROM "Account" ORDER BY "id" ASC LIMIT 1)
WHERE "accountId" IS NULL;

-- Cleanup: drop any Account row (and its now-linked BookingSchedule /
-- BookingAttempt rows) that still has no User — see header note. No FK
-- exists yet at this point, so this is done manually, child-first.
DELETE FROM "BookingAttempt"
WHERE "scheduleId" IN (
    SELECT "id" FROM "BookingSchedule"
    WHERE "accountId" IN (SELECT "id" FROM "Account" WHERE "userId" IS NULL)
);
DELETE FROM "BookingSchedule"
WHERE "accountId" IN (SELECT "id" FROM "Account" WHERE "userId" IS NULL);
DELETE FROM "Account" WHERE "userId" IS NULL;

ALTER TABLE "Account" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_key" ON "Account"("userId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: Account.id moves from a hardcoded DEFAULT 1 to a real
-- autoincrement sequence, so new per-user Account rows get fresh ids.
ALTER TABLE "Account" ALTER COLUMN "id" DROP DEFAULT;
CREATE SEQUENCE IF NOT EXISTS "Account_id_seq" OWNED BY "Account"."id";
ALTER TABLE "Account" ALTER COLUMN "id" SET DEFAULT nextval('"Account_id_seq"');
-- Move the sequence past the pre-existing hardcoded id=1 row (if any) so the
-- next auto-generated id can't collide with it.
SELECT setval('"Account_id_seq"', GREATEST((SELECT COALESCE(MAX("id"), 0) FROM "Account"), 1));

ALTER TABLE "BookingSchedule" ALTER COLUMN "accountId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "BookingSchedule_accountId_idx" ON "BookingSchedule"("accountId");

-- AddForeignKey
ALTER TABLE "BookingSchedule" ADD CONSTRAINT "BookingSchedule_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
