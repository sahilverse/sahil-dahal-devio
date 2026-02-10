/*
  Warnings:

  - The values [PROFILE_COMPLETED] on the enum `AuraReason` will be removed. If these variants are still used in the database, this will fail.
  - The values [PROBLEM_SOLVED,DAILY_CHALLENGE,LAB_COMPLETED,CTF_ROOM_CLEARED,HACKATHON_PLACEMENT,ANSWER_UPVOTED] on the enum `CipherReason` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuraReason_new" AS ENUM ('POST_UPVOTED', 'POST_DOWNVOTED', 'COMMENT_UPVOTED', 'COMMENT_DOWNVOTED', 'PROBLEM_SOLVED', 'ANSWER_ACCEPTED', 'DAILY_LOGIN', 'STREAK_MILESTONE');
ALTER TABLE "AuraTransaction" ALTER COLUMN "reason" TYPE "AuraReason_new" USING ("reason"::text::"AuraReason_new");
ALTER TYPE "AuraReason" RENAME TO "AuraReason_old";
ALTER TYPE "AuraReason_new" RENAME TO "AuraReason";
DROP TYPE "public"."AuraReason_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CipherReason_new" AS ENUM ('CONTEST_WIN', 'ANSWER_ACCEPTED', 'PROBLEM_SOLVED_BOUNTY', 'LEADERBOARD_REWARD', 'COURSE_DISCOUNT', 'PREMIUM_CONTENT_UNLOCK', 'LAB_TIME_EXTENSION', 'BOUNTY_CREATED', 'CONTEST_ENTRY', 'HINT_UNLOCK', 'FEATURE_TRIAL');
ALTER TABLE "CipherTransaction" ALTER COLUMN "reason" TYPE "CipherReason_new" USING ("reason"::text::"CipherReason_new");
ALTER TYPE "CipherReason" RENAME TO "CipherReason_old";
ALTER TYPE "CipherReason_new" RENAME TO "CipherReason";
DROP TYPE "public"."CipherReason_old";
COMMIT;

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "cipher_reward" INTEGER NOT NULL DEFAULT 0;
