"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setActiveConversation, setPendingRecipient, setView } from "@/slices/chat/chatSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Search } from "lucide-react";
import { useSearchConversations } from "@/hooks/useConversation";
import { useDebounce } from "@/hooks/useDebounce";
import type { Conversation } from "@/types/conversation";

export default function ChatSearch() {
    const dispatch = useAppDispatch();
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 300);
    const { data: results, isLoading } = useSearchConversations(debouncedQuery);

    const handleSelectConversation = (conv: Conversation) => {
        if (conv.id) {
            dispatch(setActiveConversation(conv.id));
        } else {
            const otherUser = conv.participants[0]?.user;
            if (otherUser) {
                dispatch(setPendingRecipient({
                    id: otherUser.id,
                    username: otherUser.username,
                    avatarUrl: otherUser.avatarUrl
                }));
            }
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-border shrink-0">
                <button
                    onClick={() => dispatch(setView("list"))}
                    className="p-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <span className="text-sm font-semibold">New Chat</span>
            </div>

            {/* Search input */}
            <div className="px-3 py-2.5 border-b border-border">
                <div className="flex items-center gap-2 bg-secondary rounded-full px-3 py-1.5">
                    <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by username"
                        autoFocus
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
                {isLoading && debouncedQuery.length >= 2 && (
                    <div className="flex justify-center py-6">
                        <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {!isLoading && debouncedQuery.length >= 2 && results?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                        <p className="text-sm text-muted-foreground">No users found for &quot;{debouncedQuery}&quot;</p>
                    </div>
                )}

                {debouncedQuery.length < 2 && (
                    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                        <Search className="w-8 h-8 text-muted-foreground/50 mb-3" />
                        <p className="text-xs text-muted-foreground">
                            Type a username to find someone to chat with
                        </p>
                    </div>
                )}

                {results?.map((conv: Conversation) => (
                    <button
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer text-left"
                    >
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={conv.iconUrl ?? undefined} className="object-cover" />
                            <AvatarFallback className="text-xs font-semibold bg-muted">
                                {conv.name?.charAt(0).toUpperCase() ?? "?"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{conv.name}</p>
                            {!conv.id && (
                                <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Start a new conversation</p>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
