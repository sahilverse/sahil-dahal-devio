import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { UserService } from "@/api/userService";
import { CommunityService } from "@/api/communityService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useJoinedCommunities(userId: string | undefined, limit = 10, query?: string) {
    return useInfiniteQuery({
        queryKey: ["joinedCommunities", userId, limit, query],
        queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
            if (!userId) return { communities: [], nextCursor: null };
            return UserService.getJoinedCommunities(userId, limit, pageParam, query);
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!userId,
    });
}

export function useCreateCommunity() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (data: {
            name: string;
            description?: string;
            visibility: "PUBLIC" | "PRIVATE" | "RESTRICTED";
            topics: string[];
        }) => CommunityService.createCommunity(data),
        onSuccess: (response) => {
            toast.success("Community created successfully!");
            queryClient.invalidateQueries({ queryKey: ["joinedCommunities"] });
            router.push(`/d/${response.result.name}`);
        },
        onError: (error: any) => {
            const message = error.errorMessage || "Failed to create community.";
            toast.error(message);
        }
    });
}

export function useExploreCommunities(limit: number = 10, topicSlug?: string) {
    return useInfiniteQuery({
        queryKey: ["communities", "explore", { limit, topicSlug }],
        queryFn: async ({ pageParam }) => {
            const response = await CommunityService.getExploreCommunities(
                limit,
                pageParam as string | undefined,
                topicSlug
            );
            return response.result;
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    });
}

export function useJoinCommunity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (name: string) => CommunityService.joinCommunity(name),
        onSuccess: () => {
            toast.success("Joined community!");
            queryClient.invalidateQueries({ queryKey: ["joinedCommunities"] });
            queryClient.invalidateQueries({ queryKey: ["communities", "explore"] });
        },
        onError: (error: any) => {
            const message = error.errorMessage || "Failed to join community.";
            toast.error(message);
        }
    });
}
