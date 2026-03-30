-- CreateTable
CREATE TABLE "LessonComment" (
    "id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonComment_lesson_id_idx" ON "LessonComment"("lesson_id");

-- CreateIndex
CREATE INDEX "LessonComment_user_id_idx" ON "LessonComment"("user_id");

-- CreateIndex
CREATE INDEX "LessonComment_parent_id_idx" ON "LessonComment"("parent_id");

-- CreateIndex
CREATE INDEX "LessonComment_created_at_idx" ON "LessonComment"("created_at");

-- AddForeignKey
ALTER TABLE "LessonComment" ADD CONSTRAINT "LessonComment_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonComment" ADD CONSTRAINT "LessonComment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonComment" ADD CONSTRAINT "LessonComment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "LessonComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
