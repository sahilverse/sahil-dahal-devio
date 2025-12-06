import jwt, { JwtPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import {
    JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRATION_MINUTES,
    JWT_REFRESH_EXPIRATION_DAYS,
    JWT_RESET_PASSWORD_SECRET,
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES
} from '../config/constants'

interface generateRefreshTokenResult {
    token: string;
    jti: string;
}

interface generatePasswordResetTokenPayload {
    email: string;
    otp: string;
}
interface verifyPasswordResetTokenResult extends generatePasswordResetTokenPayload {
    type: string;
}

export class JwtManager {

    static generateAccessToken(id: string): string {
        return jwt.sign({ sub: id }, JWT_ACCESS_SECRET, {
            expiresIn: `${JWT_ACCESS_EXPIRATION_MINUTES}m`,
        });
    }

    static generateRefreshToken(id: string): generateRefreshTokenResult {
        const jti = uuidv4();
        const token = jwt.sign(
            {
                sub: id,
                jti,
            },
            JWT_REFRESH_SECRET,
            {
                expiresIn: `${JWT_REFRESH_EXPIRATION_DAYS}d`,
            }
        );
        return { token, jti };
    }

    static verifyAccessToken(token: string): JwtPayload {
        return jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
    }

    static verifyRefreshToken(token: string): JwtPayload {
        const payload = jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;

        if (!payload.jti) throw new Error('Refresh token missing jti');
        return payload;
    }

    static generateResetPasswordSessionToken(email: string): string {
        const token = jwt.sign({ email, purpose: 'reset_password_session' }, JWT_ACCESS_SECRET, {
            expiresIn: `${JWT_ACCESS_EXPIRATION_MINUTES}m`,
        });
        return token;
    }

    static async verifyResetPasswordSessionToken(token: string): Promise<string> {
        const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
        if (decoded.purpose !== 'reset_password_session') throw new Error('Invalid token purpose');
        return decoded.email;
    }

    public static generatePasswordResetToken(payload: generatePasswordResetTokenPayload): string {
        const token = jwt.sign(
            { ...payload, type: 'password_reset' },
            JWT_RESET_PASSWORD_SECRET,
            { expiresIn: `${JWT_RESET_PASSWORD_EXPIRATION_MINUTES}m` }
        );

        return token;
    }

    public static verifyPasswordResetToken(token: string): verifyPasswordResetTokenResult {
        const decoded = jwt.verify(token, JWT_RESET_PASSWORD_SECRET);
        if (typeof decoded === 'string') throw new Error('Invalid token');
        return decoded as verifyPasswordResetTokenResult;
    }

}