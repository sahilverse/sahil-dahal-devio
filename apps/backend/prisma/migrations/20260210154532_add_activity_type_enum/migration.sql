/*
  Warnings:

  - A unique constraint covering the columns `[user_id,date,type]` on the table `ActivityLog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('PROBLEM_SOLVED', 'PROBLEM_ATTEMPT', 'EVENT_PARTICIPATION', 'COMMUNITY_CREATE', 'POST_CREATE', 'COMMENT_CREATE');

-- DropIndex
DROP INDEX "ActivityLog_user_id_date_key";

-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "type" "ActivityType" NOT NULL DEFAULT 'PROBLEM_SOLVED';

-- CreateIndex
CREATE UNIQUE INDEX "ActivityLog_user_id_date_type_key" ON "ActivityLog"("user_id", "date", "type");
