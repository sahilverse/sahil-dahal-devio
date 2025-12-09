import jwt, { JwtPayload } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import {
    JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRATION_MINUTES,
    JWT_REFRESH_EXPIRATION_DAYS,
    JWT_RESET_PASSWORD_SECRET,
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    JWT_EMAIL_VERIFICATION_EXPIRATION_MINUTES,
    JWT_EMAIL_VERIFICATION_SECRET
} from "../config/constants";
import {
    GenerateRefreshTokenResult,
    PasswordResetPayload,
    VerifyPasswordResetTokenResult,
    GenerateResetPasswordSessionTokenResult
} from "../types";

export class JwtManager {
    static generateAccessToken(userId: string): string {
        return jwt.sign({ sub: userId }, JWT_ACCESS_SECRET, {
            expiresIn: `${JWT_ACCESS_EXPIRATION_MINUTES}m`,
        });
    }

    static verifyAccessToken(token: string): JwtPayload {
        const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
        if (!decoded.sub) throw new Error("Access token missing subject (user ID)");
        return decoded;
    }

    static generateRefreshToken(userId: string): GenerateRefreshTokenResult {
        const jti = uuidv4();
        const expIn = JWT_REFRESH_EXPIRATION_DAYS * 24 * 60 * 60;
        const token = jwt.sign({ sub: userId, jti }, JWT_REFRESH_SECRET, {
            expiresIn: `${expIn}s`,
        });
        return { token, jti, expIn };
    }

    static verifyRefreshToken(token: string): JwtPayload {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
        if (!decoded.sub) throw new Error("Refresh token missing user ID");
        if (!decoded.jti) throw new Error("Refresh token missing jti");
        return decoded;
    }

    static generateResetPasswordSessionToken(email: string): GenerateResetPasswordSessionTokenResult {
        const jti = uuidv4();
        const expIn = JWT_ACCESS_EXPIRATION_MINUTES * 60;
        const token = jwt.sign({ email, purpose: "reset_password_session", jti }, JWT_ACCESS_SECRET, {
            expiresIn: `${expIn}s`,
        });
        return {
            token,
            jti,
            expIn,
        }
    }

    static verifyResetPasswordSessionToken(token: string): { email: string; jti: string } {
        const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
        if (decoded.purpose !== "reset_password_session") throw new Error("Invalid token purpose");
        if (!decoded.email) throw new Error("Token missing email");
        if (!decoded.jti) throw new Error("Token missing jti");
        return {
            email: decoded.email,
            jti: decoded.jti,
        }
    }

    static generatePasswordResetToken(payload: PasswordResetPayload): string {
        return jwt.sign({ ...payload, type: "password_reset" }, JWT_RESET_PASSWORD_SECRET, {
            expiresIn: `${JWT_RESET_PASSWORD_EXPIRATION_MINUTES}m`,
        });
    }

    static verifyPasswordResetToken(token: string): VerifyPasswordResetTokenResult {
        const decoded = jwt.verify(token, JWT_RESET_PASSWORD_SECRET);
        if (typeof decoded === "string") throw new Error("Invalid token");
        if ((decoded as any).type !== "password_reset") throw new Error("Invalid token type");
        return decoded as VerifyPasswordResetTokenResult;
    }


    static generateEmailVerificationToken(payload: { code: string, email: string }): string {
        return jwt.sign({ ...payload, type: "email_verification" }, JWT_EMAIL_VERIFICATION_SECRET, {
            expiresIn: `${JWT_EMAIL_VERIFICATION_EXPIRATION_MINUTES}m`,
        });
    }

    static verifyEmailVerificationToken(token: string): { code: string; email: string } {
        const decoded = jwt.verify(token, JWT_EMAIL_VERIFICATION_SECRET);
        if (typeof decoded === "string") throw new Error("Invalid token");
        if ((decoded as any).type !== "email_verification") throw new Error("Invalid token type");
        if (!decoded.code) throw new Error("Token missing code");
        if (!decoded.email) throw new Error("Token missing email");
        return decoded as { code: string; email: string };
    }
}

