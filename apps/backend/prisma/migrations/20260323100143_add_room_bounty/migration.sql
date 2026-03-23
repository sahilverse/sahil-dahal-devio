-- AlterTable
ALTER TABLE "CyberRoom" ADD COLUMN     "cipher_reward" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CyberRoomEnrollment" ADD COLUMN     "award_bounty" BOOLEAN NOT NULL DEFAULT true;
