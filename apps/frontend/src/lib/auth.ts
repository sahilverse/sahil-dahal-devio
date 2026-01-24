import { clearAuth } from "@/slices/auth";

let storeInstance: any = null;

function getStore() {
    if (!storeInstance) {
        // Lazy import to avoid circular dependency
        storeInstance = require("@/store").store;
    }
    return storeInstance;
}

export function getAccessToken(): string | null {
    return getStore().getState().auth.accessToken;
}

export function setAccessToken(token: string): void {
    getStore().dispatch({ type: "auth/setAccessToken", payload: token });
}

export function logout(): void {
    getStore().dispatch(clearAuth());
}
