import { Middleware } from "@reduxjs/toolkit";
import { setTheme } from "./themeSlice";

export const themeMiddleware: Middleware = () => (next) => (action) => {
    const result = next(action);

    if (setTheme.match(action)) {
        if (typeof window !== "undefined") {
            localStorage.setItem("devio-theme", action.payload);
        }
    }

    return result;
};