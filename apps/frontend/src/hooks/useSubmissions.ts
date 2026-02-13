import { useMutation } from "@tanstack/react-query";
import { submissionService } from "@/api/submissionService";

export const useRunSubmission = () => {
    return useMutation({
        mutationFn: (data: { slug: string; code: string; language: string }) =>
            submissionService.run(data),
    });
};

export const useSubmitSubmission = () => {
    return useMutation({
        mutationFn: (data: { slug: string; code: string; language: string; eventId?: string }) =>
            submissionService.submit(data),
    });
};
