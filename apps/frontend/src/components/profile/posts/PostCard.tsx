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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { formatCompactNumber } from "@/lib/utils";


interface PostCardProps {
    post: PostResponseDto;
    isOwner?: boolean;
}

export default function PostCard({ post, isOwner }: PostCardProps) {
    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-border/80 transition-colors p-3">
            {/* Header */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                {post.community ? (
                    <>
                        <Link href={`/community/${post.community.name}`} className="font-bold text-foreground hover:underline flex items-center gap-1">
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
                            <span className="text-muted-foreground">Posted by</span>
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
                        <Link href={`/user/${post.author.username}`} className="font-bold text-foreground hover:underline">
                            u/{post.author.username}
                        </Link>
                    </div>
                )}
                <span>•</span>
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>

                <div className="flex-1" />

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
                                    <Bookmark className="h-4 w-4" /> Save
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer">
                                    <Pencil className="h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer">
                                    <Pin className="h-4 w-4" /> Pin to Profile
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
                                <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive cursor-pointer">
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
            <h3 className="text-lg font-bold leading-snug mb-3 text-foreground">
                {post.title}
            </h3>

            {/* Markdown Content (Preview) */}
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground line-clamp-4 mb-4">
                <Markdown>{post.content}</Markdown>
            </div>

            {/* Media Preview (If any) */}
            {post.media && post.media.length > 0 && post.media[0].type === 'IMAGE' && (
                <div className="rounded-lg overflow-hidden border border-border bg-muted/50 max-h-[500px] flex justify-center mb-4">
                    <img
                        src={post.media[0].url}
                        alt="Post Media"
                        className="object-contain max-h-[500px] w-full"
                    />
                </div>
            )}

            {/* Footer Actions (Pills) */}
            <div className="flex items-center gap-2">
                {/* Vote Pill */}
                <div className="flex items-center bg-muted/50 rounded-full border border-border/50 overflow-hidden h-8">
                    <Button variant="ghost" size="icon" className="h-full w-8 hover:text-orange-500 hover:bg-orange-500/10 rounded-none">
                        <ArrowBigUp className="h-5 w-5" />
                    </Button>
                    <span className="text-xs font-bold text-foreground px-1 min-w-[20px] text-center">
                        {formatCompactNumber(post.upvotes - post.downvotes)}
                    </span>
                    <Button variant="ghost" size="icon" className="h-full w-8 hover:text-blue-500 hover:bg-blue-500/10 rounded-none">
                        <ArrowBigDown className="h-5 w-5" />
                    </Button>
                </div>

                {/* Comment Pill */}
                <Button variant="ghost" size="sm" className="bg-muted/50 rounded-full border border-border/50 h-8 gap-2 px-3 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-xs font-semibold">{formatCompactNumber(post.commentCount)} Comments</span>
                </Button>

                {/* Save Pill */}
                <Button variant="ghost" size="sm" className="bg-muted/50 rounded-full border border-border/50 h-8 gap-2 px-3 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Bookmark className="h-4 w-4" />
                    <span className="text-xs font-semibold">Save</span>
                </Button>

                <div className="flex-1" />
            </div>
        </div>
    );
}
