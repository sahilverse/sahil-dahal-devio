import { useInfiniteQuery } from "@tanstack/react-query";
import { UserService } from "@/api/userService";

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
