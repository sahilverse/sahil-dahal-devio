"use client";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { maximizeChat, minimizeChat, closeChat, setView, toggleChat } from "@/slices/chat/chatSlice";
import { X, Minus, Plus, MessageSquareText, ChevronUp } from "lucide-react";
import ConversationList from "./ConversationList";
import ChatBox from "./ChatBox";
import { motion, AnimatePresence } from "motion/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import ChatSearch from "./ChatSearch";
import { useUnreadChatCount } from "@/hooks/useConversation";

export default function ChatModal() {
    const dispatch = useAppDispatch();
    const { isChatOpen, isMinimized, view } = useAppSelector((s) => s.chat);
    const [activeTab, setActiveTab] = useState<"all" | "requests">("all");
    const [direction, setDirection] = useState(0);

    const handleTabChange = (newTab: "all" | "requests") => {
        if (newTab === activeTab) return;
        setDirection(newTab === "requests" ? 1 : -1);
        setActiveTab(newTab);
    };

    const tabVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? "100%" : "-100%",
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction > 0 ? "-100%" : "100%",
            opacity: 0,
        }),
    };
    const { data: unreadCounts } = useUnreadChatCount();
    const [lastSeenMessages, setLastSeenMessages] = useState(0);
    const [lastSeenRequests, setLastSeenRequests] = useState(0);

    const messagesCount = unreadCounts?.messages || 0;
    const requestsCount = unreadCounts?.requests || 0;

    useEffect(() => {
        if (activeTab === "all" && isChatOpen && !isMinimized) {
            setLastSeenMessages(messagesCount);
        }
        if (activeTab === "requests" && isChatOpen && !isMinimized) {
            setLastSeenRequests(requestsCount);
        }
    }, [activeTab, messagesCount, requestsCount, isChatOpen, isMinimized]);

    const showMessagesBadge = messagesCount > 0 && messagesCount > lastSeenMessages;
    const showRequestsBadge = requestsCount > 0 && requestsCount > lastSeenRequests;

    return (
        <AnimatePresence mode="wait">
            {isChatOpen && (
                isMinimized ? (
                    <motion.div
                        key="minimized"
                        initial={{ y: 20, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 20, opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-4 right-4 z-50 bg-card border border-border shadow-lg rounded-full px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => dispatch(maximizeChat())}
                    >
                        <div className="relative">
                            <MessageSquareText className="w-5 h-5 text-brand-primary" />
                            {unreadCounts && unreadCounts.total > 0 && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                            )}
                        </div>
                        <span className="text-sm font-semibold">Chat</span>
                        <ChevronUp className="w-4 h-4 text-muted-foreground ml-1" />

                        <button
                            onClick={(e) => { e.stopPropagation(); dispatch(closeChat()); }}
                            className="p-1 hover:bg-muted rounded-full ml-1"
                        >
                            <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="maximized"
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-4 right-4 z-50 w-[380px] h-[520px] bg-card border border-border rounded-xl shadow-lg flex flex-col overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0 bg-card z-10">
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold">
                                    {view === "chat" ? "Chat" : "Chats"}
                                </h2>
                            </div>
                            <div className="flex items-center gap-0.5">
                                {view === "list" && (
                                    <button
                                        onClick={() => dispatch(setView("search"))}
                                        className="p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
                                        title="New chat"
                                    >
                                        <Plus className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                )}
                                <button
                                    onClick={() => dispatch(minimizeChat())}
                                    className="p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
                                    title="Minimize"
                                >
                                    <Minus className="w-4 h-4 text-muted-foreground" />
                                </button>
                                <button
                                    onClick={() => dispatch(closeChat())}
                                    className="p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
                                    title="Close"
                                >
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>
                        </div>

                        {/* Content area */}
                        <div className="flex-1 overflow-hidden flex flex-col">
                            {view === "list" ? (
                                <div className="flex-1 flex flex-col min-h-0 relative">
                                    <div className="px-4 py-2 border-b bg-card z-10">
                                        <div className="flex w-full bg-transparent h-auto p-0 gap-2 relative">
                                            <button
                                                onClick={() => handleTabChange("all")}
                                                className={`flex-1 relative cursor-pointer py-2 text-sm font-medium transition-colors duration-200 outline-none ${activeTab === "all" ? "text-brand-primary" : "text-muted-foreground"}`}
                                            >
                                                Messages
                                                {showMessagesBadge && (
                                                    <span className="ml-2 inline-flex items-center justify-center bg-brand-primary text-white text-[10px] h-4 min-w-4 px-1 rounded-full">{messagesCount}</span>
                                                )}
                                                {activeTab === "all" && (
                                                    <motion.div
                                                        layoutId="activeTab"
                                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
                                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                    />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleTabChange("requests")}
                                                className={`flex-1 relative cursor-pointer py-2 text-sm font-medium transition-colors duration-200 outline-none ${activeTab === "requests" ? "text-brand-primary" : "text-muted-foreground"}`}
                                            >
                                                Requests
                                                {showRequestsBadge && (
                                                    <span className="ml-2 inline-flex items-center justify-center bg-orange-500 text-white text-[10px] h-4 min-w-4 px-1 rounded-full">{requestsCount}</span>
                                                )}
                                                {activeTab === "requests" && (
                                                    <motion.div
                                                        layoutId="activeTab"
                                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
                                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                    />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 relative overflow-hidden">
                                        <AnimatePresence initial={false} custom={direction}>
                                            <motion.div
                                                key={activeTab}
                                                custom={direction}
                                                variants={tabVariants}
                                                initial="enter"
                                                animate="center"
                                                exit="exit"
                                                transition={{
                                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                                    opacity: { duration: 0.2 }
                                                }}
                                                className="absolute inset-0"
                                            >
                                                <ConversationList filter={activeTab} />
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ) : view === "search" ? (
                                <ChatSearch />
                            ) : (
                                <ChatBox />
                            )}
                        </div>
                    </motion.div>
                )
            )}
        </AnimatePresence>
    );
}
