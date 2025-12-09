/*
  Warnings:

  - The values [DELETED] on the enum `AccountStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AccountStatus_new" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED', 'ADMIN_DISABLED', 'PENDING_DELETION');
ALTER TABLE "public"."User" ALTER COLUMN "account_status" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "account_status" TYPE "AccountStatus_new" USING ("account_status"::text::"AccountStatus_new");
ALTER TABLE "AccountStatusHistory" ALTER COLUMN "status" TYPE "AccountStatus_new" USING ("status"::text::"AccountStatus_new");
ALTER TYPE "AccountStatus" RENAME TO "AccountStatus_old";
ALTER TYPE "AccountStatus_new" RENAME TO "AccountStatus";
DROP TYPE "public"."AccountStatus_old";
ALTER TABLE "User" ALTER COLUMN "account_status" SET DEFAULT 'ACTIVE';
COMMIT;
