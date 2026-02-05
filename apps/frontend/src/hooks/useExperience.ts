import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/api/userService";
import { CompanyService } from "@/api/companyService";
import { USER_QUERY_KEYS } from "./useProfile";
import { toast } from "sonner";

export function useSearchCompanies(query: string) {
    return useQuery({
        queryKey: ["companies", "search", query],
        queryFn: () => CompanyService.search(query),
        enabled: query.length >= 2,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useManageExperience(username: string) {
    const queryClient = useQueryClient();

    const addExperience = useMutation({
        mutationFn: (payload: any) => UserService.addExperience(payload),
        onSuccess: () => {
            toast.success("Experience added successfully");
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.profile(username) });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to add experience");
        },
    });

    const updateExperience = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) =>
            UserService.updateExperience(id, payload),
        onSuccess: () => {
            toast.success("Experience updated successfully");
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.profile(username) });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update experience");
        },
    });

    const deleteExperience = useMutation({
        mutationFn: (id: string) => UserService.deleteExperience(id),
        onSuccess: () => {
            toast.success("Experience deleted successfully");
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.profile(username) });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to delete experience");
        },
    });

    return {
        addExperience,
        updateExperience,
        deleteExperience,
    };
}
