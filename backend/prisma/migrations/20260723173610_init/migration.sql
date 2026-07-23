-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('SUCCESS', 'VALIDATION_FAILED', 'NO_SLOT_FOUND', 'BOOKING_FAILED', 'ERROR');

-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('SCHEDULED', 'MANUAL');

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "clubId" TEXT NOT NULL,
    "membershipNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "partnerMemberIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetWeekday" "Weekday" NOT NULL DEFAULT 'MONDAY',
    "targetTime" TEXT NOT NULL DEFAULT '19:00',
    "bookingWindowDays" INTEGER NOT NULL DEFAULT 7,
    "courtPreference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingAttempt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trigger" "TriggerType" NOT NULL DEFAULT 'SCHEDULED',
    "dryRun" BOOLEAN NOT NULL DEFAULT false,
    "targetStart" TIMESTAMP(3) NOT NULL,
    "targetEnd" TIMESTAMP(3) NOT NULL,
    "status" "AttemptStatus" NOT NULL,
    "courtId" TEXT,
    "courtName" TEXT,
    "validationResponse" JSONB,
    "reservationId" TEXT,
    "errorMessage" TEXT,
    "rawResult" JSONB,
    "durationMs" INTEGER,

    CONSTRAINT "BookingAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingAttempt_createdAt_idx" ON "BookingAttempt"("createdAt");
