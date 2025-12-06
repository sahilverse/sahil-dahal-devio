import jwt, { JwtPayload } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import {
    JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRATION_MINUTES,
    JWT_REFRESH_EXPIRATION_DAYS,
    JWT_RESET_PASSWORD_SECRET,
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
} from "../config/constants";

interface GenerateRefreshTokenResult {
    token: string;
    jti: string;
}

interface PasswordResetPayload {
    email: string;
    otp: string;
}

interface VerifyPasswordResetTokenResult extends PasswordResetPayload {
    type: "password_reset";
}

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
        const token = jwt.sign({ sub: userId, jti }, JWT_REFRESH_SECRET, {
            expiresIn: `${JWT_REFRESH_EXPIRATION_DAYS}d`,
        });
        return { token, jti };
    }

    static verifyRefreshToken(token: string): JwtPayload {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
        if (!decoded.sub) throw new Error("Refresh token missing user ID");
        if (!decoded.jti) throw new Error("Refresh token missing jti");
        return decoded;
    }

    static generateResetPasswordSessionToken(email: string): string {
        return jwt.sign({ email, purpose: "reset_password_session" }, JWT_ACCESS_SECRET, {
            expiresIn: `${JWT_ACCESS_EXPIRATION_MINUTES}m`,
        });
    }

    static verifyResetPasswordSessionToken(token: string): string {
        const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
        if (decoded.purpose !== "reset_password_session") throw new Error("Invalid token purpose");
        if (!decoded.email) throw new Error("Token missing email");
        return decoded.email;
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
}
