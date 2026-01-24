import { store } from "@/store";
import { clearAuth } from "@/slices/auth";

export function getAccessToken(): string | null {
    return store.getState().auth.accessToken;
}

export function setAccessToken(token: string): void {
    store.dispatch({ type: "auth/setAccessToken", payload: token });
}

export function logout(): void {
    store.dispatch(clearAuth());
}


