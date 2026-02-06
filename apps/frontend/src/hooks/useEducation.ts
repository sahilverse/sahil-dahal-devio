import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/api/userService";
import { optimisticOptions } from "@/lib/query-utils";
import { USER_QUERY_KEYS } from "./useProfile";

export const useManageEducation = (username: string) => {
    const queryClient = useQueryClient();

    const addEducation = useMutation({
        mutationFn: UserService.addEducation,
        ...optimisticOptions(
            queryClient,
            USER_QUERY_KEYS.profile(username),
            (oldData: any, newEducation: any) => {
                const tempId = Math.random().toString();
                return {
                    ...oldData,
                    educations: [
                        { ...newEducation, id: tempId, isTemp: true },
                        ...(oldData.educations || []),
                    ],
                };
            },
            "Education added successfully"
        ),
    });

    const updateEducation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) => UserService.updateEducation(id, payload),
        ...optimisticOptions(
            queryClient,
            USER_QUERY_KEYS.profile(username),
            (oldData: any, { id, payload }: any) => ({
                ...oldData,
                educations: oldData.educations?.map((edu: any) =>
                    edu.id === id ? { ...edu, ...payload } : edu
                ) || [],
            }),
            "Education updated successfully"
        ),
    });

    const deleteEducation = useMutation({
        mutationFn: UserService.deleteEducation,
        ...optimisticOptions(
            queryClient,
            USER_QUERY_KEYS.profile(username),
            (oldData: any, id: string) => ({
                ...oldData,
                educations: oldData.educations?.filter((edu: any) => edu.id !== id) || [],
            }),
            "Education deleted successfully"
        ),
    });

    return {
        addEducation,
        updateEducation,
        deleteEducation,
    };
};
