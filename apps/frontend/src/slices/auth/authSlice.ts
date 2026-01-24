import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/api/axios";
import type {
    AuthState,
    AuthUser,
    LoginPayload,
    RegisterPayload,
    AuthResponse,
    OAuthResponse,
    OnboardingPayload,
    ForgotPasswordPayload,
    VerifyResetTokenPayload,
    ResetPasswordPayload,
} from "./authTypes";

const initialState: AuthState = {
    accessToken: null,
    user: null,
    isNewUser: false,
    status: "idle",
    errorMessage: null,
    fieldErrors: null,
    resetSessionToken: null,
};


export const login = createAsyncThunk<
    AuthResponse,
    LoginPayload,
    { rejectValue: { errorMessage?: string; fieldErrors?: Record<string, string> } }
>("auth/login", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/auth/login", payload);
        return data.result as AuthResponse;
    } catch (error: any) {
        return rejectWithValue(error);
    }
});

export const register = createAsyncThunk<
    void,
    RegisterPayload,
    { rejectValue: { errorMessage?: string; fieldErrors?: Record<string, string> } }
>("auth/register", async (payload, { rejectWithValue }) => {
    try {
        await api.post("/auth/register", payload);
    } catch (error: any) {
        return rejectWithValue(error);
    }
});

export const googleOAuth = createAsyncThunk<
    OAuthResponse,
    string,
    { rejectValue: { errorMessage?: string; fieldErrors?: Record<string, string> } }
>("auth/googleOAuth", async (code, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/oauth/google/callback", { code });
        return data.result as OAuthResponse;
    } catch (error: any) {
        return rejectWithValue(error);
    }
});

export const githubOAuth = createAsyncThunk<
    OAuthResponse,
    string,
    { rejectValue: { errorMessage?: string; fieldErrors?: Record<string, string> } }
>("auth/githubOAuth", async (code, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/oauth/github/callback", { code });
        return data.result as OAuthResponse;
    } catch (error: any) {
        return rejectWithValue(error);
    }
});

export const completeOnboarding = createAsyncThunk<
    AuthUser,
    OnboardingPayload,
    { rejectValue: { errorMessage?: string; fieldErrors?: Record<string, string> } }
>("auth/completeOnboarding", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.patch("/user/onboarding", payload);
        return data.result as AuthUser;
    } catch (error: any) {
        return rejectWithValue(error);
    }
});

export const sendVerificationEmail = createAsyncThunk<
    void,
    string,
    { rejectValue: { errorMessage?: string } }
>("auth/sendVerificationEmail", async (email, { rejectWithValue }) => {
    try {
        await api.post("/auth/send-email-verification-token", { email });
    } catch (error: any) {
        return rejectWithValue(error);
    }
});

export const verifyEmail = createAsyncThunk<
    void,
    { email?: string; token: string },
    { rejectValue: { errorMessage?: string } }
>("auth/verifyEmail", async ({ email, token }, { rejectWithValue }) => {
    try {
        await api.post("/auth/verify-email-verification-token", { email, token });
    } catch (error: any) {
        return rejectWithValue(error);
    }
});

export const logoutUser = createAsyncThunk<void, void>(
    "auth/logout",
    async () => {
        await api.post("/auth/logout");
    }
);

export const forgotPassword = createAsyncThunk<
    void,
    ForgotPasswordPayload,
    { rejectValue: { errorMessage?: string; fieldErrors?: Record<string, string> } }
>("auth/forgotPassword", async (payload, { rejectWithValue }) => {
    try {
        await api.post("/auth/forgot-password", payload);
    } catch (error: any) {
        return rejectWithValue(error);
    }
});

export const verifyResetToken = createAsyncThunk<
    string,
    VerifyResetTokenPayload,
    { rejectValue: { errorMessage?: string; fieldErrors?: Record<string, string> } }
>("auth/verifyResetToken", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/auth/verify-password-reset-token", payload);
        return data.result.reset_session_token;
    } catch (error: any) {
        return rejectWithValue(error);
    }
});

export const resetPassword = createAsyncThunk<
    void,
    ResetPasswordPayload,
    { state: { auth: AuthState }; rejectValue: { errorMessage?: string; fieldErrors?: Record<string, string> } }
