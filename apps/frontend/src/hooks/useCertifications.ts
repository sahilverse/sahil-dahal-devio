import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/api/userService";
import { USER_QUERY_KEYS } from "./useProfile";
import { optimisticOptions } from "@/lib/query-utils";

export function useManageCertifications(username: string) {
    const queryClient = useQueryClient();

    const addCertification = useMutation({
        mutationFn: (payload: any) => UserService.addCertification(payload),
        ...optimisticOptions(
            queryClient,
            USER_QUERY_KEYS.profile(username),
            (oldData: any, newCertification: any) => {
                const tempId = Math.random().toString();
                return {
                    ...oldData,
                    certifications: [
                        { ...newCertification, id: tempId, isTemp: true },
                        ...(oldData.certifications || []),
                    ],
                };
            },
            "Certification added successfully"
        ),
    });

    const updateCertification = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) =>
            UserService.updateCertification(id, payload),
        ...optimisticOptions(
            queryClient,
            USER_QUERY_KEYS.profile(username),
            (oldData: any, { id, payload }: any) => ({
                ...oldData,
                certifications: oldData.certifications?.map((cert: any) =>
                    cert.id === id ? { ...cert, ...payload } : cert
                ) || [],
            }),
            "Certification updated successfully"
        ),
    });

    const deleteCertification = useMutation({
        mutationFn: (id: string) => UserService.deleteCertification(id),
        ...optimisticOptions(
            queryClient,
            USER_QUERY_KEYS.profile(username),
            (oldData: any, id: string) => ({
                ...oldData,
                certifications: oldData.certifications?.filter((cert: any) => cert.id !== id) || [],
            }),
            "Certification deleted successfully"
        ),
    });

    return {
        addCertification,
        updateCertification,
        deleteCertification,
    };
}
