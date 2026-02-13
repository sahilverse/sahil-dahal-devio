import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { problemService } from "@/api/problemService";

export const useFetchProblems = (filters: {
    cursor?: string | null;
    search?: string;
    difficulty?: string[];
    status?: string[];
    topics?: string[];
    hasBounty?: boolean;
}) => {
    return useInfiniteQuery({
        queryKey: ["problems", filters],
        queryFn: ({ pageParam }) => problemService.getProblems({ ...filters, cursor: pageParam }),
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });
};

export const useFetchProblem = (slug: string) => {
    return useQuery({
        queryKey: ["problem", slug],
        queryFn: () => problemService.getProblemBySlug(slug),
        enabled: !!slug,
    });
};

export const useFetchBoilerplate = (slug: string, language: string) => {
    return useQuery({
        queryKey: ["boilerplate", slug, language],
        queryFn: () => problemService.getBoilerplate(slug, language),
        enabled: !!slug && !!language,
    });
};

export const useSaveDraft = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ slug, language, code }: { slug: string; language: string; code: string }) =>
            problemService.saveDraft(slug, language, code),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["boilerplate", variables.slug, variables.language] });
        }
    });
};

export const useFetchLanguages = () => {
    return useQuery({
        queryKey: ["problem-languages"],
        queryFn: () => problemService.getLanguages(),
    });
};
