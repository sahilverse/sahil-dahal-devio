import { describe, it, expect, vi, beforeEach } from "vitest";
import { Container } from "inversify";
import { StatusCodes } from "http-status-codes";

import { AuthService } from "./services/auth.service";
import { TYPES } from "../../types";
import { BcryptUtils, JwtManager, ApiError } from "../../utils";
import { AccountStatus, CodeType } from "../../generated/prisma/enums";

vi.mock("./services/token.service", () => ({
    TokenService: class {
        setRefreshToken = vi.fn();
        revokeRefreshToken = vi.fn();
        setResetPasswordSessionToken = vi.fn();
        revokeResetPasswordSessionToken = vi.fn();
    }
}));

vi.mock("../../utils", async () => {
    const actual = await vi.importActual("../../utils") as any;
    return {
        ...actual,
        BcryptUtils: {
            hashPassword: vi.fn(),
            comparePassword: vi.fn(),
        },
        JwtManager: {
            generateAccessToken: vi.fn(),
            generateRefreshToken: vi.fn(),
            verifyRefreshToken: vi.fn(),
            generatePasswordResetToken: vi.fn(),
            verifyPasswordResetToken: vi.fn(),
            generateResetPasswordSessionToken: vi.fn(),
            generateEmailVerificationToken: vi.fn(),
            verifyEmailVerificationToken: vi.fn(),
        },
    };
});

/**
 * TEST DATA CONSTANTS
 */
const MOCK_USER = {
    id: "user_123",
    email: "test@devio.com",
    username: "devio_user",
    password: "hashed_password",
    accountStatus: AccountStatus.ACTIVE,
};

const MOCK_AUTH_PAYLOAD = {
    firstName: "Dev",
    lastName: "User",
    username: "devio_user",
    email: "test@devio.com",
    password: "Password123!",
};

const MOCK_USER_AGENT = {
    browser: "Chrome",
    os: "Windows",
    version: "1.0",
    device: "Desktop",
    raw: "Mozilla/5.0...",
};

const MOCK_IP = "127.0.0.1";
const MOCK_OTP = "123456";
const INVALID_OTP = "999999";

