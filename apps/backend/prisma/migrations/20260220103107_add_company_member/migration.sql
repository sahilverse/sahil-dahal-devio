-- CreateEnum
CREATE TYPE "CompanyVerificationTier" AS ENUM ('UNVERIFIED', 'DOMAIN_VERIFIED', 'OFFICIAL');

-- CreateEnum
CREATE TYPE "CompanyRole" AS ENUM ('OWNER', 'RECRUITER', 'MEMBER');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "verification_tier" "CompanyVerificationTier" NOT NULL DEFAULT 'UNVERIFIED',
ADD COLUMN     "verified_domain" TEXT;

-- CreateTable
CREATE TABLE "CompanyMember" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "CompanyRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyMember_company_id_idx" ON "CompanyMember"("company_id");

-- CreateIndex
CREATE INDEX "CompanyMember_user_id_idx" ON "CompanyMember"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMember_company_id_user_id_key" ON "CompanyMember"("company_id", "user_id");

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
