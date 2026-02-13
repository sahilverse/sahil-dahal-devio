import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PendingRecipient {
    id: string;
    username: string;
    avatarUrl: string | null;
}

type ChatView = "list" | "chat" | "search";

interface ChatState {
    isChatOpen: boolean;
    isMinimized: boolean;
    activeConversationId: string | null;
    pendingRecipient: PendingRecipient | null;
    view: ChatView;
}

const STORAGE_KEY = "devio_chat_state";

const loadPersistedState = () => {
    if (typeof window === "undefined") return null;
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        return null;
    }
};

const savePersistedState = (state: Partial<ChatState>) => {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { }
};

const persisted = loadPersistedState();

const initialState: ChatState = {
    isChatOpen: persisted?.isChatOpen ?? false,
    isMinimized: persisted?.isMinimized ?? false,
    activeConversationId: persisted?.activeConversationId ?? null,
    pendingRecipient: null,
    view: persisted?.view ?? "list",
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        toggleChat(state) {
            if (state.isMinimized) {
                state.isMinimized = false;
                state.isChatOpen = true;
            } else {
                state.isChatOpen = !state.isChatOpen;
            }

            if (!state.isChatOpen) {
                state.activeConversationId = null;
                state.pendingRecipient = null;
                state.view = "list";
                state.isMinimized = false;
            }
            saveState(state);
        },
        openChat(state) {
            state.isChatOpen = true;
            state.isMinimized = false;
            saveState(state);
        },
        closeChat(state) {
            state.isChatOpen = false;
            state.isMinimized = false;
            state.activeConversationId = null;
            state.pendingRecipient = null;
            state.view = "list";
            saveState(state);
        },
        minimizeChat(state) {
            state.isMinimized = true;
            state.isChatOpen = true;
            saveState(state);
        },
        maximizeChat(state) {
            state.isMinimized = false;
            state.isChatOpen = true;
            saveState(state);
        },
        setActiveConversation(state, action: PayloadAction<string>) {
            state.activeConversationId = action.payload;
            state.pendingRecipient = null;
            state.view = "chat";
            state.isMinimized = false;
            saveState(state);
        },
        setPendingRecipient(state, action: PayloadAction<PendingRecipient>) {
            state.pendingRecipient = action.payload;
            state.activeConversationId = null;
            state.view = "chat";
            state.isMinimized = false;
            saveState(state);
        },
        setView(state, action: PayloadAction<ChatView>) {
            state.view = action.payload;
            if (action.payload === "list") {
                state.activeConversationId = null;
                state.pendingRecipient = null;
            }
            saveState(state);
        },
    },
});

function saveState(state: ChatState) {
    savePersistedState({
        isChatOpen: state.isChatOpen,
        isMinimized: state.isMinimized,
        activeConversationId: state.activeConversationId,
        view: state.view
    });
}

export const {
    toggleChat,
    openChat,
    closeChat,
    minimizeChat,
    maximizeChat,
    setActiveConversation,
    setPendingRecipient,
    setView,
} = chatSlice.actions;

export const chatReducer = chatSlice.reducer;
