import { QueryClient, QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export function optimisticOptions<TData, TVariables>(
    queryClient: QueryClient,
    queryKey: QueryKey,
    updateFn: (oldData: TData, variables: TVariables) => TData,
    successMessage: string
) {
    return {
        onMutate: async (variables: TVariables) => {
            await queryClient.cancelQueries({ queryKey });
            const previousData = queryClient.getQueryData<TData>(queryKey);

            if (previousData) {
                queryClient.setQueryData(queryKey, updateFn(previousData, variables));
            }

            return { previousData };
        },
        onSuccess: () => {
            toast.success(successMessage);
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (error: any, _variables: TVariables, context: { previousData: TData } | undefined) => {
            logger.error(`Failed: ${successMessage}`, error);
            toast.error(error.errorMessage || "An error occurred");
            if (context?.previousData) {
                queryClient.setQueryData(queryKey, context.previousData);
            }
        },
    };
}
