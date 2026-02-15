"use client";

import { useState, useRef } from "react";
import UserAvatar from "../navbar/UserAvatar";
import { Check, CheckCheck, Pencil, Trash2, CornerUpLeft } from "lucide-react";
import { format, isSameMinute } from "date-fns";
import type { Message } from "@/types/conversation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Maximize2 } from "lucide-react";
import PostMediaLightbox from "@/components/profile/posts/PostMediaLightbox";

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
    showTimestamp?: boolean;
    showAvatar?: boolean;
    onEdit?: (messageId: string, content: string) => void;
    onDelete?: (messageId: string, mode: "me" | "everyone") => void;
}

export default function MessageBubble({
    message,
    isOwn,
    showTimestamp = true,
    showAvatar = true,
    onEdit,
    onDelete
}: MessageBubbleProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content || "");
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleEditSubmit = () => {
        if (editContent.trim() && editContent !== message.content) {
            onEdit?.(message.id, editContent.trim());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleEditSubmit();
        }
        if (e.key === "Escape") {
            setIsEditing(false);
            setEditContent(message.content || "");
        }
    };

    const timestamp = format(new Date(message.createdAt), "h:mm a");

    const isMediaOnly = message.media && message.media.length > 0 && !message.content;

    if (message.isDeleted) {
        return (
            <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2 px-3`}>
                <div className="px-3 py-2 rounded-xl bg-muted/50 max-w-[75%]">
                    <p className="text-xs text-muted-foreground italic">This message was removed</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`group flex ${isOwn ? "justify-end" : "justify-start"} mb-2 px-3`}>
            <div className={`flex items-end gap-1.5 max-w-[75%] ${isOwn ? "flex-row-reverse" : ""}`}>
                {/* Avatar for received messages */}
                {!isOwn && (
                    <div className="w-6 shrink-0 mb-1">
                        {showAvatar && (
                            <div className="h-6 w-6">
                                <UserAvatar
                                    user={{
                                        avatarUrl: message.sender.avatarUrl,
                                        username: message.sender.username
                                    }}
                                    size="sm"
                                />
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-0.5">
                    {/* Message bubble */}
                    <div
                        className={`relative rounded-2xl text-sm break-words transition-colors ${isMediaOnly
                            ? "bg-transparent p-0"
                            : `px-3 py-2 ${isOwn
                                ? "bg-brand-primary text-white rounded-br-md"
                                : "bg-secondary text-secondary-foreground rounded-bl-md"
                            }`
                            }`}
                    >
                        {isEditing ? (
                            <div className="flex flex-col gap-1.5">
                                <textarea
                                    ref={inputRef}
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full min-h-[40px] bg-transparent text-sm resize-none outline-none"
                                    autoFocus
                                    rows={1}
                                />
                                <div className="flex items-center gap-1.5 justify-end">
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditContent(message.content || "");
                                        }}
                                        className="text-[10px] px-2 py-0.5 rounded-md hover:bg-white/20 transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleEditSubmit}
                                        className="text-[10px] px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Media attachments */}
                                {message.media && message.media.length > 0 && (
                                    <div className={`flex flex-col gap-1.5 ${!isMediaOnly ? "mb-1.5" : ""}`}>
                                        {message.media.map((m) => (
                                            <div key={m.id} className="relative group/media">
                                                {m.type === "IMAGE" ? (
                                                    <div
                                                        className="relative cursor-pointer overflow-hidden rounded-lg hover:ring-2 hover:ring-brand-primary transition-all"
                                                        onClick={() => {
                                                            // Find the index of this media item in the full media list
                                                            const idx = message.media.findIndex(x => x.id === m.id);
                                                            setLightboxIndex(idx >= 0 ? idx : 0);
                                                            setIsLightboxOpen(true);
                                                        }}
                                                    >
                                                        <img
                                                            src={m.url}
                                                            alt={m.fileName || "Image"}
                                                            className="max-w-full max-h-72 object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Maximize2 className="w-6 h-6 text-white" />
                                                        </div>
                                                    </div>
                                                ) : m.type === "VIDEO" ? (
                                                    <video
                                                        src={m.url}
                                                        controls
                                                        className="rounded-lg max-w-full max-h-72"
                                                    />
                                                ) : (
                                                    <a
                                                        href={m.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`flex items-center gap-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs ${isMediaOnly ? "bg-secondary/50" : ""}`}
                                                    >
                                                        📎 {m.fileName || "File"}
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <p className="whitespace-pre-wrap">{message.content}</p>
                            </>
                        )}
                    </div>

                    {/* Metadata row */}
                    {showTimestamp && (
                        <div className={`flex items-center gap-1 px-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                            <span className="text-[10px] text-muted-foreground">{timestamp}</span>
                            {message.isEdited && (
                                <span className="text-[10px] text-muted-foreground italic">edited</span>
                            )}
                            {isOwn && (
                                <div className="flex items-center ml-0.5">
                                    {message.status === "SENT" ? (
                                        <Check className="w-3 h-3 text-muted-foreground" />
                                    ) : message.status === "DELIVERED" ? (
                                        <CheckCheck className="w-3 h-3 text-muted-foreground" />
                                    ) : (
                                        <CheckCheck className="w-3 h-3 text-brand-primary" />
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions dropdown — only visible on hover */}
                {!isEditing && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="p-1 rounded-md hover:bg-muted transition-colors cursor-pointer">
                                <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isOwn ? "end" : "start"} className="w-40">
                                {isOwn && (
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setIsEditing(true);
                                            setEditContent(message.content || "");
                                        }}
                                        className="cursor-pointer text-xs"
                                    >
                                        <Pencil className="w-3.5 h-3.5 mr-2" />
                                        Edit
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={() => onDelete?.(message.id, "me")}
                                    className="cursor-pointer text-xs"
                                >
                                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                                    Delete for me
                                </DropdownMenuItem>
                                {isOwn && (
                                    <DropdownMenuItem
                                        onClick={() => onDelete?.(message.id, "everyone")}
                                        className="cursor-pointer text-xs text-destructive"
                                    >
                                        <CornerUpLeft className="w-3.5 h-3.5 mr-2" />
                                        Unsend
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>

            {/* Full-screen Media Viewer */}
            {message.media && message.media.length > 0 && (
                <PostMediaLightbox
                    media={message.media.map(m => ({
                        id: m.id,
                        url: m.url,
                        type: m.type as "IMAGE" | "VIDEO" | "FILE"
                    }))}
                    currentIndex={lightboxIndex}
                    onIndexChange={setLightboxIndex}
                    isOpen={isLightboxOpen}
                    onClose={setIsLightboxOpen}
                />
            )}
        </div>
    );
}
