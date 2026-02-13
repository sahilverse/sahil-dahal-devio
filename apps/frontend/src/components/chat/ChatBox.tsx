"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setView } from "@/slices/chat/chatSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Paperclip, X, Loader2, File, Video, FileText } from "lucide-react";
import MessageBubble from "./MessageBubble";
import InviteBanner from "./InviteBanner";
import {
    useMessages,
    useStartConversation,
    useSendMessage,
    useEditMessage,
    useDeleteMessage,
    useMarkAsSeen,
} from "@/hooks/useConversation";
import { useConversations } from "@/hooks/useConversation";
import { setActiveConversation } from "@/slices/chat/chatSlice";
import { socketInstance } from "@/lib/socket";
import {
    isToday,
    isYesterday,
    isSameDay,
    format,
    differenceInDays,
    isSameMinute
} from "date-fns";
import type { Conversation, Message } from "@/types/conversation";
import Image from "next/image";

export default function ChatBox() {
    const dispatch = useAppDispatch();
    const { activeConversationId, pendingRecipient } = useAppSelector((s) => s.chat);
    const { user } = useAppSelector((s) => s.auth);
    const [messageText, setMessageText] = useState("");
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    const [previews, setPreviews] = useState<{ id: string; url: string; file: File }[]>([]);
    const previewsRef = useRef<{ id: string; url: string; file: File }[]>([]);

    useEffect(() => {
        const newPreviews = mediaFiles.map(file => {
            const existing = previews.find(p => p.file === file);
            if (existing) return existing;
            return {
                id: Math.random().toString(36).substr(2, 9),
                url: URL.createObjectURL(file),
                file
            };
        });

        previews.forEach(p => {
            if (!mediaFiles.includes(p.file)) {
                URL.revokeObjectURL(p.url);
            }
        });

        setPreviews(newPreviews);
        previewsRef.current = newPreviews;
    }, [mediaFiles]);

    useEffect(() => {
        return () => {
            previewsRef.current.forEach(p => URL.revokeObjectURL(p.url));
        };
    }, []);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Queries
    const { data: messagesData, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages(activeConversationId);
    const { data: conversationsData } = useConversations();

    // Mutations
    const { mutate: startConversation, isPending: isStarting } = useStartConversation();
    const { mutate: sendMessage, isPending: isSending } = useSendMessage();
    const { mutate: editMessage } = useEditMessage();
    const { mutate: deleteMessage } = useDeleteMessage();
    const { mutate: markAsSeen } = useMarkAsSeen();

    // Find active conversation
    const activeConversation: Conversation | undefined = conversationsData?.pages
        ?.flat()
        .find((c) => c.id === activeConversationId);

    // Determine the other user
    const otherUser = activeConversation
        ? activeConversation.participants.find((p) => p.userId !== user?.id)?.user
        : pendingRecipient
            ? { id: pendingRecipient.id, username: pendingRecipient.username, avatarUrl: pendingRecipient.avatarUrl }
            : null;

    const isInvitePending = activeConversation?.status === "INVITE_PENDING";
    const iAmRecipient = isInvitePending && user && activeConversation?.inviteSenderId !== user.id;
    const isSenderBlocked = isInvitePending && user && activeConversation?.inviteSenderId === user.id;

    const messages = messagesData?.pages?.flat() ?? [];

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length, isTyping, mediaFiles.length]);

    // Mark as seen
    useEffect(() => {
        if (activeConversationId && messages.length > 0) {
            markAsSeen(activeConversationId);
        }
    }, [activeConversationId, messages.length]);

    // Typing Listener
    useEffect(() => {
        if (!activeConversationId) return;
        const socket = socketInstance.getSocket();
        if (!socket) return;

        const handleTyping = (data: { conversationId: string; userId: string }) => {
            if (data.conversationId === activeConversationId && data.userId !== user?.id) {
                setIsTyping(true);
            }
        };

        const handleStopTyping = (data: { conversationId: string; userId: string }) => {
            if (data.conversationId === activeConversationId && data.userId !== user?.id) {
                setIsTyping(false);
            }
        };

        socket.on("conversation:typing", handleTyping);
        socket.on("conversation:stop_typing", handleStopTyping);

        return () => {
            socket.off("conversation:typing", handleTyping);
            socket.off("conversation:stop_typing", handleStopTyping);
        };
    }, [activeConversationId, user?.id]);


    const handleScroll = useCallback(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        if (container.scrollTop < 50 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const emitTyping = () => {
        if (!activeConversationId || !otherUser) return;
        const socket = socketInstance.getSocket();
        if (!socket) return;

        socket.emit("conversation:typing", {
            conversationId: activeConversationId,
            recipientId: otherUser.id,
        });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("conversation:stop_typing", {
                conversationId: activeConversationId,
                recipientId: otherUser.id,
            });
        }, 2000);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            setMediaFiles((prev) => [...prev, ...files]);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeMedia = (index: number) => {
        setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSend = () => {
        const text = messageText.trim();
        if (!text && mediaFiles.length === 0) return;

        if (!activeConversationId && pendingRecipient) {
            startConversation(
                { recipientId: pendingRecipient.id, message: text || "Sent an attachment" },
                {
                    onSuccess: (conversation) => {
                        dispatch(setActiveConversation(conversation.id));
                        setMessageText("");
                        setMediaFiles([]);
                    },
                }
            );
            return;
        }

        if (activeConversationId) {
            sendMessage(
                { conversationId: activeConversationId, content: text, media: mediaFiles.length > 0 ? mediaFiles : undefined },
                {
                    onSuccess: () => {
                        setMessageText("");
                        setMediaFiles([]);
                    }
                }
            );
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
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
                <Avatar className="h-7 w-7">
                    <AvatarImage src={otherUser?.avatarUrl ?? undefined} className="object-cover" />
                    <AvatarFallback className="text-[10px] font-semibold bg-muted">
                        {otherUser?.username?.charAt(0).toUpperCase() ?? "?"}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col select-none">
                    <span className="text-sm font-semibold truncate leading-none">{otherUser?.username ?? "Chat"}</span>
                    {isTyping && (
                        <span className="text-[10px] text-brand-primary font-medium animate-pulse mt-0.5">typing...</span>
                    )}
                </div>
            </div>

            {/* Messages area */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto py-3 space-y-0.5 relative"
            >
                {isFetchingNextPage && (
                    <div className="flex justify-center py-2">
                        <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {messages.length === 0 && !pendingRecipient && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <p className="text-sm">No messages yet</p>
                    </div>
                )}

                {messages.length === 0 && pendingRecipient && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground px-6 ">
                        <Avatar className="h-16 w-16 mb-3">
                            <AvatarImage src={pendingRecipient.avatarUrl ?? undefined} className="object-cover" />
                            <AvatarFallback className="text-xl font-bold bg-muted">
                                {pendingRecipient.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium text-foreground">{pendingRecipient.username}</p>
                        <p className="text-xs text-center mt-1.5">
                            Send a message to start chatting! 👋
                        </p>
                    </div>
                )}

                {(() => {
                    const elements: React.ReactNode[] = [];
                    messages.forEach((msg, i) => {
                        const prevMsg = messages[i - 1];
                        const nextMsg = messages[i + 1];

                        // 1. Check if we need a date divider
                        const msgDate = new Date(msg.createdAt);
                        const prevMsgDate = prevMsg ? new Date(prevMsg.createdAt) : null;

                        if (!prevMsgDate || !isSameDay(msgDate, prevMsgDate)) {
                            let dateText = "";
                            if (isToday(msgDate)) dateText = "Today";
                            else if (isYesterday(msgDate)) dateText = "Yesterday";
                            else if (differenceInDays(new Date(), msgDate) < 7) dateText = format(msgDate, "EEEE");
                            else dateText = format(msgDate, "d MMM, yyyy");

                            elements.push(
                                <div key={`date-${msg.id}`} className="flex items-center gap-4 my-4 px-6">
                                    <div className="h-[1px] flex-1 bg-border" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                                        {dateText}
                                    </span>
                                    <div className="h-[1px] flex-1 bg-border" />
                                </div>
                            );
                        }
                        const showAvatar = !prevMsg ||
                            prevMsg.senderId !== msg.senderId ||
                            !isSameDay(new Date(msg.createdAt), new Date(prevMsg.createdAt));
                        const showTimestamp = !nextMsg ||
                            nextMsg.senderId !== msg.senderId ||
                            !isSameMinute(new Date(msg.createdAt), new Date(nextMsg.createdAt)) ||
                            !isSameDay(new Date(msg.createdAt), new Date(nextMsg.createdAt));

                        elements.push(
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                isOwn={msg.senderId === user?.id}
                                showAvatar={showAvatar}
                                showTimestamp={showTimestamp}
                                onEdit={(id, content) => editMessage({ messageId: id, content })}
                                onDelete={(id, mode) => deleteMessage({ messageId: id, mode, conversationId: activeConversationId! })}
                            />
                        );
                    });
                    return elements;
                })()}

                <div ref={messagesEndRef} />
            </div>

            {/* Invite banner */}
            {isInvitePending && iAmRecipient && activeConversationId && (
                <InviteBanner
                    conversationId={activeConversationId}
                    senderName={otherUser?.username ?? "Someone"}
                />
            )}

            {/* Sender blocked */}
            {isSenderBlocked && (
                <div className="px-3 pb-2">
                    <p className="text-xs text-center text-muted-foreground bg-muted rounded-lg py-2 px-3">
                        Waiting for {otherUser?.username} to accept your invite...
                    </p>
                </div>
            )}

            {/* Input area */}
            {!isSenderBlocked && (
                <div className="flex flex-col border-t border-border shrink-0 bg-card">
                    {/* Media Preview */}
                    {previews.length > 0 && (
                        <div className="flex gap-2 p-2 px-3 overflow-x-auto bg-muted/30 border-b border-border">
                            {previews.map((preview, i) => (
                                <div key={preview.id} className="relative w-14 h-14 rounded-lg overflow-hidden border border-border shrink-0 bg-background group animate-in zoom-in-50 duration-200">
                                    {preview.file.type.startsWith("image/") ? (
                                        <Image
                                            src={preview.url}
                                            alt="preview"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[10px] text-muted-foreground p-1">
                                            {preview.file.type.startsWith("video/") ? (
                                                <Video className="w-4 h-4 text-primary" />
                                            ) : (
                                                <FileText className="w-4 h-4 text-primary" />
                                            )}
                                            <span className="truncate w-full text-center">{preview.file.name}</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => removeMedia(i)}
                                        className="absolute top-0.5 right-0.5 bg-background/80 hover:bg-destructive hover:text-white text-muted-foreground rounded-full p-0.5 shadow-sm transition-colors cursor-pointer"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-2 px-3 py-2.5">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isInvitePending}
                            title={isInvitePending ? "Accept the invite to send media" : "Attach media"}
                            className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <Paperclip className="w-4.5 h-4.5" />
                        </button>
                        <input
                            type="file"
                            multiple
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />

                        <input
                            type="text"
                            value={messageText}
                            onChange={(e) => {
                                setMessageText(e.target.value);
                                emitTyping();
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Message"
                            className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-primary placeholder:text-muted-foreground"
                        />
                        <button
                            onClick={handleSend}
                            disabled={(!messageText.trim() && mediaFiles.length === 0) || isStarting || isSending}
                            className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-full transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isSending ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
