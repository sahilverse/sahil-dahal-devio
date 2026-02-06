import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/api/userService";
import { USER_QUERY_KEYS } from "./useProfile";
import { optimisticOptions } from "@/lib/query-utils";
import type { Project } from "@/types/profile";

export function useManageProjects(username: string) {
    const queryClient = useQueryClient();

    const addProject = useMutation({
        mutationFn: (payload: any) => UserService.addProject(payload),
        ...optimisticOptions(
            queryClient,
            USER_QUERY_KEYS.profile(username),
            (oldData: any, newProject: any) => ({
                ...oldData,
                projects: [
                    ...(oldData.projects || []),
                    { ...newProject, id: Math.random().toString(), isTemp: true },
                ],
            }),
            "Project added successfully"
        ),
    });

    const updateProject = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) =>
            UserService.updateProject(id, payload),
        ...optimisticOptions(
            queryClient,
            USER_QUERY_KEYS.profile(username),
            (oldData: any, { id, payload }: any) => ({
                ...oldData,
                projects: oldData.projects?.map((p: Project) =>
                    p.id === id ? { ...p, ...payload } : p
                ) || [],
            }),
            "Project updated successfully"
        ),
    });

    const deleteProject = useMutation({
        mutationFn: (id: string) => UserService.deleteProject(id),
        ...optimisticOptions(
            queryClient,
            USER_QUERY_KEYS.profile(username),
            (oldData: any, id: string) => ({
                ...oldData,
                projects: oldData.projects?.filter((p: Project) => p.id !== id) || [],
            }),
            "Project removed successfully"
        ),
    });

    return {
        addProject,
        updateProject,
        deleteProject,
    };
}
