"use client";

import { useFetchPosts } from "@/hooks/usePosts";
import PostCard from "./PostCard";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";

interface PostFeedProps {
    userId?: string;
    communityId?: string;
    isCurrentUser?: boolean;
    username?: string;
}

export default function PostFeed({ userId, communityId, isCurrentUser, username }: PostFeedProps) {
    const { user } = useAppSelector((state) => state.auth);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError
    } = useFetchPosts({ userId, communityId, limit: 10 });

    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center p-8 text-destructive">
                Failed to load posts. Please try again.
            </div>
        );
    }

    const posts = data?.pages.flatMap((page) => page.posts) || [];

    if (posts.length === 0) {
        return (
            <div className="p-16 border rounded-xl bg-card border-dashed text-center space-y-4">
                <div className="space-y-2">
                    <p className="text-muted-foreground">
                        {isCurrentUser
                            ? "You haven't posted anything yet"
                            : `u/${username} hasn't posted anything yet`}
                    </p>
                    {isCurrentUser && (
                        <p className="text-sm text-muted-foreground/70">
                            Share your thoughts, projects, or questions with the community
                        </p>
                    )}
                </div>
                {isCurrentUser && (
                    <Button variant="brand" className="cursor-pointer" asChild>
                        <Link href="/create">
                            <Plus className="size-4" />
                            Create Post
                        </Link>
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    isOwner={user?.id === post.author.id}
                />
            ))}

            {/* Infinite Scroll Trigger */}
            <div ref={ref} className="h-10 flex justify-center items-center">
                {isFetchingNextPage && (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                )}
            </div>
        </div>
    );
}
