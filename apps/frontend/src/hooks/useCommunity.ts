import { useQuery, useInfiniteQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { CommunityService } from "@/api/communityService";
import { toast } from "sonner";
import type { Community } from "@/types/community";


export function useCommunity(name: string) {
    return useQuery<Community>({
        queryKey: ["community", name],
        queryFn: () => CommunityService.getCommunity(name),
        enabled: !!name,
    });
}

export function useCommunityRules(name: string) {
    return useQuery({
        queryKey: ["community", name, "rules"],
        queryFn: () => CommunityService.getRules(name),
        enabled: !!name,
    });
}

export function useCommunitySettings(name: string, enabled: boolean = false) {
    return useQuery({
        queryKey: ["community", name, "settings"],
        queryFn: () => CommunityService.getSettings(name),
        enabled: enabled && !!name,
    });
}

export function useCommunityModerators(name: string, limit: number = 3) {
    return useInfiniteQuery({
        queryKey: ["community", name, "moderators"],
        queryFn: async ({ pageParam }) => {
            return CommunityService.getModerators(name, limit, pageParam as string | undefined);
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
        enabled: !!name,
    });
}

export function useCommunityMembers(name: string, limit: number = 20, query?: string) {
    return useInfiniteQuery({
        queryKey: ["community", name, "members", query],
        queryFn: async ({ pageParam }) => {
            return CommunityService.getMembers(name, limit, pageParam as string | undefined, query);
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
        enabled: !!name,
        placeholderData: keepPreviousData,
    });
}

export function useJoinRequests(name: string, enabled: boolean = false) {
    return useQuery({
        queryKey: ["community", name, "requests"],
        queryFn: () => CommunityService.getJoinRequests(name),
        enabled: enabled && !!name,
    });
}

// ─── Mutations ──────────────────────────────────────────────

export function useJoinCommunityPage(name: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (message?: string) => CommunityService.joinCommunity(name, message),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["community", name] });
            const prev = queryClient.getQueryData<Community>(["community", name]);
            if (prev) {
                queryClient.setQueryData<Community>(["community", name], {
                    ...prev,
                    isMember: true,
                    memberCount: prev.memberCount + 1,
                });
            }
            return { prev };
        },
        onError: (_err, _vars, context) => {
            if (context?.prev) {
                queryClient.setQueryData(["community", name], context.prev);
            }
            const message = (_err as any)?.errorMessage || "Failed to join community.";
            toast.error(message);
        },
        onSuccess: (data) => {
            if (data?.status === "REQUEST_SENT") {
                toast.success("Join request sent!");
                // Revert optimistic update since not yet joined
                queryClient.invalidateQueries({ queryKey: ["community", name] });
            } else {
                toast.success("Joined community!");
            }
            queryClient.invalidateQueries({ queryKey: ["joinedCommunities"] });
        },
    });
}

export function useLeaveCommunity(name: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => CommunityService.leaveCommunity(name),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["community", name] });
            const prev = queryClient.getQueryData<Community>(["community", name]);
            if (prev) {
                queryClient.setQueryData<Community>(["community", name], {
                    ...prev,
                    isMember: false,
                    isMod: undefined,
                    memberCount: Math.max(0, prev.memberCount - 1),
                });
            }
            return { prev };
        },
        onError: (_err, _vars, context) => {
            if (context?.prev) {
                queryClient.setQueryData(["community", name], context.prev);
            }
            const message = (_err as any)?.errorMessage || "Failed to leave community.";
            toast.error(message);
        },
        onSuccess: () => {
            toast.success("Left community.");
            queryClient.invalidateQueries({ queryKey: ["community", name] });
            queryClient.invalidateQueries({ queryKey: ["joinedCommunities"] });
        },
    });
}

export function useUpdateCommunitySettings(name: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (settings: Record<string, any>) => CommunityService.updateSettings(name, settings),
        onSuccess: () => {
            toast.success("Settings updated.");
            queryClient.invalidateQueries({ queryKey: ["community", name] });
            queryClient.invalidateQueries({ queryKey: ["community", name, "settings"] });
        },
        onError: (err: any) => {
            toast.error(err?.errorMessage || "Failed to update settings.");
        },
    });
}

export function useUpdateCommunityRules(name: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (rules: any) => CommunityService.updateRules(name, rules),
        onSuccess: () => {
            toast.success("Rules updated.");
            queryClient.invalidateQueries({ queryKey: ["community", name, "rules"] });
        },
        onError: (err: any) => {
            toast.error(err?.errorMessage || "Failed to update rules.");
        },
    });
}

export function useUpdateCommunityMedia(name: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData: FormData) => CommunityService.updateMedia(name, formData),
        onSuccess: () => {
            toast.success("Media updated.");
            queryClient.invalidateQueries({ queryKey: ["community", name] });
        },
        onError: (err: any) => {
            toast.error(err?.errorMessage || "Failed to update media.");
        },
    });
}

export function useRemoveCommunityMedia(name: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (type: "icon" | "banner") => CommunityService.removeMedia(name, type),
        onSuccess: () => {
            toast.success("Media removed.");
            queryClient.invalidateQueries({ queryKey: ["community", name] });
        },
        onError: (err: any) => {
            toast.error(err?.errorMessage || "Failed to remove media.");
        },
    });
}

export function useReviewJoinRequest(name: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ requestId, status }: { requestId: string; status: "APPROVED" | "REJECTED" }) =>
            CommunityService.reviewJoinRequest(requestId, status),
        onSuccess: (_data, variables) => {
            toast.success(`Request ${variables.status.toLowerCase()}.`);
            queryClient.invalidateQueries({ queryKey: ["community", name, "requests"] });
            queryClient.invalidateQueries({ queryKey: ["community", name, "members"] });
            queryClient.invalidateQueries({ queryKey: ["community", name] });
        },
        onError: (err: any) => {
            toast.error(err?.errorMessage || "Failed to review request.");
        },
    });
}

export function useUpdateModeratorPermissions(name: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, isMod, permissions }: { userId: string; isMod: boolean; permissions?: Record<string, boolean> }) =>
            CommunityService.updateModeratorPermissions(name, userId, { isMod, permissions }),
        onSuccess: () => {
            toast.success("Moderator permissions updated.");
            queryClient.invalidateQueries({ queryKey: ["community", name, "moderators"] });
            queryClient.invalidateQueries({ queryKey: ["community", name, "members"] });
        },
        onError: (err: any) => {
            toast.error(err?.errorMessage || "Failed to update permissions.");
        },
    });
}
