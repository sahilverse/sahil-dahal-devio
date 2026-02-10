-- CreateTable
CREATE TABLE "TestCase" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "input_path" TEXT NOT NULL,
    "output_path" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TestCase_problem_id_idx" ON "TestCase"("problem_id");

-- CreateIndex
CREATE INDEX "TestCase_is_public_idx" ON "TestCase"("is_public");

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
