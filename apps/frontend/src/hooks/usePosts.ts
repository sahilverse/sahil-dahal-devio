"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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

            if (response.result.communityId) {
                router.push(`/community/${response.result.community.slug}?view=posts`);
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
