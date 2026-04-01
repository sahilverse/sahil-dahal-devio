"use client";

import { useState, useRef, useEffect } from "react";
import { useCreateLessonComment, useUpdateLessonComment } from "@/hooks/useLessonComments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import UserAvatar from "@/components/navbar/UserAvatar";
import { useAppSelector } from "@/store/hooks";

interface DiscussionInputProps {
    lessonId: string;
    parentId?: string;
    initialContent?: string;
    isEdit?: boolean;
    commentId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    placeholder?: string;
}

export function DiscussionInput({
    lessonId,
    parentId,
    initialContent = "",
    isEdit = false,
    commentId,
    onSuccess,
    onCancel,
    placeholder = "Share your thoughts or ask a question..."
}: DiscussionInputProps) {
    const [content, setContent] = useState(initialContent);
    const { user } = useAppSelector((state) => state.auth);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const createMutation = useCreateLessonComment(lessonId);
    const updateMutation = useUpdateLessonComment(lessonId);

    const isPending = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [content]);

    const handleSubmit = async () => {
        if (!content.trim() || isPending) return;

        if (isEdit && commentId) {
            updateMutation.mutate(
                { commentId, content },
                {
                    onSuccess: () => {
                        setContent("");
                        onSuccess?.();
                    },
                }
            );
        } else {
            createMutation.mutate(
                { content, parentId },
                {
                    onSuccess: () => {
                        setContent("");
                        onSuccess?.();
                    },
                }
            );
        }
    };

    if (!user) return null;

    return (
        <div className="flex gap-4 group">
            {!isEdit && (
                <div className="shrink-0 mt-1">
                    <UserAvatar user={user} size="sm" />
                </div>
            )}
            <div className="flex-1 space-y-3">
                <div className="relative">
                    <Textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={placeholder}
                        className="min-h-[100px] w-full resize-none bg-white/[0.03] border-white/10 rounded-2xl p-4 text-sm focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-muted-foreground/30"
                        disabled={isPending}
                    />
                </div>
                <div className="flex items-center justify-end gap-3">
                    {Number(onCancel) || onCancel ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onCancel}
                            className="rounded-xl font-bold text-[11px] uppercase tracking-widest h-10 px-6 cursor-pointer"
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                    ) : null}
                    <Button
                        onClick={handleSubmit}
                        disabled={!content.trim() || isPending}
                        className="rounded-xl font-bold text-[11px] uppercase tracking-widest h-10 px-6 gap-2 cursor-pointer shadow-lg shadow-primary/20"
                    >
                        {isPending ? (
                            <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                            <Send className="size-3.5" />
                        )}
                        {isEdit ? "Update" : parentId ? "Reply" : "Post"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
