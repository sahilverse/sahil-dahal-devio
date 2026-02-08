import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
