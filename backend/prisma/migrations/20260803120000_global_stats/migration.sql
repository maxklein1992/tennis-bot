-- Adds a site-wide GlobalStats singleton (id always 1) for the homepage
-- "totaal aantal reserveringen" counter. Backfilled with the current
-- BookingSchedule count so existing (already created) schedules count
-- toward the historical total from day one. From here on,
-- SchedulesService.create() increments this counter directly; it is never
-- decremented, including when a schedule is later deleted.

-- CreateTable
CREATE TABLE "GlobalStats" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "totalSchedulesCreated" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GlobalStats_pkey" PRIMARY KEY ("id")
);

-- Backfill: seed the singleton row with the current schedule count.
INSERT INTO "GlobalStats" ("id", "totalSchedulesCreated")
SELECT 1, COUNT(*) FROM "BookingSchedule";
