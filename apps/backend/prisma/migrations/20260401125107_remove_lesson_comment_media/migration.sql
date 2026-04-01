/*
  Warnings:

  - You are about to drop the column `lesson_comment_id` on the `Media` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_lesson_comment_id_fkey";

-- DropIndex
DROP INDEX "Media_lesson_comment_id_idx";

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "lesson_comment_id";
