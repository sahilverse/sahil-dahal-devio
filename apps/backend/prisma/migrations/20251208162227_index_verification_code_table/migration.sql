-- CreateIndex
CREATE INDEX "VerificationToken_code_idx" ON "VerificationToken"("code");

-- CreateIndex
CREATE INDEX "VerificationToken_code_type_idx" ON "VerificationToken"("code", "type");
