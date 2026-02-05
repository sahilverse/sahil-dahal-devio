import { useQuery } from "@tanstack/react-query";
import { getActivity, getAvailableActivityYears } from "@/api/activityService";

export function useActivity(username: string, year: number) {
    return useQuery({
        queryKey: ["activity", username, year],
        queryFn: () => getActivity(username, year),
        enabled: !!username && !!year,
        staleTime: 1000 * 60 * 5,
    });
}

export function useAvailableActivityYears(username: string) {
    return useQuery({
        queryKey: ["activity-years", username],
        queryFn: () => getAvailableActivityYears(username),
        enabled: !!username,
        staleTime: 1000 * 60 * 60,
    });
}
