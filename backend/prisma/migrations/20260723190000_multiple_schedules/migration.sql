-- Splits the single Settings singleton into Account (credentials only) and
-- BookingSchedule (one row per recurring weekly booking). Existing data is
-- migrated: the current Settings row's schedule fields become exactly one
-- BookingSchedule row, its credentials become the Account row, and every
-- existing BookingAttempt is linked to that migrated schedule. If Settings
-- is empty (fresh install, migration runs before first app boot), the
-- INSERT ... SELECT statements below are simply no-ops.

-- CreateTable
CREATE TABLE "BookingSchedule" (
    "id" TEXT NOT NULL,
    "label" TEXT,
    "partnerMemberIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "partnerMemberNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetWeekday" "Weekday" NOT NULL DEFAULT 'MONDAY',
    "targetTime" TEXT NOT NULL DEFAULT '19:00',
    "courtPreference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "clubId" TEXT NOT NULL,
    "membershipNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- Backfill: existing Settings row -> one BookingSchedule row with a fixed,
-- known id so we can link existing BookingAttempt rows to it below.
INSERT INTO "BookingSchedule" (
    "id", "label", "partnerMemberIds", "partnerMemberNames",
    "targetWeekday", "targetTime", "courtPreference", "durationMinutes",
    "enabled", "createdAt", "updatedAt"
)
SELECT
    '11111111-1111-1111-1111-111111111111',
    'Wekelijkse boeking',
    "partnerMemberIds",
    "partnerMemberNames",
    "targetWeekday",
    "targetTime",
    "courtPreference",
    "durationMinutes",
    true,
    now(),
    now()
FROM "Settings"
WHERE "id" = 1;

-- Backfill: existing Settings row -> Account row (credentials only).
INSERT INTO "Account" ("id", "clubId", "membershipNumber", "password", "updatedAt")
SELECT 1, "clubId", "membershipNumber", "password", now()
FROM "Settings"
WHERE "id" = 1;

-- AlterTable: add scheduleId as nullable first so we can backfill it.
ALTER TABLE "BookingAttempt" ADD COLUMN "scheduleId" TEXT;

UPDATE "BookingAttempt"
SET "scheduleId" = '11111111-1111-1111-1111-111111111111'
WHERE "scheduleId" IS NULL;

ALTER TABLE "BookingAttempt" ALTER COLUMN "scheduleId" SET NOT NULL;

-- DropTable
DROP TABLE "Settings";

-- DropIndex
DROP INDEX "BookingAttempt_createdAt_idx";

-- CreateIndex
CREATE INDEX "BookingAttempt_scheduleId_createdAt_idx" ON "BookingAttempt"("scheduleId", "createdAt");

-- AddForeignKey
ALTER TABLE "BookingAttempt" ADD CONSTRAINT "BookingAttempt_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "BookingSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
