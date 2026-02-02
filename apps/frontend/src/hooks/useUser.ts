import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/api/userService";
import type { UserProfile } from "@/types/user";
import { toast } from "sonner";

export const USER_QUERY_KEYS = {
    all: ["users"] as const,
    profile: (username: string) => [...USER_QUERY_KEYS.all, "profile", username] as const,
};

export function useUserProfile(username: string) {
    return useQuery({
        queryKey: USER_QUERY_KEYS.profile(username),
        queryFn: () => UserService.getProfile(username),
        enabled: !!username,
        retry: 1,
    });
}

export function useFollowUser(username: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => UserService.followUser(username),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: USER_QUERY_KEYS.profile(username) });

            const previousProfile = queryClient.getQueryData<UserProfile>(
                USER_QUERY_KEYS.profile(username)
            );

            if (previousProfile) {
                queryClient.setQueryData<UserProfile>(USER_QUERY_KEYS.profile(username), {
                    ...previousProfile,
                    isFollowing: true,
                    followersCount: previousProfile.followersCount + 1,
                });
            }

            return { previousProfile };
        },
        onError: (_err, _vars, context) => {
            toast.error("Failed to follow user");
            if (context?.previousProfile) {
                queryClient.setQueryData(USER_QUERY_KEYS.profile(username), context.previousProfile);
            }
        },
        onSuccess: () => {
            toast.success(`Followed @${username}`);
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.profile(username) });
        },
    });
}

export function useUnfollowUser(username: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => UserService.unfollowUser(username),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: USER_QUERY_KEYS.profile(username) });

            const previousProfile = queryClient.getQueryData<UserProfile>(
                USER_QUERY_KEYS.profile(username)
            );

            if (previousProfile) {
                queryClient.setQueryData<UserProfile>(USER_QUERY_KEYS.profile(username), {
                    ...previousProfile,
                    isFollowing: false,
                    followersCount: previousProfile.followersCount - 1,
                });
            }

            return { previousProfile };
        },
        onError: (_err, _vars, context) => {
            toast.error("Failed to unfollow user");
            if (context?.previousProfile) {
                queryClient.setQueryData(USER_QUERY_KEYS.profile(username), context.previousProfile);
            }
        },
        onSuccess: () => {
            toast.success(`Unfollowed @${username}`);
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.profile(username) });
        },
    });
}
