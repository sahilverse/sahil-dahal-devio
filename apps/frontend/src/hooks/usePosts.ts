import { useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { PostService } from "@/api/postService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CreatePostFormData } from "@/components/create/CreatePostForm";
import { useAppSelector } from "@/store/hooks";
import { logger } from "@/lib/logger";

export function useCreatePost() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);

    return useMutation({
        mutationFn: (data: CreatePostFormData) => PostService.createPost(data),
        onSuccess: (response) => {
            toast.success("Post created successfully!");
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["user-posts"] });

            if (response.result.communityId) {
                router.push(`/d/${response.result.community.name}?view=posts`);
            } else {
                router.push(`/user/${user?.username}?view=posts`);
            }
        },
        onError: (error: any) => {
            const message = error.errorMessage || "Failed to create post. Please try again.";
            toast.error(message);
            logger.error("Post Creation Error:", error);
        }
    });
}

export function useFetchPosts(filters?: { userId?: string; communityId?: string; limit?: number }) {
    return useInfiniteQuery({
        queryKey: ["posts", filters],
        queryFn: async ({ pageParam = undefined }) => {
            const response = await PostService.getPosts({
                ...filters,
                cursor: pageParam as string | undefined,
                limit: filters?.limit || 10,
            });
            return response.result;
        },
        getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
        initialPageParam: undefined,
    });
}
