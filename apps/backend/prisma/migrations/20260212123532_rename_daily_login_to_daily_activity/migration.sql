/*
  Warnings:

  - The values [DAILY_LOGIN] on the enum `AuraReason` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuraReason_new" AS ENUM ('POST_UPVOTED', 'POST_DOWNVOTED', 'COMMENT_UPVOTED', 'COMMENT_DOWNVOTED', 'PROBLEM_SOLVED', 'ANSWER_ACCEPTED', 'DAILY_ACTIVITY', 'STREAK_MILESTONE');
ALTER TABLE "AuraTransaction" ALTER COLUMN "reason" TYPE "AuraReason_new" USING ("reason"::text::"AuraReason_new");
ALTER TYPE "AuraReason" RENAME TO "AuraReason_old";
ALTER TYPE "AuraReason_new" RENAME TO "AuraReason";
DROP TYPE "public"."AuraReason_old";
COMMIT;
