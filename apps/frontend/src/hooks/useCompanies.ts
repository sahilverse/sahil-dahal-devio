import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { CompanyService } from "@/api/companyService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useFetchUserCompanies() {
    return useQuery({
        queryKey: ["companies", "managed"],
        queryFn: () => CompanyService.getManagedCompanies(),
    });
}

export function useFetchCompany(slug: string) {
    return useQuery({
        queryKey: ["companies", "detail", slug],
        queryFn: () => CompanyService.getBySlug(slug),
        enabled: !!slug,
    });
}

export function useCreateCompany() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (data: any) => CompanyService.create(data),
        onSuccess: (data) => {
            toast.success("Company established successfully!");
            queryClient.invalidateQueries({ queryKey: ["companies"] });
            router.push(`/c/${data.slug}`);
        },
        onError: (error: any) => {
            toast.error(error?.errorMessage || "Failed to create company.");
        },
    });
}

export function useManageMembers() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, userId, action, role }: { id: string, userId: string, action: "ADD" | "REMOVE" | "UPDATE_ROLE", role?: string }) =>
            CompanyService.manageMembers(id, { userId, action, role }),
        onSuccess: (_, variables) => {
            toast.success(`Member managed successfully!`);
            queryClient.invalidateQueries({ queryKey: ["companies", "detail"] });
        },
        onError: (error: any) => {
            toast.error(error?.errorMessage || "Failed to manage member.");
        },
    });
}

export function useVerifyDomain() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, email }: { id: string, email: string }) =>
            CompanyService.verifyDomain(id, email),
        onSuccess: (data) => {
            toast.success("Domain verification request sent!");
            queryClient.invalidateQueries({ queryKey: ["companies", "detail", data.slug] });
        },
        onError: (error: any) => {
            toast.error(error?.errorMessage || "Failed to verify domain.");
        },
    });
}
