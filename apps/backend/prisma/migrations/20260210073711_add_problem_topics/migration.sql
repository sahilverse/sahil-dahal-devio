/*
  Warnings:

  - You are about to drop the `ProblemTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProblemTag" DROP CONSTRAINT "ProblemTag_problem_id_fkey";

-- DropTable
DROP TABLE "ProblemTag";

-- CreateTable
CREATE TABLE "ProblemTopic" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,

    CONSTRAINT "ProblemTopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProblemTopic_problem_id_idx" ON "ProblemTopic"("problem_id");

-- CreateIndex
CREATE INDEX "ProblemTopic_topic_id_idx" ON "ProblemTopic"("topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProblemTopic_problem_id_topic_id_key" ON "ProblemTopic"("problem_id", "topic_id");

-- AddForeignKey
ALTER TABLE "ProblemTopic" ADD CONSTRAINT "ProblemTopic_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemTopic" ADD CONSTRAINT "ProblemTopic_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
