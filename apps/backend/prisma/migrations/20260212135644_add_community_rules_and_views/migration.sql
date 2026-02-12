-- AlterTable
ALTER TABLE "Community" ADD COLUMN     "rules" JSONB;

-- CreateTable
CREATE TABLE "CommunityView" (
    "id" TEXT NOT NULL,
    "community_id" TEXT NOT NULL,
    "user_id" TEXT,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunityView_community_id_idx" ON "CommunityView"("community_id");

-- CreateIndex
CREATE INDEX "CommunityView_viewed_at_idx" ON "CommunityView"("viewed_at");

-- AddForeignKey
ALTER TABLE "CommunityView" ADD CONSTRAINT "CommunityView_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
