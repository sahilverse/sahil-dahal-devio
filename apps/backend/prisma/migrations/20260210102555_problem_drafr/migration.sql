-- CreateTable
CREATE TABLE "UserProblemDraft" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProblemDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserProblemDraft_user_id_idx" ON "UserProblemDraft"("user_id");

-- CreateIndex
CREATE INDEX "UserProblemDraft_problem_id_idx" ON "UserProblemDraft"("problem_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserProblemDraft_user_id_problem_id_language_key" ON "UserProblemDraft"("user_id", "problem_id", "language");

-- AddForeignKey
ALTER TABLE "UserProblemDraft" ADD CONSTRAINT "UserProblemDraft_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProblemDraft" ADD CONSTRAINT "UserProblemDraft_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
