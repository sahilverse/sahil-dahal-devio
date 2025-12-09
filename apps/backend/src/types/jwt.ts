export interface GenerateRefreshTokenResult {
    token: string;
    jti: string;
    expIn: number;
}

export interface PasswordResetPayload {
    email: string;
    otp: string;
}

export interface VerifyPasswordResetTokenResult extends PasswordResetPayload {
    type: "password_reset";
}

export interface GenerateResetPasswordSessionTokenResult extends GenerateRefreshTokenResult { }
export interface GeneratEmailVerificationTokenResult extends GenerateRefreshTokenResult { }