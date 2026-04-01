-- AlterTable
ALTER TABLE "LessonComment" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "lesson_comment_id" TEXT;

-- CreateTable
CREATE TABLE "LessonCommentVote" (
    "id" TEXT NOT NULL,
    "lesson_comment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "VoteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonCommentVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonCommentVote_lesson_comment_id_idx" ON "LessonCommentVote"("lesson_comment_id");

-- CreateIndex
CREATE INDEX "LessonCommentVote_user_id_idx" ON "LessonCommentVote"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "LessonCommentVote_lesson_comment_id_user_id_key" ON "LessonCommentVote"("lesson_comment_id", "user_id");

-- CreateIndex
CREATE INDEX "LessonComment_deleted_at_idx" ON "LessonComment"("deleted_at");

-- CreateIndex
CREATE INDEX "Media_lesson_comment_id_idx" ON "Media"("lesson_comment_id");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_lesson_comment_id_fkey" FOREIGN KEY ("lesson_comment_id") REFERENCES "LessonComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonCommentVote" ADD CONSTRAINT "LessonCommentVote_lesson_comment_id_fkey" FOREIGN KEY ("lesson_comment_id") REFERENCES "LessonComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonCommentVote" ADD CONSTRAINT "LessonCommentVote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
