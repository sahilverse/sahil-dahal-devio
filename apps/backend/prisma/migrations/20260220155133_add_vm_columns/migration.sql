-- CreateEnum
CREATE TYPE "CTFChallengeType" AS ENUM ('INFO', 'FLAG', 'MULTIPLE_CHOICE');

-- AlterTable
ALTER TABLE "CTFChallenge" ADD COLUMN     "type" "CTFChallengeType" NOT NULL DEFAULT 'FLAG';

-- AlterTable
ALTER TABLE "VMSession" ADD COLUMN     "image_id" TEXT,
ADD COLUMN     "started_at" TIMESTAMP(3),
ADD COLUMN     "terminated_at" TIMESTAMP(3);
