"use client";

import { useFetchComments } from "@/hooks/useComments";
import { GetCommentsParams } from "@/types/comment";
import { useState } from "react";
import { CommentItem } from "./CommentItem";
import { CommentInput } from "./CommentInput";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare } from "lucide-react";

interface CommentSectionProps {
    postId: string;
    commentCount: number;
}

export function CommentSection({ postId, commentCount }: CommentSectionProps) {
    const [params, setParams] = useState<GetCommentsParams>({
        limit: 20,
        sort: "best",
    });

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useFetchComments(postId, params);

    const comments = data?.pages.flatMap((page) => page.comments) || [];

    return (
        <div className="mt-6 space-y-6 pt-6 border-t border-border/50">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    {commentCount} Comments
                </h3>

                <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border/50">
                    {(["best", "newest", "oldest"] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setParams({ ...params, sort: s })}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${params.sort === s
                                ? "bg-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <CommentInput postId={postId} />

            <div className="space-y-4">
                {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                ))}

                {isLoading && (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                {!isLoading && comments.length === 0 && (
                    <div className="text-center py-12 bg-muted/5 rounded-xl border border-dashed border-border/50">
                        <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-muted-foreground">No comments yet. Be the first to start the discussion!</p>
                    </div>
                )}

                {hasNextPage && (
                    <div className="flex justify-center pt-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="text-muted-foreground hover:text-foreground font-bold cursor-pointer"
                        >
                            {isFetchingNextPage ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Loading more...
                                </>
                            ) : (
                                "Load more comments"
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
