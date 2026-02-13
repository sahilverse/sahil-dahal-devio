import { useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { CommentService } from "@/api/commentService";
import { toast } from "sonner";
import { GetCommentsParams, GetRepliesParams } from "@/types/comment";
import { logger } from "@/lib/logger";

export function useCreateComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, content, parentId, media }: { postId: string; content: string; parentId?: string; media?: File[] }) =>
            CommentService.createComment(postId, content, parentId, media),
        onSuccess: (_, variables) => {
            toast.success(variables.parentId ? "Reply posted!" : "Comment posted!");
            queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
            if (variables.parentId) {
                queryClient.invalidateQueries({ queryKey: ["replies", variables.parentId] });
            }
        },
        onError: (error: any) => {
            const message = error.errorMessage || "Failed to post comment.";
            toast.error(message);
        }
    });
}

export function useFetchComments(postId: string, params?: GetCommentsParams) {
    return useInfiniteQuery({
        queryKey: ["comments", postId, params],
        queryFn: async ({ pageParam = undefined }) => {
            const response = await CommentService.getComments(postId, {
                ...params,
                cursor: pageParam as string | undefined,
            });
            return response.result;
        },
        getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
        initialPageParam: undefined,
        enabled: !!postId,
    });
}

export function useFetchReplies(commentId: string, params?: GetRepliesParams) {
    return useInfiniteQuery({
        queryKey: ["replies", commentId, params],
        queryFn: async ({ pageParam = undefined }) => {
            const response = await CommentService.getReplies(commentId, {
                ...params,
                cursor: pageParam as string | undefined,
            });
            return response.result;
        },
        getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
        initialPageParam: undefined,
        enabled: !!commentId,
    });
}

export function useVoteComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId, type }: { commentId: string; type: "UP" | "DOWN" | null }) =>
            CommentService.voteComment(commentId, type),
        onSuccess: (response) => {
            const comment = response.result;
            queryClient.invalidateQueries({ queryKey: ["comments", comment.postId] });
            if (comment.parentId) {
                queryClient.invalidateQueries({ queryKey: ["replies", comment.parentId] });
            }
        },
        onError: (error: any) => {
            const message = error.errorMessage || "Failed to record vote.";
            toast.error(message);
        },
    });
}

export function useUpdateComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
            CommentService.updateComment(commentId, content),
        onSuccess: (response) => {
            const comment = response.result;
            toast.success("Comment updated!");
            queryClient.invalidateQueries({ queryKey: ["comments", comment.postId] });
            if (comment.parentId) {
                queryClient.invalidateQueries({ queryKey: ["replies", comment.parentId] });
            }
        },
        onError: (error: any) => {
            const message = error.errorMessage || "Failed to update comment.";
            toast.error(message);
        },
    });
}

export function useDeleteComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId, postId, parentId }: { commentId: string; postId: string; parentId: string | null }) =>
            CommentService.deleteComment(commentId),

        onMutate: async (variables) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ["comments", variables.postId] });
            if (variables.parentId) {
                await queryClient.cancelQueries({ queryKey: ["replies", variables.parentId] });
            }

            // Snapshot the previous value
            const previousComments = queryClient.getQueryData(["comments", variables.postId]);
            const previousReplies = variables.parentId ? queryClient.getQueryData(["replies", variables.parentId]) : null;

            // Optimistically update: for comments, we set isDeleted to true
            if (previousComments) {
                queryClient.setQueryData(["comments", variables.postId], (old: any) => {
                    if (!old) return old;
                    return {
                        ...old,
                        pages: old.pages.map((page: any) => ({
                            ...page,
                            comments: page.comments.map((c: any) =>
                                c.id === variables.commentId ? { ...c, isDeleted: true, content: "[deleted]" } : c
                            )
                        }))
                    };
                });
            }

            if (variables.parentId && previousReplies) {
                queryClient.setQueryData(["replies", variables.parentId], (old: any) => {
                    if (!old) return old;
                    return {
                        ...old,
                        pages: old.pages.map((page: any) => ({
                            ...page,
                            replies: page.replies.map((r: any) =>
                                r.id === variables.commentId ? { ...r, isDeleted: true, content: "[deleted]" } : r
                            )
                        }))
                    };
                });
            }

            return { previousComments, previousReplies };
        },

        onError: (error: any, variables, context) => {
            // Roll back to the previous value
            if (context?.previousComments) {
                queryClient.setQueryData(["comments", variables.postId], context.previousComments);
            }
            if (variables.parentId && context?.previousReplies) {
                queryClient.setQueryData(["replies", variables.parentId], context.previousReplies);
            }

            const message = error.errorMessage || "Failed to delete comment.";
            toast.error(message);
        },

        onSettled: (data, error, variables) => {
            // Always refetch after error or success to ensure we are in sync with the server
            queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
            if (variables.parentId) {
                queryClient.invalidateQueries({ queryKey: ["replies", variables.parentId] });
            }
            // Also invalidate posts to get updated commentCount
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },

        onSuccess: () => {
            toast.success("Comment deleted.");
        },
    });
}

export function useAcceptAnswer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) =>
            CommentService.acceptAnswer(postId, commentId),
        onSuccess: (_, variables) => {
            toast.success("Answer accepted!");
            queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: (error: any) => {
            const message = error.errorMessage || "Failed to accept answer.";
            toast.error(message);
        }
    });
}
