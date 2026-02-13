import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/api/notificationService";
import { Notification } from "@/types/notification";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";

export function useFetchNotifications(limit: number = 20) {
    return useInfiniteQuery({
        queryKey: ["notifications"],
        queryFn: async ({ pageParam }) => {
            const response = await notificationService.getNotifications({
                limit,
                cursor: pageParam,
            });
            return response;
        },
        getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
        initialPageParam: undefined as string | undefined,
    });
}

export function useUnreadCount() {
    const { user } = useAppSelector((state) => state.auth);

    return useQuery({
        queryKey: ["notifications", "unread-count"],
        queryFn: async () => {
            const response = await notificationService.getUnreadCount();
            return response.count;
        },
        refetchInterval: 60000,
        enabled: !!user,
    });
}

export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => notificationService.markAsRead(id),
        onMutate: async (id: string) => {
            await queryClient.cancelQueries({ queryKey: ["notifications"] });

            const previous = queryClient.getQueryData(["notifications"]);

            queryClient.setQueryData(["notifications"], (old: any) => {
                if (!old?.pages) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        notifications: page.notifications.map((n: Notification) =>
                            n.id === id ? { ...n, isRead: true } : n
                        ),
                    })),
                };
            });

            return { previous };
        },
        onError: (_error, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(["notifications"], context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
        },
    });
}

export function useMarkAllAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["notifications"] });

            const previous = queryClient.getQueryData(["notifications"]);

            queryClient.setQueryData(["notifications"], (old: any) => {
                if (!old?.pages) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        notifications: page.notifications.map((n: Notification) => ({
                            ...n,
                            isRead: true,
                        })),
                    })),
                };
            });

            return { previous };
        },
        onError: (_error, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(["notifications"], context.previous);
            }
            toast.error("Failed to mark notifications as read");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
        },
    });
}
