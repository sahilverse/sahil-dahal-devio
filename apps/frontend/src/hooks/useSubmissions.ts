import { useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { submissionService } from "@/api/submissionService";
import { toast } from "sonner";

export const useRunSubmission = () => {
    return useMutation({
        mutationFn: (data: { slug: string; code: string; language: string }) =>
            submissionService.run(data),
    });
};

export const useSubmitSubmission = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { slug: string; code: string; language: string; eventId?: string }) =>
            submissionService.submit(data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["submissions", variables.slug] });
            queryClient.invalidateQueries({ queryKey: ["problem", variables.slug] });
            queryClient.invalidateQueries({ queryKey: ["problems"] });
        },
        onError: (error: any) => {
            const message = error.errorMessage

            toast.error(message)
        }
    });
};

export const useFetchSubmissions = (slug: string) => {
    return useInfiniteQuery({
        queryKey: ["submissions", slug],
        queryFn: ({ pageParam }) =>
            submissionService.getSubmissions(slug, { cursor: pageParam as string | undefined }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });
};