describe("AuthService Unit Tests", () => {
    let container: Container;
    let authService: AuthService;
    let mockUserRepo: any;
    let mockAuthRepo: any;
    let mockTokenService: any;
    let mockVerificationService: any;
    let mockEmailJobService: any;

    beforeEach(() => {
        container = new Container();

        mockUserRepo = {
            findByEmail: vi.fn(),
            findByUsername: vi.fn(),
            findByEmailOrUsername: vi.fn(),
            createUser: vi.fn(),
            findById: vi.fn(),
            updateAccountStatus: vi.fn(),
            updatePassword: vi.fn(),
            setLastLogin: vi.fn(),
            markEmailAsVerified: vi.fn(),
        };

        mockAuthRepo = {
            createSession: vi.fn(),
            updateSession: vi.fn(),
            getSessionByToken: vi.fn(),
            getSessionByUserAndType: vi.fn(),
            invalidateSession: vi.fn(),
            invalidateUserSessions: vi.fn(),
        };

        mockTokenService = {
            setRefreshToken: vi.fn(),
            revokeRefreshToken: vi.fn(),
            setResetPasswordSessionToken: vi.fn(),
            revokeResetPasswordSessionToken: vi.fn(),
        };

        mockVerificationService = {
            generateOtp: vi.fn(),
            storeToken: vi.fn(),
            verifyOtp: vi.fn(),
        };

        mockEmailJobService = { send: vi.fn() };

        // Dependency Injection Setup
        container.bind(TYPES.UserRepository).toConstantValue(mockUserRepo);
        container.bind(TYPES.AuthRepository).toConstantValue(mockAuthRepo);
        container.bind(TYPES.TokenService).toConstantValue(mockTokenService);
        container.bind(TYPES.VerificationService).toConstantValue(mockVerificationService);
        container.bind(TYPES.EmailJobService).toConstantValue(mockEmailJobService);
        container.bind(AuthService).to(AuthService);

        authService = container.get(AuthService);
        vi.clearAllMocks();
    });

    describe("registerUser()", () => {
        it("should successfully create a new user when identifier is unique", async () => {
            mockUserRepo.findByEmail.mockResolvedValue(null);
            mockUserRepo.findByUsername.mockResolvedValue(null);
            (BcryptUtils.hashPassword as any).mockResolvedValue("hashed_pass");

            await authService.registerUser(MOCK_AUTH_PAYLOAD);

            expect(mockUserRepo.createUser).toHaveBeenCalledWith(expect.objectContaining({
                email: MOCK_AUTH_PAYLOAD.email,
                password: "hashed_pass",
            }));
        });

        it("should throw Conflict error if email is already registered", async () => {
            mockUserRepo.findByEmail.mockResolvedValue(MOCK_USER);

            await expect(authService.registerUser(MOCK_AUTH_PAYLOAD))
                .rejects.toThrow(expect.objectContaining({ statusCode: StatusCodes.CONFLICT }));
        });

        it("should throw Conflict error if username is already taken", async () => {
            mockUserRepo.findByEmail.mockResolvedValue(null);
            mockUserRepo.findByUsername.mockResolvedValue(MOCK_USER);

            await expect(authService.registerUser(MOCK_AUTH_PAYLOAD))
                .rejects.toThrow(expect.objectContaining({ statusCode: StatusCodes.CONFLICT }));
        });
    });

    describe("loginUser()", () => {
        const loginInput = { identifier: MOCK_USER.email, password: "Password123!" };

        it("should return access and refresh tokens on valid credentials", async () => {
            mockUserRepo.findByEmailOrUsername.mockResolvedValue(MOCK_USER);
            (BcryptUtils.comparePassword as any).mockResolvedValue(true);
            (JwtManager.generateAccessToken as any).mockReturnValue("access_token");
            (JwtManager.generateRefreshToken as any).mockReturnValue({
                token: "refresh_token", jti: "jti_1", expIn: 3600
            });

            const result = await authService.loginUser(loginInput, MOCK_IP, MOCK_USER_AGENT);

            expect(result.accessToken).toBe("access_token");
            expect(result.refreshToken).toBe("refresh_token");
        });

        it("should throw Unauthorized error for invalid password", async () => {
            mockUserRepo.findByEmailOrUsername.mockResolvedValue(MOCK_USER);
            (BcryptUtils.comparePassword as any).mockResolvedValue(false);

            await expect(authService.loginUser(loginInput, MOCK_IP, MOCK_USER_AGENT))
                .rejects.toThrow(expect.objectContaining({ statusCode: StatusCodes.UNAUTHORIZED }));
        });

        it("should throw Forbidden error if account is disabled by admin", async () => {
            mockUserRepo.findByEmailOrUsername.mockResolvedValue({
                ...MOCK_USER, accountStatus: AccountStatus.ADMIN_DISABLED
            });

            await expect(authService.loginUser(loginInput, MOCK_IP, MOCK_USER_AGENT))
                .rejects.toThrow(expect.objectContaining({ statusCode: StatusCodes.FORBIDDEN }));
        });
    });

    describe("refreshTokens()", () => {
        const oldToken = "old_refresh_token";

        it("should rotate tokens and update session successfully", async () => {
            (JwtManager.verifyRefreshToken as any).mockReturnValue({ sub: MOCK_USER.id, jti: "old_jti" });
            mockAuthRepo.getSessionByToken.mockResolvedValue({
                isActive: true, expiresAt: new Date(Date.now() + 10000)
            });
            mockUserRepo.findById.mockResolvedValue(MOCK_USER);
            (JwtManager.generateAccessToken as any).mockReturnValue("new_access");
            (JwtManager.generateRefreshToken as any).mockReturnValue({
                token: "new_refresh", jti: "new_jti", expIn: 3600
            });

            const result = await authService.refreshTokens(oldToken, MOCK_IP, MOCK_USER_AGENT);

            expect(result.accessToken).toBe("new_access");
            expect(mockTokenService.revokeRefreshToken).toHaveBeenCalledWith("old_jti");
            expect(mockAuthRepo.updateSession).toHaveBeenCalled();
        });

        it("should throw Unauthorized error if session is inactive or missing", async () => {
            (JwtManager.verifyRefreshToken as any).mockReturnValue({ sub: MOCK_USER.id, jti: "old_jti" });
            mockAuthRepo.getSessionByToken.mockResolvedValue({ isActive: false });

            await expect(authService.refreshTokens(oldToken, MOCK_IP, MOCK_USER_AGENT))
                .rejects.toThrow(expect.objectContaining({ statusCode: StatusCodes.UNAUTHORIZED }));
        });
    });

    describe("Password Recovery & Security", () => {
        it("should initiate forgotPassword flow and send verification email", async () => {
            mockUserRepo.findByEmail.mockResolvedValue(MOCK_USER);
            mockVerificationService.generateOtp.mockReturnValue({
                otp: MOCK_OTP, hashed: "hashed_otp", expiresAt: new Date()
            });
            (JwtManager.generatePasswordResetToken as any).mockReturnValue("reset_jwt");

            await authService.forgotPassword(MOCK_USER.email);

            expect(mockVerificationService.storeToken).toHaveBeenCalledWith(
                MOCK_USER.id, "hashed_otp", expect.any(Date), CodeType.PASSWORD_RESET
            );
            expect(mockEmailJobService.send).toHaveBeenCalled();
        });

        it("should successfully verify password reset OTP and return session token", async () => {
            mockUserRepo.findByEmailOrUsername.mockResolvedValue(MOCK_USER);
            mockVerificationService.verifyOtp.mockResolvedValue(true);
            (JwtManager.generateResetPasswordSessionToken as any).mockReturnValue({
                token: "session_token", jti: "jti_reset", expIn: 600
            });

            const result = await authService.verifyPasswordResetToken(
                MOCK_IP, MOCK_USER_AGENT, MOCK_OTP, MOCK_USER.email
            );

            expect(result).toBe("session_token");
        });

        it("should throw error for invalid or expired OTP verification", async () => {
            mockUserRepo.findByEmailOrUsername.mockResolvedValue(MOCK_USER);
            mockVerificationService.verifyOtp.mockRejectedValue(
                new ApiError("Invalid OTP", StatusCodes.BAD_REQUEST)
            );

            await expect(authService.verifyPasswordResetToken(
                MOCK_IP, MOCK_USER_AGENT, INVALID_OTP, MOCK_USER.email
            )).rejects.toThrow(ApiError);
        });
    });
});