>("auth/resetPassword", async (payload, { getState, rejectWithValue }) => {
    try {
        const { resetSessionToken } = getState().auth;
        if (!resetSessionToken) {
            return rejectWithValue({ errorMessage: "Session expired. Please start over." });
        }
        await api.post("/auth/reset-password", payload, {
            headers: { Authorization: `Bearer ${resetSessionToken}` },
        });
    } catch (error: any) {
        return rejectWithValue(error);
    }
});

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAccessToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload;
        },
        setUser: (state, action: PayloadAction<AuthUser>) => {
            state.user = action.payload;
        },
        clearAuth: (state) => {
            state.accessToken = null;
            state.user = null;
            state.isNewUser = false;
            state.status = "idle";
            state.errorMessage = null;
            state.fieldErrors = null;
        },
        clearErrors: (state) => {
            state.errorMessage = null;
            state.fieldErrors = null;
        },
        clearResetSession: (state) => {
            state.resetSessionToken = null;
        },
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(login.pending, (state) => {
                state.status = "loading";
                state.errorMessage = null;
                state.fieldErrors = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.accessToken = action.payload.access_token;
                state.user = action.payload.user;
            })
            .addCase(login.rejected, (state, action) => {
                state.status = "failed";
                state.errorMessage = action.payload?.errorMessage || "Login failed";
                state.fieldErrors = action.payload?.fieldErrors || null;
            });

        // Register
        builder
            .addCase(register.pending, (state) => {
                state.status = "loading";
                state.errorMessage = null;
                state.fieldErrors = null;
            })
            .addCase(register.fulfilled, (state) => {
                state.status = "succeeded";
                state.isNewUser = true;
            })
            .addCase(register.rejected, (state, action) => {
                state.status = "failed";
                state.errorMessage = action.payload?.errorMessage || "Registration failed";
                state.fieldErrors = action.payload?.fieldErrors || null;
            });

        // Google OAuth
        builder
            .addCase(googleOAuth.pending, (state) => {
                state.status = "loading";
                state.errorMessage = null;
                state.fieldErrors = null;
            })
            .addCase(googleOAuth.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.accessToken = action.payload.access_token;
                state.user = action.payload.user;
                state.isNewUser = action.payload.is_new_user;
            })
            .addCase(googleOAuth.rejected, (state, action) => {
                state.status = "failed";
                state.errorMessage = action.payload?.errorMessage || "Google login failed";
                state.fieldErrors = action.payload?.fieldErrors || null;
            });

        // GitHub OAuth
        builder
            .addCase(githubOAuth.pending, (state) => {
                state.status = "loading";
                state.errorMessage = null;
                state.fieldErrors = null;
            })
            .addCase(githubOAuth.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.accessToken = action.payload.access_token;
                state.user = action.payload.user;
                state.isNewUser = action.payload.is_new_user;
            })
            .addCase(githubOAuth.rejected, (state, action) => {
                state.status = "failed";
                state.errorMessage = action.payload?.errorMessage || "GitHub login failed";
                state.fieldErrors = action.payload?.fieldErrors || null;
            });

        // Complete Onboarding
        builder
            .addCase(completeOnboarding.pending, (state) => {
                state.status = "loading";
                state.errorMessage = null;
                state.fieldErrors = null;
            })
            .addCase(completeOnboarding.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload;
            })
            .addCase(completeOnboarding.rejected, (state, action) => {
                state.status = "failed";
                state.errorMessage = action.payload?.errorMessage || "Failed to complete profile";
                state.fieldErrors = action.payload?.fieldErrors || null;
            });

        // Logout
        builder
            .addCase(logoutUser.fulfilled, (state) => {
                state.accessToken = null;
                state.user = null;
                state.status = "idle";
            });

        // Email Verification
        builder
            .addCase(verifyEmail.fulfilled, (state) => {
                if (state.user) {
                    state.user.emailVerified = new Date().toISOString();
                }
                state.status = "succeeded";
            });


        // Forgot Password
        builder
            .addCase(forgotPassword.pending, (state) => {
                state.status = "loading";
                state.errorMessage = null;
                state.fieldErrors = null;
            })
            .addCase(forgotPassword.fulfilled, (state) => {
                state.status = "succeeded";
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.status = "failed";
                state.errorMessage = action.payload?.errorMessage || "Failed to send reset link";
                state.fieldErrors = action.payload?.fieldErrors || null;
            });

        // Verify Reset Token
        builder
            .addCase(verifyResetToken.pending, (state) => {
                state.status = "loading";
                state.errorMessage = null;
                state.fieldErrors = null;
            })
            .addCase(verifyResetToken.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.resetSessionToken = action.payload;
            })
            .addCase(verifyResetToken.rejected, (state, action) => {
                state.status = "failed";
                state.errorMessage = action.payload?.errorMessage || "Invalid token";
                state.fieldErrors = action.payload?.fieldErrors || null;
            });

        // Reset Password
        builder
            .addCase(resetPassword.pending, (state) => {
                state.status = "loading";
                state.errorMessage = null;
                state.fieldErrors = null;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.status = "succeeded";
                state.resetSessionToken = null; 
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.status = "failed";
                state.errorMessage = action.payload?.errorMessage || "Failed to reset password";
                state.fieldErrors = action.payload?.fieldErrors || null;
            });
    },
});

export const { setAccessToken, setUser, clearAuth, clearErrors, clearResetSession } = authSlice.actions;
export const authReducer = authSlice.reducer;

