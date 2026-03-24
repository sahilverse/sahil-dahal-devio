-- AlterTable
ALTER TABLE "PromoCode" ADD COLUMN     "applicable_course_id" TEXT,
ADD COLUMN     "applicable_package_id" TEXT;

-- AddForeignKey
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_applicable_package_id_fkey" FOREIGN KEY ("applicable_package_id") REFERENCES "CipherPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_applicable_course_id_fkey" FOREIGN KEY ("applicable_course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
