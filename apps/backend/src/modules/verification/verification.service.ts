import crypto from "crypto";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { VerificationRepository } from "./verification.repository";
import { ApiError } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { CodeType } from "../../generated/prisma/enums";
import { JWT_EMAIL_VERIFICATION_EXPIRATION_MINUTES } from "../../config/constants";

@injectable()
export class VerificationService {
    constructor(
        @inject(TYPES.VerificationRepository)
        private verificationRepository: VerificationRepository
    ) { }

    generateOtp() {
        const otp = crypto.randomInt(100000, 999999).toString();
        const hashed = this.hash(otp);
        const expiresAt = new Date(Date.now() + JWT_EMAIL_VERIFICATION_EXPIRATION_MINUTES * 60 * 1000);
        return { otp, hashed, expiresAt };
    }

    async storeToken(
        userId: string,
        hashedToken: string,
        expiresAt: Date,
        type: CodeType
    ) {
        await this.verificationRepository.deleteUserVerificationTokens(userId);
        await this.verificationRepository.createVerificationToken({
            userId,
            code: hashedToken,
            expiresAt,
            type,
        });
    }

    async verifyOtp(
        userId: string,
        otp: string,
        type: CodeType
    ): Promise<void> {
        const hashed = this.hash(otp);

        const token = await this.verificationRepository.getVerificationToken(hashed, type);

        if (!token || token.userId !== userId || token.expiresAt < new Date()) {
            throw new ApiError("Invalid or expired OTP", StatusCodes.BAD_REQUEST);
        }

        await this.verificationRepository.deleteVerificationToken(token.id);
    }

    private hash(value: string) {
        return crypto.createHash("sha256").update(value).digest("hex");
    }
}
