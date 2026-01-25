import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@/slices/auth";
import { themeReducer, themeMiddleware } from "@/slices/theme";
import { uiReducer } from "@/slices/ui/uiSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        theme: themeReducer,
        ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat(themeMiddleware);
    },
    devTools: process.env.NODE_ENV !== "production",
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;