import { useMutation, useQueryClient, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { JobService, JobsResponse, Job } from "@/api/jobService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";

export function useFetchJobs(params?: any, options?: any) {
    return useQuery<JobsResponse>({
        queryKey: ["jobs", params],
        queryFn: () => JobService.getAll(params),
        ...options
    });
}

export function useFetchJob(slug: string) {
    return useQuery<Job>({
        queryKey: ["job", slug],
        queryFn: () => JobService.getBySlug(slug),
        enabled: !!slug,
    });
}

export function useCreateJob() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (data: any) => JobService.create(data),
        onSuccess: (data) => {
            toast.success("Job posted successfully!");
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
            router.push(`/j/${data.slug}`);
        },
        onError: (error: any) => {
            const message = error.errorMessage || "Failed to post job. Please try again.";
            toast.error(message);
            logger.error("Job Creation Error:", error);
        },
    });
}

export function useUpdateJob() {
    const queryClient = useQueryClient();
    const router = useRouter();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => JobService.update(id, data),
        onSuccess: (data) => {
            toast.success("Job updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
            queryClient.invalidateQueries({ queryKey: ["job", data.slug] });
            router.push(`/j/${data.slug}`);
        },
        onError: (error: any) => {
            toast.error(error?.errorMessage || "Failed to update job.");
        },
    });
}

export function useDeleteJob() {
    const queryClient = useQueryClient();
    const router = useRouter();
    return useMutation({
        mutationFn: (id: string) => JobService.delete(id),
        onSuccess: () => {
            toast.success("Job deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
            router.push("/j");
        },
        onError: (error: any) => {
            toast.error(error?.errorMessage || "Failed to delete job.");
        },
    });
}

export function useApplyJob() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ jobId, data }: { jobId: string; data: { coverLetter?: string; resumeUrl?: string } }) =>
            JobService.apply(jobId, data),
        onSuccess: () => {
            toast.success("Application submitted successfully!");
            queryClient.invalidateQueries({ queryKey: ["myApplications"] });
        },
        onError: (error: any) => {
            toast.error(error?.errorMessage || "Failed to submit application.");
        },
    });
}

export function useFetchMyApplications() {
    return useInfiniteQuery({
        queryKey: ["myApplications"],
        queryFn: ({ pageParam }) => JobService.getMyApplications(pageParam as string | undefined),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    });
}

export function useFetchJobApplications(jobId: string) {
    return useInfiniteQuery({
        queryKey: ["jobApplications", jobId],
        queryFn: ({ pageParam }) => JobService.getApplicationsForJob(jobId, pageParam as string | undefined),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
        enabled: !!jobId,
    });
}

export function useUpdateApplicationStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            JobService.updateApplicationStatus(id, status),
        onSuccess: () => {
            toast.success("Application status updated!");
            queryClient.invalidateQueries({ queryKey: ["jobApplications"] });
        },
        onError: (error: any) => {
            toast.error(error?.errorMessage || "Failed to update application status.");
        },
    });
}
