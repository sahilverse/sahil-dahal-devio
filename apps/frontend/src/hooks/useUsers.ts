import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/api/userService";

export function useSearchUsers(query: string, enabled: boolean = true) {
    return useQuery({
        queryKey: ["users", "search", query],
        queryFn: () => UserService.searchUsers(query, 5),
        enabled: enabled && query.length >= 2,
        staleTime: 30 * 1000,
    });
}
