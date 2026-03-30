-- CreateTable
CREATE TABLE "CourseReview" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseReview_course_id_idx" ON "CourseReview"("course_id");

-- CreateIndex
CREATE INDEX "CourseReview_user_id_idx" ON "CourseReview"("user_id");

-- CreateIndex
CREATE INDEX "CourseReview_rating_idx" ON "CourseReview"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "CourseReview_course_id_user_id_key" ON "CourseReview"("course_id", "user_id");

-- AddForeignKey
ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
