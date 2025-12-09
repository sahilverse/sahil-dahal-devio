-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('AUTHENTICATION', 'PASSWORD_RESET');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "type" "SessionType" NOT NULL DEFAULT 'AUTHENTICATION';

-- CreateIndex
CREATE INDEX "Session_user_id_type_idx" ON "Session"("user_id", "type");
