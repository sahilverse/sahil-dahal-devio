export interface AuthUser {
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    email: string;
    emailVerified: string | null;
    avatarUrl: string | null;
    roleId: number | null;
    createdAt: string;
}

export interface AuthState {
    accessToken: string | null;
    user: AuthUser | null;
    isNewUser: boolean;
    status: "idle" | "loading" | "succeeded" | "failed";
    errorMessage: string | null;
    fieldErrors: Record<string, string> | null;
}

export interface LoginPayload {
    identifier: string;
    password: string;
}

export interface RegisterPayload {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface AuthResponse {
    user: AuthUser;
    access_token: string;
}

export interface OAuthResponse extends AuthResponse {
    is_new_user: boolean;
}

export interface OnboardingPayload {
    username: string;
    firstName: string;
    lastName: string;
}