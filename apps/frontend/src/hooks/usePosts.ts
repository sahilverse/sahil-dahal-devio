import { useMutation, useQueryClient, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { PostService } from "@/api/postService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CreatePostFormData } from "@devio/zod-utils";
import { useAppSelector } from "@/store/hooks";
import { logger } from "@/lib/logger";

export function useFetchPost(postId: string) {
    return useQuery({
        queryKey: ["post", postId],
        queryFn: () => PostService.getPostById(postId),
        enabled: !!postId,
    });
}

export function useCreatePost() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);

    return useMutation({
        mutationFn: (data: CreatePostFormData) => PostService.createPost(data),
        onSuccess: (data, variables) => {
            const isDraft = variables.status === "DRAFT";
            toast.success(isDraft ? "Draft saved successfully!" : "Post created successfully!");
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["postCount"] });

            if (isDraft) {
                router.replace(`/edit/${data.id}`);
            } else if (data.community) {
                router.push(`/d/${data.community.name}?view=posts`);
            } else {
                router.push(`/u/${user?.username}?view=posts`);
            }
        },
        onError: (error: any) => {
            const message = error.errorMessage || "Failed to create post. Please try again.";
            toast.error(message);
            logger.error("Post Creation Error:", error);
        }
    });
}

export function useVotePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, type }: { postId: string; type: "UP" | "DOWN" | null }) =>
            PostService.votePost(postId, type),
        onMutate: async ({ postId, type }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["post", postId] });
            await queryClient.cancelQueries({ queryKey: ["posts"] });

            // Snapshot the previous value
            const previousPost = queryClient.getQueryData(["post", postId]);

            // Optimistically update to the new value
            if (previousPost) {
                queryClient.setQueryData(["post", postId], (old: any) => {
                    if (!old) return old;

                    const oldVote = old.userVote;
                    let newVoteCount = old.voteCount;

                    // 1. Remove old vote
                    if (oldVote === "UP") newVoteCount--;
                    if (oldVote === "DOWN") newVoteCount++;

                    // 2. Add new vote
                    if (type === "UP") newVoteCount++;
                    if (type === "DOWN") newVoteCount--;

                    return {
                        ...old,
                        voteCount: newVoteCount,
                        userVote: type,
                    };
                });
            }

            return { previousPost };
        },
        onError: (error: any, { postId }, context) => {
            // Roll back to the previous value
            if (context?.previousPost) {
                queryClient.setQueryData(["post", postId], context.previousPost);
            }
            const message = error.errorMessage || "Failed to record vote.";
            toast.error(message);
        },
        onSettled: (_, __, { postId }) => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["post", postId] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
}

export function useSavePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => PostService.toggleSavePost(postId),
        onSuccess: (data, postId) => {
            const message = data.isSaved ? "Post saved!" : "Post unsaved!";
            toast.success(message);
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["post", postId] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (error: any) => {
            const message = error.errorMessage || "Failed to save post.";
            toast.error(message);
        },
    });
}

export function usePinPost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, isPinned, communityId }: { postId: string; isPinned: boolean; communityId?: string }) =>
            PostService.togglePinPost(postId, isPinned, communityId),
        onSuccess: (data, variables) => {
            const context = variables.communityId ? "community" : "profile";
            const message = data.isPinned ? `Post pinned to ${context}!` : `Post unpinned from ${context}!`;
            toast.success(message);
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["post", variables.postId] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (error: any) => {
            const message = error.errorMessage || "Failed to update pin status.";
            toast.error(message);
        },
    });
}

export function useUpdatePost() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: ({ postId, data }: { postId: string; data: Partial<CreatePostFormData> }) =>
            PostService.updatePost(postId, data),
        onSuccess: (updatedPost) => {
            const isDraft = updatedPost.status === "DRAFT";
            toast.success(isDraft ? "Draft updated successfully!" : "Post updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["post", updatedPost.id] });
            queryClient.invalidateQueries({ queryKey: ["users"] });

            if (updatedPost.status === "PUBLISHED") {
                router.push(`/post/${updatedPost.id}`);
            }
        },
        onError: (error: any) => {
            toast.error(error?.errorMessage || "Failed to update post.");
        },
    });
}

export function useFetchPosts(filters?: { userId?: string; communityId?: string; onlySaved?: boolean; sortBy?: string; limit?: number; status?: string }) {
    return useInfiniteQuery({
        queryKey: ["posts", filters],
        queryFn: async ({ pageParam = undefined }) => {
            return PostService.getPosts({
                ...filters,
                cursor: pageParam as string | undefined,
                limit: filters?.limit || 10,
            });
        },
        getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
        initialPageParam: undefined,
    });
}

export function useFetchPostCount(params?: { status?: string; visibility?: string }) {
    return useQuery({
        queryKey: ["postCount", params],
        queryFn: () => PostService.getPostCount(params || {}),
    });
}

export function useDeletePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => PostService.deletePost(postId),
        onSuccess: () => {
            toast.success("Post deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (error: any) => {
            const message = error.errorMessage || "Failed to delete post.";
            toast.error(message);
        },
    });
}
