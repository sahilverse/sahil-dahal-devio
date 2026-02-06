import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/api/userService";
import { SkillService } from "@/api/skillService";
import { USER_QUERY_KEYS } from "./useProfile";
import { optimisticOptions } from "@/lib/query-utils";

export function useSearchSkills(query: string) {
    return useQuery({
        queryKey: ["skills", "search", query],
        queryFn: () => SkillService.searchSkills(query),
        enabled: query.length >= 2,
        staleTime: 1000 * 60 * 5,
    });
}

export function useManageSkills(username: string) {
    const queryClient = useQueryClient();

    const addSkill = useMutation({
        mutationFn: (name: string) => UserService.addSkill(name),
        ...optimisticOptions(
            queryClient,
            USER_QUERY_KEYS.profile(username),
            (oldData: any, newSkillName: string) => {
                const tempId = Math.random().toString();
                return {
                    ...oldData,
                    skills: [
                        ...(oldData.skills || []),
                        { id: tempId, name: newSkillName, slug: "", isTemp: true },
                    ],
                };
            },
            "Skill added successfully"
        ),
    });

    const removeSkill = useMutation({
        mutationFn: (id: string) => UserService.removeSkill(id),
        ...optimisticOptions(
            queryClient,
            USER_QUERY_KEYS.profile(username),
            (oldData: any, id: string) => ({
                ...oldData,
                skills: oldData.skills?.filter((s: any) => s.id !== id) || [],
            }),
            "Skill removed successfully"
        ),
    });

    return {
        addSkill,
        removeSkill,
    };
}
