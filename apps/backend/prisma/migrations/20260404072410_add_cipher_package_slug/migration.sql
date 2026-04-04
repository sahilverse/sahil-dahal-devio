/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `CipherPackage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `CipherPackage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CipherPackage" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CipherPackage_slug_key" ON "CipherPackage"("slug");
