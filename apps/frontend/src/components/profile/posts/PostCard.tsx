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
    Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import Markdown from "react-markdown";
import Link from "next/link";
import UserAvatar from "@/components/navbar/UserAvatar";
import PostMediaCarousel from "./PostMediaCarousel";
import { formatCompactNumber, cn } from "@/lib/utils";
import { useVotePost, useSavePost, usePinPost, useDeletePost } from "@/hooks/usePosts";
import { useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import { useState } from "react";
import { ConfirmDeleteModal } from "@/components/ui/modals/ConfirmDeleteModal";


interface PostCardProps {
    post: PostResponseDto;
    isOwner?: boolean;
}

export default function PostCard({ post, isOwner }: PostCardProps) {
    const { user } = useAppSelector((state) => state.auth);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const voteMutation = useVotePost();
    const saveMutation = useSavePost();
    const pinMutation = usePinPost();
    const deleteMutation = useDeletePost();

    const handleVote = (type: "UP" | "DOWN") => {
        if (!user) {
            toast.error("Please login to vote");
            return;
        }
        const newType = post.userVote === type ? null : type;
        voteMutation.mutate({ postId: post.id, type: newType });
    };

    const handleSave = () => {
        if (!user) {
            toast.error("Please login to save posts");
            return;
        }
        saveMutation.mutate(post.id);
    };

    const handlePin = () => {
        pinMutation.mutate({ postId: post.id, isPinned: !post.isPinned });
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                {post.community ? (
                    <>
                        <Link href={`/d/${post.community.name}`} className="text-[14px] text-foreground hover:underline flex items-center gap-1">
                            <UserAvatar
                                user={{
                                    username: post.community.name,
                                    avatarUrl: post.community.iconUrl
                                }}
                                size="sm"
                            />
                            d/{post.community.name}
                        </Link>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                            <Link href={`/user/${post.author.username}`} className="hover:underline text-foreground">
                                u/{post.author.username}
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-2">
                        <UserAvatar
                            user={post.author}
                            size="sm"
                        />
                        <Link href={`/user/${post.author.username}`} className="text-[14px] text-foreground hover:underline">
                            u/{post.author.username}
                        </Link>
                    </div>
                )}
                <span>•</span>
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>

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
                        {isOwner ? (
                            <>
                                <DropdownMenuItem className="gap-2 cursor-pointer">
                                    <Pencil className="h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="gap-2 cursor-pointer"
                                    onClick={handlePin}
                                    disabled={pinMutation.isPending}
                                >
                                    <Pin className={cn("h-4 w-4", post.isPinned && "fill-current")} />
                                    {post.isPinned ? "Unpin from Profile" : "Pin to Profile"}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer">
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

            {/* Title */}
            <p className="text-lg font-semibold leading-snug text-foreground mb-2">
                {post.title}
            </p>

            {/* Markdown Content (Preview) */}
            {post.content && <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground line-clamp-4 mb-2">
                <Markdown>{post.content}</Markdown>
            </div>}

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
                            "h-full w-8 rounded-none transition-colors",
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
                            "h-full w-8 rounded-none transition-colors",
                            post.userVote === "DOWN"
                                ? "text-brand-primary bg-brand-primary/10"
                                : "hover:text-brand-primary hover:bg-brand-primary/10"
                        )}
                    >
                        <ArrowBigDown className={cn("h-5 w-5", post.userVote === "DOWN" && "fill-current")} />
                    </Button>
                </div>

                {/* Comment Pill */}
                <Button variant="ghost" size="sm" className="bg-muted/50 rounded-full border border-border/50 h-8 gap-2 px-3 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-xs font-semibold">{formatCompactNumber(post.commentCount)} Comments</span>
                </Button>

                {/* Save Pill */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className={cn(
                        "bg-muted/50 rounded-full border border-border/50 h-8 gap-2 px-3 transition-colors",
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
