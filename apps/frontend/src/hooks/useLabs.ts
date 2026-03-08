import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LabService, LabsResponse, LabRoom, LabEnrollment, CTFChallenge, VMSession, CTFSubmissionResult } from "@/api/labService";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

// ─── Lab Rooms ─────────────────────────────────────────────

export function useFetchLabs(params?: any) {
    return useQuery<LabsResponse>({
        queryKey: ["labs", params],
        queryFn: () => LabService.getRooms(params),
    });
}

export function useFetchLab(slug: string) {
    return useQuery<LabRoom>({
        queryKey: ["lab", slug],
        queryFn: () => LabService.getRoomBySlug(slug),
        enabled: !!slug,
    });
}

// ─── Enrollment ────────────────────────────────────────────

export function useFetchEnrollment(roomId: string) {
    return useQuery<LabEnrollment | null>({
        queryKey: ["lab-enrollment", roomId],
        queryFn: () => LabService.getEnrollment(roomId),
        enabled: !!roomId,
    });
}

export function useJoinRoom() {
    const queryClient = useQueryClient();
    return useMutation<LabEnrollment, any, string>({
        mutationFn: (roomId) => LabService.joinRoom(roomId),
        onSuccess: (_data, roomId) => {
            toast.success("Joined room successfully!");
            queryClient.invalidateQueries({ queryKey: ["lab-enrollment", roomId] });
            queryClient.invalidateQueries({ queryKey: ["labs"] });
        },
        onError: (error: any) => {
            toast.error(error?.errorMessage || "Failed to join room.");
            logger.error("Join Room Error:", error);
        },
    });
}

// ─── CTF Challenges ────────────────────────────────────────

export function useFetchChallenges(roomId: string) {
    return useQuery<CTFChallenge[]>({
        queryKey: ["ctf-challenges", roomId],
        queryFn: () => LabService.getChallenges(roomId),
        enabled: !!roomId,
    });
}

export function useSubmitFlag() {
    const queryClient = useQueryClient();
    return useMutation<CTFSubmissionResult, any, { challengeId: string; answer: string }>({
        mutationFn: ({ challengeId, answer }) => LabService.submitFlag(challengeId, answer),
        onSuccess: (result, { challengeId }) => {
            if (result.isCorrect) {
                toast.success(result.message);
                queryClient.invalidateQueries({ queryKey: ["ctf-challenges"] });
            } else {
                toast.error(result.message);
            }
        },
        onError: (error: any) => {
            toast.error(error?.errorMessage || "Submission failed.");
        },
    });
}

// ─── VM Sessions ───────────────────────────────────────────

export function useFetchActiveSession(roomId: string) {
    return useQuery<VMSession | null>({
        queryKey: ["vm-session", roomId],
        queryFn: () => LabService.getActiveSession(roomId),
        enabled: !!roomId,
        refetchInterval: 15000, // Poll every 15s to track timer
    });
}

export function useStartSession() {
    const queryClient = useQueryClient();
    return useMutation<VMSession, any, string>({
        mutationFn: (roomId) => LabService.startSession(roomId),
        onSuccess: (_data, roomId) => {
            toast.success("VM session started!");
            queryClient.invalidateQueries({ queryKey: ["vm-session", roomId] });
        },
        onError: (error: any) => {
            toast.error(error?.errorMessage || "Failed to start session.");
        },
    });
}

export function useExtendSession() {
    const queryClient = useQueryClient();
    return useMutation<VMSession, any, string>({
        mutationFn: (sessionId) => LabService.extendSession(sessionId),
        onSuccess: () => {
            toast.success("Session extended by 30 minutes!");
            queryClient.invalidateQueries({ queryKey: ["vm-session"] });
        },
        onError: (error: any) => {
            toast.error(error?.errorMessage || "Failed to extend session. Check your Cipher balance.");
        },
    });
}

export function useTerminateSession() {
    const queryClient = useQueryClient();
    return useMutation<void, any, string>({
        mutationFn: (sessionId) => LabService.terminateSession(sessionId),
        onSuccess: () => {
            toast.success("Session terminated.");
            queryClient.invalidateQueries({ queryKey: ["vm-session"] });
        },
        onError: (error: any) => {
            toast.error(error?.errorMessage || "Failed to terminate session.");
        },
    });
}
