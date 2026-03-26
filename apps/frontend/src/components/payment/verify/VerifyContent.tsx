"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useVerifyPayment } from "@/hooks/usePayment";
import { PaymentSession } from "@/lib/payment-session";
import { SuccessState } from "./SuccessState";

export function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dataParam = searchParams.get("data");

    const {
        data
    } = useVerifyPayment(dataParam);

    const [countdown, setCountdown] = useState(10);
    const qc = useQueryClient();

    useEffect(() => {
        if (data && data.status === "COMPLETED") {
            toast.success(`${data.ciphersAwarded} Ciphers added!`);
            qc.invalidateQueries({ queryKey: ["cipher-balance"] });
            PaymentSession.clear();
        }
    }, [data, qc]);

    // 2. Handle Countdown
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (data && data.status === "COMPLETED" && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => Math.max(0, prev - 1));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [data, countdown]);

    // 3. Handle Redirect
    useEffect(() => {
        if (countdown === 0 && data?.status === "COMPLETED") {
            router.push("/");
        }
    }, [countdown, data, router]);


    if (data && data.status === "COMPLETED") {
        return (
            <SuccessState
                data={data}
                countdown={countdown}
                onDashboard={() => router.push("/")}
                onStore={() => router.push("/ciphers")}
            />
        );
    }

    return null;
}
