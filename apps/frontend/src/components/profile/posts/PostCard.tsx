"use client";

import { PostResponseDto } from "@/types/post";
import { formatDistanceToNow } from "date-fns";
import {
    ArrowBigUp,
    ArrowBigDown,
    MessageSquare,
    MoreHorizontal,
    Flag,
    Bookmark,
    Trash2,
    EyeOff,
    Pin,
    Pencil,
    Eye,
    HelpCircle,
    Coins,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserAvatar from "@/components/navbar/UserAvatar";
import PostMediaCarousel from "./PostMediaCarousel";
import { cn, formatCompactNumber } from "@/lib/utils";
import { useVotePost, useSavePost, usePinPost, useDeletePost, useUpdatePost } from "@/hooks/usePosts";
import { useAppSelector } from "@/store/hooks";
import { useState, useEffect, useRef } from "react";
import { ConfirmDeleteModal } from "@/components/ui/modals/ConfirmDeleteModal";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { CommentSection } from "@/components/posts/comments/CommentSection";


interface PostCardProps {
    post: PostResponseDto;
    isOwner?: boolean;
    showComments?: boolean;
    onToggleComments?: () => void;
}

export default function PostCard({ post, isOwner, showComments: externalShowComments, onToggleComments }: PostCardProps) {
    const { user } = useAppSelector((state) => state.auth);
    const pathname = usePathname();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [canExpand, setCanExpand] = useState(false);
    const [localShowComments, setLocalShowComments] = useState(false);
    
    const isCommentsVisible = externalShowComments !== undefined ? externalShowComments : localShowComments;
    const toggleComments = onToggleComments || (() => setLocalShowComments(!localShowComments));

    const containerRef = useRef<HTMLDivElement>(null);

    const voteMutation = useVotePost();
    const saveMutation = useSavePost();
    const pinMutation = usePinPost();
    const deleteMutation = useDeletePost();
    const updateMutation = useUpdatePost();

    const { openLogin } = useAuthModal();

    useEffect(() => {
        const checkOverflow = () => {
            if (containerRef.current && !isExpanded) {
                const isTruncated = containerRef.current.scrollHeight > containerRef.current.clientHeight;
                setCanExpand(isTruncated);
            }
        };

        checkOverflow();
        const timeoutId = setTimeout(checkOverflow, 50);

        window.addEventListener("resize", checkOverflow);
        return () => {
            window.removeEventListener("resize", checkOverflow);
            clearTimeout(timeoutId);
        };
    }, [post.content, isExpanded]);

    const handleVote = (type: "UP" | "DOWN") => {
        if (!user) {
            openLogin();
            return;
        }
        const newType = post.userVote === type ? null : type;
        voteMutation.mutate({ postId: post.id, type: newType });
    };

    const handleSave = () => {
        if (!user) {
            openLogin();
            return;
        }
        saveMutation.mutate(post.id);
    };

    const handlePin = () => {
        pinMutation.mutate({ postId: post.id, isPinned: !post.isPinned });
    };

    const handleToggleVisibility = () => {
        const newVisibility = post.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
        updateMutation.mutate({
            postId: post.id,
            data: { visibility: newVisibility }
        });
    };

    const handleDelete = () => {
        deleteMutation.mutate(post.id, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
            }
        });
    };

    return (
        <div className={cn(
            "bg-card border border-border rounded-xl overflow-hidden hover:border-border/80 transition-colors p-3 cursor-pointer",
            post.isPinned && "border-primary/30 ring-1 ring-primary/10"
        )}>
            {/* Header */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                {post.community ? (
                    <div className="flex items-center gap-2">
                        <Link href={`/d/${post.community.name}`} className="shrink-0">
                            <UserAvatar
                                user={{
                                    username: post.community.name,
                                    avatarUrl: post.community.iconUrl
                                }}
                                size="sm"
                            />
                        </Link>
                        <div className="flex flex-col space-y-1">
                            <div className="flex items-center gap-1.5">
                                <Link href={`/d/${post.community.name}`} className="text-[14px] font-bold text-foreground hover:underline leading-none">
                                    d/{post.community.name}
                                </Link>
                                <span className="text-[10px] text-muted-foreground/40">•</span>
                                <span className="text-[12px] font-medium text-muted-foreground/60 leading-none">
                                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                            <div className="text-[12px] font-medium text-muted-foreground/60">
                                <Link href={`/user/${post.author.username}`} className="hover:text-foreground/40 transition-colors">
                                    u/{post.author.username}
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Link href={`/user/${post.author.username}`} className="shrink-0">
                            <UserAvatar
                                user={post.author}
                                size="sm"
                            />
                        </Link>
                        <div className="flex items-center gap-1.5">
                            <Link href={`/user/${post.author.username}`} className="text-[14px] font-bold text-foreground hover:underline leading-none">
                                u/{post.author.username}
                            </Link>
                            <span className="text-[10px] text-muted-foreground/40">•</span>
                            <span className="text-[12px] font-medium text-muted-foreground/60">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex-1" />

                {post.isPinned && (
                    <div className="flex items-center text-brand font-medium bg-transparent rounded-full whitespace-nowrap">
                        <Pin className="h-3 w-3 fill-current rotate-45" />

                    </div>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground rounded-full hover:bg-muted -mr-2">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card">
                        {post.canManage ? (
                            <>
                                <DropdownMenuItem className="gap-2 cursor-pointer">
                                    <Pencil className="h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                {user && pathname?.startsWith(`/user/${user.username}`) && isOwner && (
                                    <DropdownMenuItem
                                        className="gap-2 cursor-pointer"
                                        onClick={handlePin}
                                        disabled={pinMutation.isPending}
                                    >
                                        <Pin className={cn("h-4 w-4", post.isPinned && "fill-current")} />
                                        {post.isPinned ? "Unpin from Profile" : "Pin to Profile"}
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    className="gap-2 cursor-pointer"
                                    onClick={handleToggleVisibility}
                                    disabled={updateMutation.isPending}
                                >
                                    {post.visibility === "PUBLIC" ? (
                                        <>
                                            <EyeOff className="h-4 w-4" /> Make Private
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="h-4 w-4" /> Make Public
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    disabled={deleteMutation.isPending}
                                >
                                    <Trash2 className="h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </>
                        ) : (
                            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive cursor-pointer">
                                <Flag className="h-4 w-4" /> Report
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Question / Bounty / Solved Badges */}
            {post.type === "QUESTION" && (
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20 text-[11px] font-bold uppercase tracking-wider">
                        <HelpCircle className="h-3 w-3" /> Question
                    </span>
                    {post.bountyAmount && post.bountyAmount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[11px] font-bold uppercase tracking-wider">
                            <Coins className="h-3 w-3" /> {post.bountyAmount} Bounty
                        </span>
                    )}
                    {post.acceptedAnswerId && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-[11px] font-bold uppercase tracking-wider">
                            <CheckCircle2 className="h-3 w-3" /> Solved
                        </span>
                    )}
                </div>
            )}

            {/* Title */}
            <p className="text-lg font-semibold leading-snug text-foreground mb-2">
                {post.title}
            </p>

            {/* Markdown Content (Preview) */}
            {post.content && (
                <div className="relative mb-2">
                    <div
                        ref={containerRef}
                        className={cn(
                            "prose prose-sm dark:prose-invert max-w-none text-muted-foreground transition-all duration-300 prose-pre:bg-transparent prose-pre:p-0 prose-code:bg-transparent prose-code:p-0",
                            !isExpanded && "line-clamp-6 overflow-hidden"
                        )}
                    >
                        <MarkdownContent content={post.content} />
                    </div>
                    {canExpand && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className="text-[12px] font-bold text-brand-primary hover:text-brand-primary/80 transition-colors mt-2 cursor-pointer flex items-center gap-1"
                        >
                            {isExpanded ? "Show less" : "Read more"}
                        </button>
                    )}
                </div>
            )}

            {/* Link Preview */}
            {post.linkUrl && (
                <div className="mb-3">
                    <a
                        href={post.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1.5 bg-primary/5 border border-primary/10 rounded-lg px-3 py-2 w-fit transition-all hover:bg-primary/10"
                    >
                        <Eye className="h-4 w-4" />
                        <span className="truncate max-w-[300px]">{post.linkUrl}</span>
                    </a>
                </div>
            )}

            {/* Topics Preview */}
            {post.topics && post.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {post.topics.map((topic) => (
                        <Link
                            href={`/t/${topic.name}`}
                            key={topic.id}
                            className="group flex items-center gap-0 px-2.5 py-1 rounded-full bg-muted/30 border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                        >
                            <span className="text-[10px] font-bold text-primary/60 group-hover:text-primary transition-colors">
                                t/
                            </span>
                            <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                                {topic.name}
                            </span>
                        </Link>
                    ))}
                </div>
            )}

            {/* Media Preview  */}
            {post.media && post.media.length > 0 && post.media[0].type === 'IMAGE' && (
                <div className="rounded-lg overflow-hidden border border-border bg-muted/50 max-h-[500px] flex justify-center mb-4">
                    <PostMediaCarousel media={post.media} />
                </div>
            )}

            {/* Footer Actions (Pills) */}
            <div className="flex items-center gap-2">
                {/* Vote Pill */}
                <div className="flex items-center bg-muted/50 rounded-full border border-border/50 overflow-hidden h-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleVote("UP")}
                        disabled={voteMutation.isPending}
                        className={cn(
                            "h-full w-8 rounded-none transition-colors cursor-pointer",
                            post.userVote === "UP"
                                ? "text-orange-500 bg-orange-500/10"
                                : "hover:text-orange-500 hover:bg-orange-500/10"
                        )}
                    >
                        <ArrowBigUp className={cn("h-5 w-5", post.userVote === "UP" && "fill-current")} />
                    </Button>
                    <span className={cn(
                        "text-xs font-bold px-1 min-w-[20px] text-center",
                        post.userVote === "UP" ? "text-orange-500" : post.userVote === "DOWN" ? "text-brand-primary" : "text-foreground"
                    )}>
                        {formatCompactNumber(post.voteCount)}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleVote("DOWN")}
                        disabled={voteMutation.isPending}
                        className={cn(
                            "h-full w-8 rounded-none transition-colors cursor-pointer",
                            post.userVote === "DOWN"
                                ? "text-brand-primary bg-brand-primary/10"
                                : "hover:text-brand-primary hover:bg-brand-primary/10"
                        )}
                    >
                        <ArrowBigDown className={cn("h-5 w-5", post.userVote === "DOWN" && "fill-current")} />
                    </Button>
                </div>

                {/* Comment Pill */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleComments}
                    className={cn(
                        "bg-muted/50 rounded-full border border-border/50 h-8 gap-2 px-3 transition-colors cursor-pointer",
                        isCommentsVisible ? "text-primary bg-primary/10 border-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                >
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-xs font-medium">{formatCompactNumber(post.commentCount)}</span>
                </Button>

                {/* Save Pill */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className={cn(
                        "bg-muted/50 rounded-full border border-border/50 h-8 gap-2 px-3 transition-colors cursor-pointer",
                        post.isSaved
                            ? "text-primary bg-primary/10 border-primary/20"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                >
                    <Bookmark className={cn("h-4 w-4", post.isSaved && "fill-current")} />
                    <span className="text-xs font-semibold">{post.isSaved ? "Saved" : "Save"}</span>
                </Button>

                <div className="flex-1" />
            </div>

            {isCommentsVisible && (
                <CommentSection
                    postId={post.id}
                    commentCount={post.commentCount}
                    postAuthorId={post.author.id}
                    isQuestionPost={post.type === "QUESTION"}
                    acceptedAnswerId={post.acceptedAnswerId}
                />
            )}

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Post"
                description="Are you sure you want to delete this post? This action cannot be undone."
                isPending={deleteMutation.isPending}
            />
        </div>
    );
}
