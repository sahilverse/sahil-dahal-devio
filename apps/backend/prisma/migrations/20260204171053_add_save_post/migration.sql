-- CreateTable
CREATE TABLE "SavePost" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavePost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavePost_post_id_idx" ON "SavePost"("post_id");

-- CreateIndex
CREATE INDEX "SavePost_user_id_idx" ON "SavePost"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "SavePost_post_id_user_id_key" ON "SavePost"("post_id", "user_id");

-- AddForeignKey
ALTER TABLE "SavePost" ADD CONSTRAINT "SavePost_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavePost" ADD CONSTRAINT "SavePost_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
