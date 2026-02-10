-- CreateEnum
CREATE TYPE "ProblemSolutionStatus" AS ENUM ('UNSOLVED', 'ATTEMPTED', 'SOLVED');

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "error" TEXT,
ADD COLUMN     "event_id" TEXT,
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "EventProblem" (
    "event_id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EventProblem_pkey" PRIMARY KEY ("event_id","problem_id")
);

-- CreateTable
CREATE TABLE "UserProblemStatus" (
    "user_id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "status" "ProblemSolutionStatus" NOT NULL DEFAULT 'ATTEMPTED',
    "best_score" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProblemStatus_pkey" PRIMARY KEY ("user_id","problem_id")
);

-- CreateIndex
CREATE INDEX "EventProblem_event_id_idx" ON "EventProblem"("event_id");

-- CreateIndex
CREATE INDEX "EventProblem_problem_id_idx" ON "EventProblem"("problem_id");

-- CreateIndex
CREATE INDEX "UserProblemStatus_user_id_idx" ON "UserProblemStatus"("user_id");

-- CreateIndex
CREATE INDEX "UserProblemStatus_problem_id_idx" ON "UserProblemStatus"("problem_id");

-- CreateIndex
CREATE INDEX "UserProblemStatus_status_idx" ON "UserProblemStatus"("status");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventProblem" ADD CONSTRAINT "EventProblem_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventProblem" ADD CONSTRAINT "EventProblem_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProblemStatus" ADD CONSTRAINT "UserProblemStatus_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProblemStatus" ADD CONSTRAINT "UserProblemStatus_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
