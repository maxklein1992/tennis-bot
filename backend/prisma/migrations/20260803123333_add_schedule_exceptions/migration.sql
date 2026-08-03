-- Voegt "uitzonderingen" toe op een BookingSchedule: per kalenderdatum kan
-- de gebruiker die datum laten overslaan (skip) of een ander
-- medespelers-groepje instellen voor die ene datum, zonder de wekelijkse
-- template te wijzigen. skip=true impliceert altijd lege
-- partnerMemberIds/Names — afgedwongen in ScheduleExceptionsService, niet in
-- de database (een CHECK-constraint kan de XOR-invariant niet volledig
-- uitdrukken).
--
-- "date" wordt bewust als DATE-kolom opgeslagen en overal in de applicatie
-- als kale YYYY-MM-DD-string behandeld (UTC-middernacht encoding bij
-- schrijven/lezen), nooit als Europe/Amsterdam-gezoneerde timestamp — anders
-- ontstaat een off-by-one-dag-bug rond DST-overgangen. Zie
-- BookingRunnerService.run() en ScheduleExceptionsService.
--
-- SKIPPED is een nieuwe AttemptStatus zodat een overgeslagen datum
-- zichtbaar wordt in de bestaande geschiedenis/emoji-rij i.p.v. stilzwijgend
-- niets te doen. SchedulesService sluit SKIPPED uit van totalCount, zodat
-- een bewuste skip het succespercentage niet vertekent.

-- AlterEnum
ALTER TYPE "AttemptStatus" ADD VALUE 'SKIPPED';

-- CreateTable
CREATE TABLE "ScheduleException" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "skip" BOOLEAN NOT NULL DEFAULT true,
    "partnerMemberIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "partnerMemberNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleException_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduleException_scheduleId_idx" ON "ScheduleException"("scheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleException_scheduleId_date_key" ON "ScheduleException"("scheduleId", "date");

-- AddForeignKey
ALTER TABLE "ScheduleException" ADD CONSTRAINT "ScheduleException_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "BookingSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
