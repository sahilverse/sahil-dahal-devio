import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { toast } from "sonner";
import { AsyncThunk } from "@reduxjs/toolkit";

interface UseTokenVerifierProps {
    action: any;
    successMessage?: string;
    errorMessage?: string;
}

export type VerifierStatus = "verifying" | "verified" | "success" | "error";

export function useTokenVerifier({
    action,
    successMessage = "Token verified successfully",
    errorMessage = "Invalid or expired token"
}: UseTokenVerifierProps) {
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();

    const token = searchParams?.get("token");
    const [status, setStatus] = useState<VerifierStatus>("verifying");
    const [error, setError] = useState("");
    const verifyCalled = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setError("Invalid link");
            return;
        }

        if (verifyCalled.current) return;
        verifyCalled.current = true;

        const verify = async () => {
            try {
                // @ts-ignore - Dynamic action dispatch
                await dispatch(action({ token })).unwrap();
                setStatus("verified");
                if (successMessage) toast.success(successMessage);
            } catch (err: any) {
                setStatus("error");
                setError(err?.errorMessage || errorMessage);
            }
        };

        verify();
    }, [token, dispatch, action, successMessage, errorMessage]);

    return { status, error, setStatus, setError, token };
}
