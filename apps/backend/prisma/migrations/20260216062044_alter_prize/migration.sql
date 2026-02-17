/*
  Warnings:

  - You are about to drop the column `title` on the `EventPrize` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'EVENT_REGISTRATION';
ALTER TYPE "NotificationType" ADD VALUE 'EVENT_UPDATE';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "rules" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "EventPrize" DROP COLUMN "title",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "prize" TEXT;
