"use client";

import { useState } from "react";
import { CourseComment } from "@/types/course";
import { formatDistanceToNow } from "date-fns";
import UserAvatar from "@/components/navbar/UserAvatar";
import Link from "next/link";
import {
    ArrowBigUp,
    ArrowBigDown,
    ChevronDown,
    ChevronUp,
    MessageSquare,
    MoreHorizontal,
    Smile,
    Reply as ReplyIcon,
    Trash2,
    Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatCompactNumber } from "@/lib/utils";
import { useVoteLessonComment, useFetchLessonReplies, useDeleteLessonComment } from "@/hooks/useLessonComments";
import { useAppSelector } from "@/store/hooks";
import { DiscussionInput } from "./DiscussionInput";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDeleteModal } from "@/components/ui/modals/ConfirmDeleteModal";
import { MarkdownContent } from "@/components/ui/MarkdownContent";

interface DiscussionItemProps {
    comment: CourseComment;
    lessonId: string;
    isReply?: boolean;
}

export function DiscussionItem({
    comment,
    lessonId,
    isReply = false
}: DiscussionItemProps) {
    const { user } = useAppSelector((state) => state.auth);
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const voteMutation = useVoteLessonComment(lessonId);
    const deleteMutation = useDeleteLessonComment(lessonId);

    const {
        data: repliesData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useFetchLessonReplies(lessonId, comment.id);

    const handleVote = (type: "UP" | "DOWN") => {
        if (!user) return;
        const newType = comment.userVote === type ? null : type;
        voteMutation.mutate({ commentId: comment.id, type: newType });
    };

    const handleDelete = () => {
        deleteMutation.mutate(
            {
                commentId: comment.id,
                parentId: comment.parentId || null as any
            },
            {
                onSuccess: () => setIsDeleteModalOpen(false),
            }
        );
    };

    const isAuthor = user?.id === comment.user.id;
    const isDeleted = !!comment.deletedAt;

    return (
        <div
            id={`comment-${comment.id}`}
            className={cn(
                "group relative transition-all duration-500",
                isReply ? "mt-4 ml-6 pl-6 border-l border-white/5" : "bg-white/[0.02] rounded-[32px] p-6 border border-white/5 shadow-xl shadow-black/10"
            )}
        >
            <div className="flex items-start gap-4">
                <Link href={`/user/${comment.user.username}`} className="shrink-0 mt-1">
                    <UserAvatar user={comment.user} size={isReply ? "xs" : "sm"} />
                </Link>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5 text-xs">
                            <Link href={`/user/${comment.user.username}`} className="font-black text-foreground/90 hover:text-primary transition-colors tracking-tight">
                                u/{comment.user.username}
                            </Link>
                            <span className="text-white/10">•</span>
                            <span className="text-muted-foreground/40 font-bold uppercase text-[10px] tracking-widest">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                            {isAuthor && !isReply && (
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg font-black text-[9px] uppercase tracking-widest border border-primary/20">
                                    Author
                                </span>
                            )}
                        </div>

                        {!isDeleted && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5">
                                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-popover border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl">
                                    {isAuthor && (
                                        <>
                                            <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer gap-2 py-3 rounded-xl focus:bg-white/5">
                                                <Edit3 className="size-4" /> Edit Comment
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive cursor-pointer gap-2 py-3 rounded-xl focus:bg-destructive/10" onClick={() => setIsDeleteModalOpen(true)}>
                                                <Trash2 className="size-4" /> Delete Permanently
                                            </DropdownMenuItem>

                                        </>
                                    )}
                                    {!isAuthor && (
                                        <DropdownMenuItem className="cursor-pointer gap-2 py-3 rounded-xl focus:bg-white/5">
                                            <Smile className="size-4" /> React with Emoji
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    <div className="prose prose-invert prose-sm max-w-none text-foreground/80 leading-relaxed font-medium">
                        {isDeleted ? (
                            <div className="italic text-muted-foreground/30 bg-white/[0.02] px-4 py-2 rounded-2xl w-fit text-[13px] border border-white/5 border-dashed">
                                [This comment has been deleted]
                            </div>

                        ) : isEditing ? (
                            <DiscussionInput
                                lessonId={lessonId}
                                parentId={comment.parentId || undefined}
                                initialContent={comment.content}
                                onCancel={() => setIsEditing(false)}
                                onSuccess={() => setIsEditing(false)}
                                isEdit
                                commentId={comment.id}
                            />
                        ) : (
                            <MarkdownContent content={comment.content} />
                        )}
                    </div>

                    {!isDeleted && (
                        <div className="flex items-center gap-6 mt-4">
                            <div className="flex items-center bg-white/[0.03] rounded-2xl border border-white/5 h-9 px-1.5 shadow-inner">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleVote("UP")}
                                    className={cn(
                                        "h-6 w-6 rounded-lg transition-all cursor-pointer",
                                        comment.userVote === "UP" ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-white/5"
                                    )}
                                >
                                    <ArrowBigUp className={cn("h-4 w-4", comment.userVote === "UP" && "fill-current")} />
                                </Button>
                                <span className={cn(
                                    "text-[11px] font-black px-2 mt-px tabular-nums",
                                    comment.userVote === "UP" ? "text-primary" : comment.userVote === "DOWN" ? "text-destructive" : "text-muted-foreground/60"
                                )}>
                                    {formatCompactNumber(comment.upvotes - comment.downvotes)}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleVote("DOWN")}
                                    className={cn(
                                        "h-6 w-6 rounded-lg transition-all cursor-pointer",
                                        comment.userVote === "DOWN" ? "text-destructive bg-destructive/10" : "text-muted-foreground hover:bg-white/5"
                                    )}
                                >
                                    <ArrowBigDown className={cn("h-4 w-4", comment.userVote === "DOWN" && "fill-current")} />
                                </Button>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsReplying(!isReplying)}
                                className="h-9 gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all hover:bg-primary/5 rounded-2xl cursor-pointer"
                            >
                                <ReplyIcon className="h-3.5 w-3.5 translate-y-[1px]" />
                                Reply
                            </Button>

                            {comment.replyCount > 0 && !showReplies && (
                                <button
                                    onClick={() => setShowReplies(true)}
                                    className="h-9 gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-all flex items-center cursor-pointer"
                                >
                                    <ChevronDown className="h-3.5 w-3.5" />
                                    {comment.replyCount} Replies
                                </button>
                            )}

                        </div>
                    )}

                    {isReplying && (
                        <div className="mt-6 pl-6 border-l border-primary/20">
                            <DiscussionInput
                                lessonId={lessonId}
                                parentId={comment.id}
                                placeholder={`Replying to u/${comment.user.username}...`}
                                onCancel={() => setIsReplying(false)}
                                onSuccess={() => {
                                    setIsReplying(false);
                                    setShowReplies(true);
                                }}
                            />
                        </div>
                    )}

                    {showReplies && (
                        <div className="mt-4 space-y-4">
                            {(repliesData?.pages as { items: CourseComment[] }[])?.flatMap(page => page.items).map(reply => (
                                <DiscussionItem
                                    key={reply.id}
                                    comment={reply}
                                    isReply
                                    lessonId={lessonId}
                                />
                            ))}

                            <div className="flex items-center gap-4 mt-2">
                                {hasNextPage && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => fetchNextPage()}
                                        disabled={isFetchingNextPage}
                                        className="h-9 gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground cursor-pointer rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5"
                                    >
                                        <ChevronDown className="h-3.5 w-3.5" />
                                        Continue Thread
                                    </Button>
                                )}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowReplies(false)}
                                    className="h-9 gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground cursor-pointer rounded-2xl hover:bg-white/5"
                                >
                                    <ChevronUp className="h-3.5 w-3.5" />
                                    Collapse
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Comment"
                description="Are you sure you want to delete this comment? This action cannot be undone."
                isPending={deleteMutation.isPending}
            />

        </div>
    );
}
