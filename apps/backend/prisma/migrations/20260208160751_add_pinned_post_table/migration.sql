/*
  Warnings:

  - You are about to drop the column `is_pinned` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "is_pinned";

-- CreateTable
CREATE TABLE "PinnedPost" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT,
    "community_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PinnedPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PinnedPost_post_id_idx" ON "PinnedPost"("post_id");

-- CreateIndex
CREATE INDEX "PinnedPost_user_id_idx" ON "PinnedPost"("user_id");

-- CreateIndex
CREATE INDEX "PinnedPost_community_id_idx" ON "PinnedPost"("community_id");

-- CreateIndex
CREATE UNIQUE INDEX "PinnedPost_post_id_user_id_key" ON "PinnedPost"("post_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "PinnedPost_post_id_community_id_key" ON "PinnedPost"("post_id", "community_id");

-- AddForeignKey
ALTER TABLE "PinnedPost" ADD CONSTRAINT "PinnedPost_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PinnedPost" ADD CONSTRAINT "PinnedPost_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PinnedPost" ADD CONSTRAINT "PinnedPost_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
