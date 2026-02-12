/*
  Warnings:

  - The values [VOICE] on the enum `MessageType` will be removed. If these variants are still used in the database, this will fail.
  - The values [UPVOTE,COMMUNITY_INVITE] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `duration` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `file_name` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `file_size` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `media_url` on the `Message` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('INVITE_PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'SEEN', 'FAILED');

-- AlterEnum
BEGIN;
CREATE TYPE "MessageType_new" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'FILE', 'LINK');
ALTER TABLE "public"."Message" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Message" ALTER COLUMN "type" TYPE "MessageType_new" USING ("type"::text::"MessageType_new");
ALTER TYPE "MessageType" RENAME TO "MessageType_old";
ALTER TYPE "MessageType_new" RENAME TO "MessageType";
DROP TYPE "public"."MessageType_old";
ALTER TABLE "Message" ALTER COLUMN "type" SET DEFAULT 'TEXT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('SYSTEM', 'FOLLOW', 'COMMENT', 'MENTION', 'ACHIEVEMENT_UNLOCKED', 'COURSE_ENROLLMENT', 'JOB_APPLICATION_UPDATE', 'COMMUNITY_JOIN_REQUEST', 'COMMUNITY_MODERATOR_ASSIGNED', 'COMMUNITY_MODERATOR_REMOVED');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "CommunitySettings" ADD COLUMN     "min_aura_to_join" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "invite_sender_id" TEXT,
ADD COLUMN     "status" "ConversationStatus" NOT NULL DEFAULT 'ACCEPTED';

-- AlterTable
ALTER TABLE "ConversationParticipant" ADD COLUMN     "has_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "messages_cleared_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "message_id" TEXT;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "duration",
DROP COLUMN "file_name",
DROP COLUMN "file_size",
DROP COLUMN "media_url",
ADD COLUMN     "deleted_by_participant_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "status" "MessageStatus" NOT NULL DEFAULT 'SENT';

-- CreateIndex
CREATE INDEX "Conversation_status_idx" ON "Conversation"("status");

-- CreateIndex
CREATE INDEX "Media_message_id_idx" ON "Media"("message_id");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
