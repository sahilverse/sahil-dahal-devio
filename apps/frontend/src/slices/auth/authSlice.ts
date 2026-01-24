import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/api/axios";
import type {
    AuthState,
    AuthUser,
    LoginPayload,
    RegisterPayload,
    AuthResponse,
    OAuthResponse,
} from "./authTypes";

const initialState: AuthState = {
    accessToken: null,
    user: null,
    isNewUser: false,
    status: "idle",
    errorMessage: null,
    fieldErrors: null,
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

export const logoutUser = createAsyncThunk<void, void>(
    "auth/logout",
    async () => {
        await api.post("/auth/logout");
    }
);

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

        // Logout
        builder
            .addCase(logoutUser.fulfilled, (state) => {
                state.accessToken = null;
                state.user = null;
                state.status = "idle";
            });
    },
});

export const { setAccessToken, setUser, clearAuth, clearErrors } = authSlice.actions;
export const authReducer = authSlice.reducer;
