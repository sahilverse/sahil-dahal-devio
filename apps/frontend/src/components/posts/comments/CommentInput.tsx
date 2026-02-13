"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useCreateComment, useUpdateComment } from "@/hooks/useComments";
import { ImagePlus, Loader2, Send, X } from "lucide-react";
import UserAvatar from "@/components/navbar/UserAvatar";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";
import { useAuthModal } from "@/contexts/AuthModalContext";

interface CommentInputProps {
    postId: string;
    parentId?: string;
    initialContent?: string;
    isEdit?: boolean;
    commentId?: string;
    onCancel?: () => void;
    onSuccess?: () => void;
}

export function CommentInput({
    postId,
    parentId,
    initialContent = "",
    isEdit,
    commentId,
    onCancel,
    onSuccess
}: CommentInputProps) {
    const { user } = useAppSelector((state) => state.auth);
    const { openLogin } = useAuthModal();
    const [content, setContent] = useState(initialContent);
    const [media, setMedia] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const createCommentMutation = useCreateComment();
    const updateCommentMutation = useUpdateComment();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return openLogin();
        if (!content.trim() && media.length === 0) return;

        if (isEdit && commentId) {
            updateCommentMutation.mutate(
                { commentId, content },
                {
                    onSuccess: () => {
                        onSuccess?.();
                    },
                }
            );
        } else {
            createCommentMutation.mutate(
                { postId, content, parentId, media },
                {
                    onSuccess: () => {
                        setContent("");
                        setMedia([]);
                        onSuccess?.();
                    },
                }
            );
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setMedia((prev) => [...prev, ...newFiles].slice(0, 3)); // Max 3 images as per backend
        }
    };

    const removeFile = (index: number) => {
        setMedia((prev) => prev.filter((_, i) => i !== index));
    };

    if (!user && !parentId) {
        return (
            <div className="bg-muted/10 border border-dashed border-border/50 rounded-xl p-6 text-center">
                <p className="text-muted-foreground mb-4">You need to be logged in to join the discussion.</p>
                <Button onClick={openLogin} variant="outline" className="font-bold border-primary/20 hover:bg-primary/5">
                    Log In to Comment
                </Button>
            </div>
        );
    }

    if (!user) return null;

    return (
        <form onSubmit={handleSubmit} className={cn(
            "space-y-3",
            parentId && "bg-muted/5 p-3 rounded-xl border border-border/30"
        )}>
            <div className="flex gap-3">
                {!parentId && (
                    <div className="shrink-0 mt-1">
                        <UserAvatar user={user} size="sm" />
                    </div>
                )}
                <div className="flex-1 space-y-3">
                    <div className="relative group">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={parentId ? "Write a reply..." : "What are your thoughts?"}
                            className="w-full min-h-[100px] bg-transparent border border-border/50 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none placeholder:text-muted-foreground/50"
                        />

                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                multiple
                                accept="image/*"
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full cursor-pointer"
                                title="Add images"
                            >
                                <ImagePlus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {media.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {media.map((file, index) => (
                                <div key={index} className="relative group rounded-lg overflow-hidden border border-border">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt="upload preview"
                                        className="h-16 w-16 object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="absolute top-1 right-1 bg-background/80 hover:bg-background p-0.5 rounded-full shadow-sm text-destructive cursor-pointer"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-2">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onCancel}
                                className="text-muted-foreground font-bold hover:bg-muted cursor-pointer"
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            size="sm"
                            variant="brand"
                            disabled={createCommentMutation.isPending || updateCommentMutation.isPending || (!content.trim() && media.length === 0)}
                            className="font-bold gap-2 px-4 shadow-soft cursor-pointer"
                        >
                            {createCommentMutation.isPending || updateCommentMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            {isEdit ? "Save Changes" : parentId ? "Reply" : "Post Comment"}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
