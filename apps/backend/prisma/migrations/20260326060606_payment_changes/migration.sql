/*
  Warnings:

  - You are about to drop the column `verificationTokenId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `verificationTokenId` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `verificationTokenId` on the `LessonProgress` table. All the data in the column will be lost.
  - You are about to drop the column `cash_amount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `cipher_monetary_value` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `cipher_used` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `discountAmount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `verificationTokenId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `verificationTokenId` on the `UserAchievement` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[provider_ref_id]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subtotal` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_amount` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'EXPIRED';
ALTER TYPE "PaymentStatus" ADD VALUE 'CANCELLED';

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_verificationTokenId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_verificationTokenId_fkey";

-- DropForeignKey
ALTER TABLE "LessonProgress" DROP CONSTRAINT "LessonProgress_verificationTokenId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_verificationTokenId_fkey";

-- DropForeignKey
ALTER TABLE "UserAchievement" DROP CONSTRAINT "UserAchievement_verificationTokenId_fkey";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "verificationTokenId";

-- AlterTable
ALTER TABLE "Enrollment" DROP COLUMN "verificationTokenId";

-- AlterTable
ALTER TABLE "LessonProgress" DROP COLUMN "verificationTokenId";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "cash_amount",
DROP COLUMN "cipher_monetary_value",
DROP COLUMN "cipher_used",
DROP COLUMN "discountAmount",
DROP COLUMN "totalAmount",
DROP COLUMN "verificationTokenId",
ADD COLUMN     "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "failure_reason" TEXT,
ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "provider_ref_id" TEXT,
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "total_amount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "user_agent" TEXT,
ADD COLUMN     "verified_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserAchievement" DROP COLUMN "verificationTokenId";

-- CreateIndex
CREATE UNIQUE INDEX "Payment_provider_ref_id_key" ON "Payment"("provider_ref_id");

-- CreateIndex
CREATE INDEX "Payment_provider_ref_id_idx" ON "Payment"("provider_ref_id");
