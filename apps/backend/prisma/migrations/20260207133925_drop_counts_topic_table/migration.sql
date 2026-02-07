/*
  Warnings:

  - You are about to drop the column `community_count` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `course_count` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `job_count` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `post_count` on the `Topic` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Topic_post_count_idx";

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "community_count",
DROP COLUMN "course_count",
DROP COLUMN "job_count",
DROP COLUMN "post_count";
