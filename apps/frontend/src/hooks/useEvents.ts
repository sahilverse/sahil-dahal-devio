import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EventService } from "@/api/eventService";
import { toast } from "sonner";

export function useEvent(id: string) {
    return useQuery({
        queryKey: ["event", id],
        queryFn: () => EventService.getEventById(id),
        enabled: !!id,
    });
}

export function useEventLeaderboard(id: string) {
    return useQuery({
        queryKey: ["event", id, "leaderboard"],
        queryFn: () => EventService.getLeaderboard(id),
        enabled: !!id,
    });
}

export function useAdminParticipants(eventId: string, enabled: boolean = false) {
    return useQuery({
        queryKey: ["event", eventId, "participants", "admin"],
        queryFn: () => EventService.getAdminParticipants(eventId),
        enabled: !!eventId && enabled,
    });
}

export function useUpdateManualScore(eventId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, score }: { userId: string; score: number }) =>
            EventService.updateManualScore(eventId, userId, score),
        onSuccess: () => {
            toast.success("Score updated successfully");
            queryClient.invalidateQueries({ queryKey: ["event", eventId, "participants", "admin"] });
            queryClient.invalidateQueries({ queryKey: ["event", eventId, "leaderboard"] });
        },
        onError: (err: any) => {
            toast.error(err?.errorMessage || "Failed to update score");
        },
    });
}

export function useRemoveParticipant(eventId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => EventService.removeParticipantMod(eventId, userId),
        onSuccess: () => {
            toast.success("Participant removed from event");
            queryClient.invalidateQueries({ queryKey: ["event", eventId, "participants", "admin"] });
            queryClient.invalidateQueries({ queryKey: ["event", eventId, "leaderboard"] });
        },
        onError: (err: any) => {
            toast.error(err?.errorMessage || "Failed to remove participant");
        },
    });
}

export function useUpdateParticipantStatus(eventId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, status }: { userId: string; status: string }) =>
            EventService.updateParticipantStatusMod(eventId, userId, status),
        onSuccess: () => {
            toast.success("Participant status updated");
            queryClient.invalidateQueries({ queryKey: ["event", eventId, "participants", "admin"] });
        },
        onError: (err: any) => {
            toast.error(err?.errorMessage || "Failed to update status");
        },
    });
}
