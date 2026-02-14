"use client";

import { CommentResponseDto } from "@/types/comment";
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
    CheckCircle2,

} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Markdown from "react-markdown";
import { useVoteComment, useFetchReplies, useDeleteComment, useAcceptAnswer, useUnacceptAnswer } from "@/hooks/useComments";
import { useAppSelector } from "@/store/hooks";
import { CommentInput } from "./CommentInput";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { ConfirmDeleteModal } from "@/components/ui/modals/ConfirmDeleteModal";
import PostMediaCarousel from "@/components/profile/posts/PostMediaCarousel";
import { MarkdownContent } from "@/components/ui/MarkdownContent";

interface CommentItemProps {
    comment: CommentResponseDto;
    isReply?: boolean;
    isAccepted?: boolean;
    postAuthorId?: string;
    isQuestionPost?: boolean;
    acceptedAnswerId?: string;
}

export function CommentItem({
    comment,
    isReply,
    isAccepted,
    postAuthorId,
    isQuestionPost,
    acceptedAnswerId
}: CommentItemProps) {
    const { user } = useAppSelector((state) => state.auth);
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isHighlighted, setIsHighlighted] = useState(false);

    const voteMutation = useVoteComment();

    useState(() => {
        if (typeof window !== "undefined" && window.location.hash === `#comment-${comment.id}`) {
            setIsHighlighted(true);
            setTimeout(() => setIsHighlighted(false), 3000);
        }
    });
    const deleteMutation = useDeleteComment();
    const acceptMutation = useAcceptAnswer();
    const unacceptMutation = useUnacceptAnswer();
    const { openLogin } = useAuthModal();

    const {
        data: repliesData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useFetchReplies(comment.id, { limit: 5 });

    const handleVote = (type: "UP" | "DOWN") => {
        if (!user) return openLogin();
        const newType = comment.userVote === type ? null : type;
        voteMutation.mutate({ commentId: comment.id, type: newType });
    };

    const handleDelete = () => {
        deleteMutation.mutate(
            {
                commentId: comment.id,
                postId: comment.postId,
                parentId: comment.parentId
            },
            {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                },
            }
        );
    };

    const handleAccept = () => {
        acceptMutation.mutate({ postId: comment.postId, commentId: comment.id });
    };

    const handleUnaccept = () => {
        unacceptMutation.mutate({ postId: comment.postId });
    };

    const isAuthor = user?.id === comment.author.id;
    const isPostAuthor = user?.id === postAuthorId;
    // Post author can remove any comment except the accepted answer
    const canRemove = isPostAuthor && !isAuthor && !isAccepted;

    const canAccept = isQuestionPost && isPostAuthor && !comment.parentId && !isAccepted;
    const canUnaccept = isQuestionPost && isPostAuthor && isAccepted;

    return (
        <div
            id={`comment-${comment.id}`}
            className={cn(
                "group relative transition-all duration-1000 scroll-mt-24",
                isReply ? "mt-4 ml-4 pl-4 border-l-2 border-border/30" : "bg-card/30 rounded-xl p-4 border border-border/50",
                isAccepted && "border-green-500/30 bg-green-500/5 ring-1 ring-green-500/10",
                isHighlighted && "ring-2 ring-brand-primary bg-brand-primary/5 shadow-lg shadow-brand-primary/10"
            )}
        >
            {isAccepted && (
                <div className="absolute -left-3 top-4 bg-background p-1 rounded-full text-green-500 border border-green-500/50 shadow-sm z-10">
                    <CheckCircle2 className="h-4 w-4 fill-current" />
                </div>
            )}

            <div className="flex items-start gap-3">
                <Link href={`/user/${comment.author.username}`} className="shrink-0 mt-1">
                    <UserAvatar user={comment.author} size="sm" />
                </Link>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-xs">
                            <Link href={`/user/${comment.author.username}`} className="font-bold text-foreground hover:underline">
                                u/{comment.author.username}
                            </Link>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="text-muted-foreground/60">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                            {isAuthor && (
                                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider">
                                    Author
                                </span>
                            )}
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {isAuthor && (
                                    <>
                                        <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer">
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => setIsDeleteModalOpen(true)}>
                                            Delete
                                        </DropdownMenuItem>
                                    </>
                                )}
                                {canAccept && (
                                    <DropdownMenuItem onClick={handleAccept} className="cursor-pointer">
                                        Mark as Solution
                                    </DropdownMenuItem>
                                )}
                                {canUnaccept && (
                                    <DropdownMenuItem onClick={handleUnaccept} className="cursor-pointer">
                                        Unmark Solution
                                    </DropdownMenuItem>
                                )}
                                {canRemove && (
                                    <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => setIsDeleteModalOpen(true)}>
                                        Remove
                                    </DropdownMenuItem>
                                )}
                                {!isAuthor && (
                                    <DropdownMenuItem className="text-destructive cursor-pointer">
                                        Report
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed break-words">
                        {comment.isDeleted ? (
                            <p className="italic text-muted-foreground/50 bg-muted/20 px-3 py-1 rounded-lg w-fit text-[13px]">
                                [This comment was deleted]
                            </p>
                        ) : isEditing ? (
                            <CommentInput
                                postId={comment.postId}
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

                    {comment.media && comment.media.length > 0 && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-border bg-muted/5 max-w-[400px]">
                            <PostMediaCarousel media={comment.media} />
                        </div>
                    )}

                    {!comment.isDeleted && (
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center bg-muted/30 rounded-full border border-border/50 h-7 px-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleVote("UP")}
                                    className={cn(
                                        "h-5 w-5 rounded-full transition-colors hover:bg-orange-500/10 cursor-pointer",
                                        comment.userVote === "UP" ? "text-orange-500" : "text-muted-foreground"
                                    )}
                                >
                                    <ArrowBigUp className={cn("h-4 w-4", comment.userVote === "UP" && "fill-current")} />
                                </Button>
                                <span className={cn(
                                    "text-xs font-bold px-1 min-w-[16px] text-center",
                                    comment.userVote === "UP" ? "text-orange-500" : comment.userVote === "DOWN" ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {comment.voteCount}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleVote("DOWN")}
                                    className={cn(
                                        "h-5 w-5 rounded-full transition-colors hover:bg-primary/10 cursor-pointer",
                                        comment.userVote === "DOWN" ? "text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    <ArrowBigDown className={cn("h-4 w-4", comment.userVote === "DOWN" && "fill-current")} />
                                </Button>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsReplying(!isReplying)}
                                className="h-7 gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full cursor-pointer"
                            >
                                <MessageSquare className="h-3.5 w-3.5" />
                                Reply
                            </Button>
                        </div>
                    )}

                    {isReplying && (
                        <div className="mt-4">
                            <CommentInput
                                postId={comment.postId}
                                parentId={comment.id}
                                onCancel={() => setIsReplying(false)}
                                onSuccess={() => {
                                    setIsReplying(false);
                                    setShowReplies(true);
                                }}
                            />
                        </div>
                    )}

                    {comment.replyCount > 0 && !showReplies && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowReplies(true)}
                            className="mt-3 h-8 gap-2 text-xs font-bold text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg cursor-pointer"
                        >
                            <ChevronDown className="h-4 w-4" />
                            Show {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                        </Button>
                    )}

                    {showReplies && (
                        <div className="mt-2 space-y-4">
                            {repliesData?.pages.flatMap(page => page.replies).map(reply => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    isReply
                                    postAuthorId={postAuthorId}
                                    isQuestionPost={isQuestionPost}
                                />
                            ))}

                            {hasNextPage && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    className="h-8 gap-2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                    Load more replies
                                </Button>
                            )}

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowReplies(false)}
                                className="h-8 gap-2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                <ChevronUp className="h-4 w-4" />
                                Hide replies
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title={canRemove ? "Remove Comment" : "Delete Comment"}
                description={canRemove
                    ? "Are you sure you want to remove this comment from your post? This action cannot be undone."
                    : "Are you sure you want to delete this comment? This action cannot be undone."
                }
                isPending={deleteMutation.isPending}
            />
        </div>
    );
}
