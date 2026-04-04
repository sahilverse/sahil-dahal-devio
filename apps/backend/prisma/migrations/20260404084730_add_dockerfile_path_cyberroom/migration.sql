/*
  Warnings:

  - You are about to drop the column `image_id` on the `CyberRoom` table. All the data in the column will be lost.
  - Added the required column `docker_image_id` to the `CyberRoom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CyberRoom" DROP COLUMN "image_id",
ADD COLUMN     "docker_image_id" TEXT NOT NULL,
ADD COLUMN     "dockerfile_path" TEXT;
