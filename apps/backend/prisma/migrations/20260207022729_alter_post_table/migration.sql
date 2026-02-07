/*
  Warnings:

  - The values [IMAGE] on the enum `PostType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `is_locked` on the `Post` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PostVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterEnum
BEGIN;
CREATE TYPE "PostType_new" AS ENUM ('TEXT', 'LINK', 'QUESTION', 'POLL');
ALTER TABLE "public"."Post" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Post" ALTER COLUMN "type" TYPE "PostType_new" USING ("type"::text::"PostType_new");
ALTER TYPE "PostType" RENAME TO "PostType_old";
ALTER TYPE "PostType_new" RENAME TO "PostType";
DROP TYPE "public"."PostType_old";
ALTER TABLE "Post" ALTER COLUMN "type" SET DEFAULT 'TEXT';
COMMIT;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "is_locked",
ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "visibility" "PostVisibility" NOT NULL DEFAULT 'PUBLIC';
