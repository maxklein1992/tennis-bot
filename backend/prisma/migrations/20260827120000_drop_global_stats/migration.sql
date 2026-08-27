-- Drops the GlobalStats singleton table. The homepage "reserveringen
-- gemaakt" stat no longer reads from this hand-maintained counter (which
-- counted BookingSchedule.create() calls, i.e. distinct recurring
-- reservations). It now counts every successful, non-dry-run
-- BookingAttempt directly, so a recurring reservation that has been
-- activated 3 weeks in a row counts as 3, not 1. See StatsService.get().

-- DropTable
DROP TABLE "GlobalStats";
