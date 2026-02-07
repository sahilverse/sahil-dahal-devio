-- CreateTable
CREATE TABLE "PollOption" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "votes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PollOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollVote" (
    "id" TEXT NOT NULL,
    "option_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "PollVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PollOption_post_id_idx" ON "PollOption"("post_id");

-- CreateIndex
CREATE INDEX "PollVote_option_id_idx" ON "PollVote"("option_id");

-- CreateIndex
CREATE INDEX "PollVote_user_id_idx" ON "PollVote"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "PollVote_option_id_user_id_key" ON "PollVote"("option_id", "user_id");

-- AddForeignKey
ALTER TABLE "PollOption" ADD CONSTRAINT "PollOption_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "PollOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
