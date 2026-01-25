import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
    isSidebarOpen: boolean;
}

const getInitialState = (): UiState => {
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem("sidebarOpen");
        if (saved !== null) {
            return { isSidebarOpen: JSON.parse(saved) };
        }
    }
    return { isSidebarOpen: true };
};

const initialState: UiState = getInitialState();

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
            if (typeof window !== "undefined") {
                localStorage.setItem("sidebarOpen", JSON.stringify(state.isSidebarOpen));
            }
        },
        setSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.isSidebarOpen = action.payload;
            if (typeof window !== "undefined") {
                localStorage.setItem("sidebarOpen", JSON.stringify(state.isSidebarOpen));
            }
        },
    },
});

export const { toggleSidebar, setSidebarOpen } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
