import {
    useInfiniteQuery,
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { conversationService } from "@/api/conversationService";
import { useAppSelector } from "@/store/hooks";
import type { Message } from "@/types/conversation";
import { toast } from "sonner";


export function useConversations(limit: number = 20) {
    const { user } = useAppSelector((state) => state.auth);

    return useInfiniteQuery({
        queryKey: ["conversations"],
        queryFn: async ({ pageParam }) => {
            return conversationService.getConversations({
                limit,
                cursor: pageParam,
            });
        },
        getNextPageParam: (lastPage) => {
            if (!lastPage || lastPage.length < limit) return undefined;
            return lastPage[lastPage.length - 1]?.id;
        },
        initialPageParam: undefined as string | undefined,
        enabled: !!user,
    });
}

export function useMessages(conversationId: string | null, limit: number = 50) {
    return useInfiniteQuery({
        queryKey: ["messages", conversationId],
        queryFn: async ({ pageParam }) => {
            if (!conversationId) return [];
            return conversationService.getMessages(conversationId, {
                limit,
                cursor: pageParam,
            });
        },
        getNextPageParam: (lastPage) => {
            if (!lastPage || lastPage.length < limit) return undefined;
            return lastPage[lastPage.length - 1]?.id;
        },
        initialPageParam: undefined as string | undefined,
        enabled: !!conversationId,
    });
}

export function useSearchConversations(query: string) {
    return useQuery({
        queryKey: ["conversations", "search", query],
        queryFn: () => conversationService.searchConversations(query),
        enabled: query.length >= 2,
    });
}

export function useStartConversation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ recipientId, message }: { recipientId: string; message: string }) =>
            conversationService.startConversation(recipientId, message),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
        onError: (error: any) => {
            toast.error(error.errorMessage);
        },
    });
}

export function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            conversationId,
            content,
            media,
        }: {
            conversationId: string;
            content?: string;
            media?: File[];
        }) => conversationService.sendMessage(conversationId, content, media),
        onSuccess: (newMessage) => {
            queryClient.setQueryData(
                ["messages", newMessage.conversationId],
                (old: any) => {
                    if (!old?.pages) return old;
                    const updatedPages = [...old.pages];
                    updatedPages[updatedPages.length - 1] = [
                        ...updatedPages[updatedPages.length - 1],
                        newMessage,
                    ];
                    return { ...old, pages: updatedPages };
                }
            );
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
        onError: (error: any) => {
            toast.error(error.errorMessage);
        },
    });
}

export function useAcceptInvite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (conversationId: string) =>
            conversationService.acceptInvite(conversationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
    });
}

export function useDeclineInvite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (conversationId: string) =>
            conversationService.declineInvite(conversationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
    });
}

export function useEditMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
            conversationService.editMessage(messageId, content),
        onSuccess: (updatedMessage) => {
            queryClient.setQueryData(
                ["messages", updatedMessage.conversationId],
                (old: any) => {
                    if (!old?.pages) return old;
                    return {
                        ...old,
                        pages: old.pages.map((page: Message[]) =>
                            page.map((msg) =>
                                msg.id === updatedMessage.id ? updatedMessage : msg
                            )
                        ),
                    };
                }
            );
        },
    });
}

export function useDeleteMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            messageId,
            mode,
        }: {
            messageId: string;
            mode: "me" | "everyone";
            conversationId: string;
        }) => conversationService.deleteMessage(messageId, mode),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["messages", variables.conversationId],
            });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            queryClient.invalidateQueries({ queryKey: ["conversations", "unread"] });
        },
    });
}

export function useDeleteConversation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (conversationId: string) =>
            conversationService.deleteConversation(conversationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            queryClient.invalidateQueries({ queryKey: ["conversations", "unread"] });
        },
    });
}

export function useMarkAsSeen() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (conversationId: string) =>
            conversationService.markAsSeen(conversationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations", "unread"] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
    });
}

export function useUnreadChatCount() {
    const { user } = useAppSelector((state) => state.auth);

    return useQuery({
        queryKey: ["conversations", "unread"],
        queryFn: async () => {
            return conversationService.getUnreadCount();
        },
        enabled: !!user,
        refetchInterval: 30000,
    });
}
