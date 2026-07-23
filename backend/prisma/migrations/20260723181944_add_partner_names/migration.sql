-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "partnerMemberNames" TEXT[] DEFAULT ARRAY[]::TEXT[];
