import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/api/userService";
import type { UserProfile, UserAbout } from "@/types/profile";
import { toast } from "sonner";

export const USER_QUERY_KEYS = {
    all: ["users"] as const,
    profile: (username: string) => [...USER_QUERY_KEYS.all, "profile", username.toLowerCase()] as const,
    about: (username: string) => [...USER_QUERY_KEYS.all, "about", username.toLowerCase()] as const,
    communities: (username: string) => [...USER_QUERY_KEYS.all, "communities", username.toLowerCase()] as const,
};

export function useUserProfile(username: string) {
    return useQuery({
        queryKey: USER_QUERY_KEYS.profile(username),
        queryFn: () => UserService.getProfile(username),
        enabled: !!username,
        retry: 1,
    });
}

export function useUserAbout(username: string) {
    return useQuery({
        queryKey: USER_QUERY_KEYS.about(username),
        queryFn: () => UserService.getAboutData(username),
        enabled: !!username,
        retry: 1,
        staleTime: 1000 * 60 * 5,
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
        onError: (err: any, _vars, context) => {
            toast.error(err.errorMessage || "Failed to follow user");
            if (context?.previousProfile) {
                queryClient.setQueryData(USER_QUERY_KEYS.profile(username), context.previousProfile);
            }
        },
        onSuccess: () => {
            toast.success(`Followed u/${username}`);
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
        onError: (err: any, _vars, context) => {
            toast.error(err.errorMessage || "Failed to unfollow user");
            if (context?.previousProfile) {
                queryClient.setQueryData(USER_QUERY_KEYS.profile(username), context.previousProfile);
            }
        },
        onSuccess: () => {
            toast.success(`Unfollowed u/${username}`);
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.profile(username) });
        },
    });
}

export function useUploadAvatar(username: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file: File) => UserService.uploadAvatar(file),
        onSuccess: () => {
            toast.success("Avatar updated successfully");
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.profile(username) });
        },
        onError: (err: any) => {
            toast.error(err.errorMessage || "Failed to update avatar");
        },
    });
}

export function useUploadBanner(username: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file: File) => UserService.uploadBanner(file),
        onSuccess: () => {
            toast.success("Banner updated successfully");
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.profile(username) });
        },
        onError: (err: any) => {
            toast.error(err.errorMessage || "Failed to update banner");
        },
    });
}

export function useRemoveAvatar(username: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => UserService.removeAvatar(),
        onSuccess: () => {
            toast.success("Avatar removed successfully");
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.profile(username) });
        },
        onError: (err: any) => {
            toast.error(err.errorMessage || "Failed to remove avatar");
        },
    });
}

export function useRemoveBanner(username: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => UserService.removeBanner(),
        onSuccess: () => {
            toast.success("Banner removed successfully");
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.profile(username) });
        },
        onError: (err: any) => {
            toast.error(err.errorMessage || "Failed to remove banner");
        },
    });
}

export function useUpdateProfile(username: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: any) => UserService.updateProfile(payload),
        onSuccess: () => {
            toast.success("Profile updated successfully");
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.profile(username) });
        },
        onError: (err: any) => {
            toast.error(err.errorMessage || "Failed to update profile");
        },
    });
}

export function useUpdateNames(username: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: any) => UserService.updateNames(payload),
        onSuccess: () => {
            toast.success("Names updated successfully");
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.profile(username) });
        },
        onError: (err: any) => {
            toast.error(err.errorMessage || "Failed to update names");
        },
    });
}
