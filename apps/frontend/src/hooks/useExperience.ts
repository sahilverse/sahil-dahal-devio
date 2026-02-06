import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/api/userService";
import { CompanyService } from "@/api/companyService";
import { USER_QUERY_KEYS } from "./useProfile";
import { toast } from "sonner";
import { optimisticOptions } from "@/lib/query-utils";

export function useSearchCompanies(query: string) {
    return useQuery({
        queryKey: ["companies", "search", query],
        queryFn: () => CompanyService.search(query),
        enabled: query.length >= 2,
        staleTime: 1000 * 60 * 5,
    });
}

export function useManageExperience(username: string) {
    const queryClient = useQueryClient();

    const addExperience = useMutation({
        mutationFn: (payload: any) => UserService.addExperience(payload),
        ...optimisticOptions(
            queryClient,
            USER_QUERY_KEYS.profile(username),
            (oldData: any, newExperience: any) => {
                const tempId = Math.random().toString();
                return {
                    ...oldData,
                    experiences: [
                        { ...newExperience, id: tempId, isTemp: true },
                        ...(oldData.experiences || []),
                    ],
                };
            },
            "Experience added successfully"
        ),
    });

    const updateExperience = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) =>
            UserService.updateExperience(id, payload),
        ...optimisticOptions(
            queryClient,
            USER_QUERY_KEYS.profile(username),
            (oldData: any, { id, payload }: any) => ({
                ...oldData,
                experiences: oldData.experiences?.map((exp: any) =>
                    exp.id === id ? { ...exp, ...payload } : exp
                ) || [],
            }),
            "Experience updated successfully"
        ),
    });

    const deleteExperience = useMutation({
        mutationFn: (id: string) => UserService.deleteExperience(id),
        ...optimisticOptions(
            queryClient,
            USER_QUERY_KEYS.profile(username),
            (oldData: any, id: string) => ({
                ...oldData,
                experiences: oldData.experiences?.filter((exp: any) => exp.id !== id) || [],
            }),
            "Experience deleted successfully"
        ),
    });

    return {
        addExperience,
        updateExperience,
        deleteExperience,
    };
}
