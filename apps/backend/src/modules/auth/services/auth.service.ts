import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import type { CreateUserPayload, UserRepository } from "../../user";
import { CLIENT_URL } from "../../../config/constants";
import { AuthRepository } from "../auth.repository";
import { BcryptUtils, ApiError, JwtManager, logger } from "../../../utils";
import type { LoginInput as LoginPayload } from '@devio/zod-utils';
import { StatusCodes } from "http-status-codes";
import { LoginServiceResponse, RefreshTokenServiceResponse } from "../auth.types";
import { toAuthUserDTO } from "../auth.dto";
import type { UserAgentInfo, CreateSessionPayload } from "../auth.types";
import { AccountStatus, CodeType, SessionType } from "../../../generated/prisma/enums";
import { VerificationService } from "../../verification";
import { EmailJobService } from "../../../queue";
import { EMAIL_JOB_TYPES } from "../../../config/constants";
import { TokenService } from "./token.service";

@injectable()
export class AuthService {

    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.AuthRepository) private authRepository: AuthRepository,
        @inject(TYPES.TokenService) private tokenService: TokenService,
        @inject(TYPES.VerificationService) private verificationService: VerificationService,
        @inject(TYPES.EmailJobService) private emailJobService: EmailJobService
    ) { }

    async registerUser(payload: CreateUserPayload): Promise<void> {
        const { firstName, lastName, username, email, password } = payload;

        const existingUserByEmail = await this.userRepository.findByEmail(email);
        if (existingUserByEmail) {
            throw new ApiError("Email already in use", StatusCodes.CONFLICT);
        }

        const existingUserByUsername = await this.userRepository.findByUsername(username);
        if (existingUserByUsername) {
            throw new ApiError("Username already in use", StatusCodes.CONFLICT);
        }

        const hashedPassword = await BcryptUtils.hashPassword(password!);

        await this.userRepository.createUser({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
        });
    }

    async loginUser(payload: LoginPayload, clientIp: string, userAgent: UserAgentInfo): Promise<LoginServiceResponse> {
        const { identifier, password } = payload;

        const user = await this.userRepository.findByEmailOrUsername(identifier);

        if (!user) {
            throw new ApiError("Invalid Credentials", StatusCodes.UNAUTHORIZED);
        }

        if (user.accountStatus === AccountStatus.ADMIN_DISABLED || user.accountStatus === AccountStatus.SUSPENDED) {
            const message = `Your account is ${user.accountStatus === AccountStatus.ADMIN_DISABLED ? "disabled" : "suspended"} due to a policy violation. Please contact support to resolve this issue.`;
            throw new ApiError({ "account": message }, StatusCodes.FORBIDDEN);
        }


        if (user.accountStatus === AccountStatus.DEACTIVATED || user.accountStatus === AccountStatus.PENDING_DELETION) {
            throw new ApiError({ "account": "Account is deactivated. Please reactivate to continue." }, StatusCodes.FORBIDDEN);
        }

        if (!user.password) {
            throw new ApiError("Invalid Credentials", StatusCodes.UNAUTHORIZED);
        }

        const isPasswordValid = await BcryptUtils.comparePassword(password, user.password);

        if (!isPasswordValid) {
            throw new ApiError("Invalid Credentials", StatusCodes.UNAUTHORIZED);
        }

        const { accessToken, refreshToken } = await this.generateOrUpdateTokensAndSession(user.id, clientIp, userAgent);

        return {
            user: toAuthUserDTO(user),
            accessToken,
            refreshToken
        };
    }

    async logoutUser(refreshToken: string): Promise<void> {
        if (!refreshToken) return;
        try {
            const { jti } = JwtManager.verifyRefreshToken(refreshToken);
            await this.tokenService.revokeRefreshToken(jti!);
            await this.authRepository.invalidateSession(jti!);
        } catch (err: any) {
            logger.warn(`Error during logout: ${err.message}`);
        }
    }


    async refreshTokens(oldRefreshToken: string, clientIp: string, userAgent: UserAgentInfo): Promise<RefreshTokenServiceResponse> {
        const { sub: userId, jti } = JwtManager.verifyRefreshToken(oldRefreshToken);

        if (!userId || !jti) {
            throw new ApiError("Invalid refresh token", StatusCodes.UNAUTHORIZED);
        }

        const session = await this.authRepository.getSessionByToken(jti);
        if (!session || !session.isActive) {
            throw new ApiError("Session expired or invalid", StatusCodes.UNAUTHORIZED);
        }

        if (session.expiresAt < new Date()) {
            throw new ApiError("Session expired", StatusCodes.UNAUTHORIZED);
        }

        const user = await this.userRepository.findById(userId);
        if (!user) throw new ApiError("User not found", StatusCodes.UNAUTHORIZED);

        if (
            user.accountStatus !== AccountStatus.ACTIVE
        ) {
            throw new ApiError("Account is no longer active.", StatusCodes.FORBIDDEN);
        }

        await this.tokenService.revokeRefreshToken(jti);

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await this.generateOrUpdateTokensAndSession(
            userId,
            clientIp,
            userAgent,
            true,
            jti
        );

        return {
            user: toAuthUserDTO(user),
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    }

    async forgotPassword(identifier: string): Promise<void> {
        let user;

        if (identifier.includes("@")) {
            user = await this.userRepository.findByEmail(identifier);
            if (!user) return;
        } else {
            user = await this.userRepository.findByUsername(identifier);
            if (!user) {
                throw new ApiError("There is no Devio account with this username", StatusCodes.NOT_FOUND);
            }
        }

        const { otp, hashed, expiresAt } = this.verificationService.generateOtp();

        await this.verificationService.storeToken(
            user.id,
            hashed,
            expiresAt,
            CodeType.PASSWORD_RESET
        );

        const jwtToken = JwtManager.generatePasswordResetToken({ email: user.email, otp });

        const resetLink = `${CLIENT_URL}/accounts/reset-password?token=${jwtToken}`;

        await this.emailJobService.send(
            EMAIL_JOB_TYPES.PASSWORD_RESET,
            {
                email: user.email,
                code: otp,
                link: resetLink
            }
        );
    }

    async verifyPasswordResetToken(
        clientIp: string,
        userAgent: UserAgentInfo,
        token: string,
        identifier?: string
    ): Promise<string> {

        let emailValue: string;
        let otpValue: string;

        if (!identifier) {
            const payload = JwtManager.verifyPasswordResetToken(token);
            emailValue = payload.email;
            otpValue = payload.otp;
        } else {
            emailValue = identifier;
            otpValue = token!;
        }

        const user = await this.userRepository.findByEmailOrUsername(emailValue);
        if (!user) throw new ApiError("Invalid token", StatusCodes.BAD_REQUEST);

        await this.verificationService.verifyOtp(
            user.id,
            otpValue,
            CodeType.PASSWORD_RESET
        );

        const { token: resetSessionToken, jti, expIn } =
            JwtManager.generateResetPasswordSessionToken(user.email);

        await this.tokenService.setResetPasswordSessionToken(jti);

        const sessionPayload: CreateSessionPayload = {
            userId: user.id,
            sessionToken: jti,
            ip: clientIp,
            userAgent,
            expiresAt: new Date(Date.now() + expIn * 1000),
            type: SessionType.PASSWORD_RESET
        };

        await this.authRepository.createSession(sessionPayload);

        return resetSessionToken;
    }

    async resetPassword(email: string, newPassword: string): Promise<void> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) throw new ApiError("User not found", StatusCodes.NOT_FOUND);

        const hashedPassword = await BcryptUtils.hashPassword(newPassword);
        await this.userRepository.updatePassword(user.id, hashedPassword);

        const currentResetSession = await this.authRepository.getSessionByUserAndType(
            user.id,
            SessionType.PASSWORD_RESET
        );

        if (currentResetSession?.isActive) {
            await this.tokenService.revokeResetPasswordSessionToken(currentResetSession.sessionToken!);
        }

        await this.authRepository.invalidateUserSessions(user.id);
    }

    async sendEmailVerificationToken(email: string): Promise<void> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) throw new ApiError("User not found", StatusCodes.NOT_FOUND);

        if (user.emailVerified) {
            throw new ApiError("Email is already verified", StatusCodes.BAD_REQUEST);
        }

        const { otp, hashed, expiresAt } = this.verificationService.generateOtp();

        await this.verificationService.storeToken(
            user.id,
            hashed,
            expiresAt,
            CodeType.EMAIL_VERIFICATION
        );

        const jwtToken = JwtManager.generateEmailVerificationToken({
            email: user.email,
            code: otp,
        });

        const verificationLink = `${CLIENT_URL}/accounts/verify-email?token=${jwtToken}`;

        await this.emailJobService.send(
            EMAIL_JOB_TYPES.VERIFICATION,
            {
                email: user.email,
                code: otp,
                link: verificationLink
            }
        );
    }


    async verifyEmailVerificationToken(token: string, email?: string): Promise<void> {

        let emailValue: string;
        let otpValue: string;

        if (!email) {
            const payload = JwtManager.verifyEmailVerificationToken(token);
            emailValue = payload.email;
            otpValue = payload.code;
        } else {
            emailValue = email;
            otpValue = token!;
        }

        const user = await this.userRepository.findByEmail(emailValue);
        if (!user) throw new ApiError("Invalid token", StatusCodes.BAD_REQUEST);

        await this.verificationService.verifyOtp(
            user.id,
            otpValue,
            CodeType.EMAIL_VERIFICATION
        );

        await this.userRepository.markEmailAsVerified(user.id);
    }


    private async generateOrUpdateTokensAndSession(
        userId: string,
        clientIp: string,
        userAgent: UserAgentInfo,
        update: boolean = false,
        oldJti?: string
    ): Promise<{ accessToken: string; refreshToken: string }> {

        const accessToken = JwtManager.generateAccessToken(userId);
        const { token: refreshToken, jti, expIn } = JwtManager.generateRefreshToken(userId);
        const expiresAt = new Date(Date.now() + expIn * 1000);

        if (update) {
            if (!oldJti) throw new Error("Old JTI is required to update session");
            const uploadSessionPayload = {
                oldToken: oldJti,
                newToken: jti!,
                ip: clientIp,
                userAgent,
                expiresAt,
            };
            await this.authRepository.updateSession(uploadSessionPayload);
        } else {
            const sessionPayload: CreateSessionPayload = {
                userId,
                sessionToken: jti,
                ip: clientIp,
                userAgent,
                expiresAt,
            };
            await this.authRepository.createSession(sessionPayload);
        }

        await this.tokenService.setRefreshToken(jti);
        await this.userRepository.setLastLogin(userId);

        return { accessToken, refreshToken };
    }


}