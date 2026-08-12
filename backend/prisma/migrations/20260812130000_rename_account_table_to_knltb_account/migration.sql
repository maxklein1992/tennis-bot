-- Renames the "Account" table (and its dependent constraints/index) to
-- "KnltbAccount", so the underlying table name matches the Prisma model
-- name (previously kept as "Account" via @@map to avoid this migration).

ALTER TABLE "Account" RENAME TO "KnltbAccount";
ALTER TABLE "KnltbAccount" RENAME CONSTRAINT "Account_pkey" TO "KnltbAccount_pkey";
ALTER TABLE "KnltbAccount" RENAME CONSTRAINT "Account_userId_fkey" TO "KnltbAccount_userId_fkey";
ALTER INDEX "Account_userId_key" RENAME TO "KnltbAccount_userId_key";
