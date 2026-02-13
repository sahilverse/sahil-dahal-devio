"use client";

import { useFetchPost } from "@/hooks/usePosts";
import PostCard from "@/components/profile/posts/PostCard";
import { Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";

export default function PostPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { user } = useAppSelector((state) => state.auth);

    const { data: post, isLoading, error } = useFetchPost(id);

    if (isLoading) {
        return (
            <div className="h-[60vh] w-full flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary mb-4" />
                <p className="text-sm text-muted-foreground font-medium">Loading post...</p>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="h-[60vh] w-full flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-rose-500" />
                </div>
                <h2 className="text-xl font-bold mb-2">Post not found</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                    The post you are looking for might have been deleted or the link is incorrect.
                </p>
                <Button
                    onClick={() => router.push("/")}
                    className="font-bold"
                >
                    Go Back Home
                </Button>
            </div>
        );
    }

    const isOwner = user?.id === post.author.id;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-muted"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">Post</h1>
            </div>

            <PostCard
                post={post}
                isOwner={isOwner}
                showComments={true}
            />
        </div>
    );
}
