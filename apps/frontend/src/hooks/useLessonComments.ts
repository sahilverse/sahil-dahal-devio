import { useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { courseService } from "@/api/courseService";
import { toast } from "sonner";
import { CourseComment } from "@/types/course";

export function useCreateLessonComment(lessonId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { content: string; parentId?: string }) =>
            courseService.postComment(lessonId, data),
        onSuccess: (_, variables) => {
            toast.success(variables.parentId ? "Reply posted!" : "Comment posted!");
            queryClient.invalidateQueries({ queryKey: ["lesson-comments", lessonId] });
            if (variables.parentId) {
                queryClient.invalidateQueries({ queryKey: ["lesson-replies", variables.parentId] });
            }
        },
        onError: (error: any) => {
            const message = error.errorMessage || "Failed to post comment.";
            toast.error(message);
        },
    });
}

export function useFetchLessonComments(lessonId: string, params: { sort: "best" | "newest" | "oldest" }) {
    return useInfiniteQuery({
        queryKey: ["lesson-comments", lessonId, params.sort],
        queryFn: async ({ pageParam }) => {
            const response = await courseService.getLessonComments(lessonId, {
                ...params,
                cursor: pageParam as string | undefined,
                limit: 10,
            });
            return response;
        },
        getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
        initialPageParam: undefined as string | undefined,
        enabled: !!lessonId,
    });
}

export function useFetchLessonReplies(lessonId: string, commentId: string) {
    return useInfiniteQuery({
        queryKey: ["lesson-replies", commentId],
        queryFn: async ({ pageParam }) => {
            const response = await courseService.getCommentReplies(lessonId, commentId, {
                cursor: pageParam as string | undefined,
                limit: 5,
            });
            return response;
        },
        getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
        initialPageParam: undefined as string | undefined,
        enabled: !!commentId,
    });
}


export function useVoteLessonComment(lessonId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId, type }: { commentId: string; type: "UP" | "DOWN" | null }) =>
            courseService.voteComment(commentId, type),
        onSuccess: (updatedComment) => {
            // Optimistic update would be better, but invalidation is safer for now
            queryClient.invalidateQueries({ queryKey: ["lesson-comments", lessonId] });
            if (updatedComment.parentId) {
                queryClient.invalidateQueries({ queryKey: ["lesson-replies", updatedComment.parentId] });
            }
        },
        onError: (error: any) => {
            const message = error.errorMessage || "Failed to record vote.";
            toast.error(message);
        },
    });
}

export function useUpdateLessonComment(lessonId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
            courseService.updateComment(commentId, content),
        onSuccess: (updatedComment) => {
            toast.success("Comment updated!");
            queryClient.invalidateQueries({ queryKey: ["lesson-comments", lessonId] });
            if (updatedComment.parentId) {
                queryClient.invalidateQueries({ queryKey: ["lesson-replies", updatedComment.parentId] });
            }
        },
        onError: (error: any) => {
            const message = error.errorMessage || "Failed to update comment.";
            toast.error(message);
        },
    });
}

export function useDeleteLessonComment(lessonId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId, parentId }: { commentId: string; parentId: string | null }) =>
            courseService.deleteComment(commentId),
        onSuccess: (_, variables) => {
            toast.success("Comment deleted.");
            queryClient.invalidateQueries({ queryKey: ["lesson-comments", lessonId] });
            if (variables.parentId) {
                queryClient.invalidateQueries({ queryKey: ["lesson-replies", variables.parentId] });
            }
        },
        onError: (error: any) => {
            const message = error.errorMessage || "Failed to delete comment.";
            toast.error(message);
        },
    });
}
