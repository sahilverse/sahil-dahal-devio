"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useVerifyPayment } from "@/hooks/usePayment";
import { PaymentSession } from "@/lib/payment-session";

export function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dataParam = searchParams.get("data");

    const {
        data
    } = useVerifyPayment(dataParam);

    const qc = useQueryClient();

    useEffect(() => {
        if (data && data.status === "COMPLETED") {
            toast.success(data.type === "COURSE_PURCHASE" ? "Enrollment Successful! 🎓" : `${data.ciphersAwarded} Ciphers added!`);
            qc.invalidateQueries({ queryKey: ["cipher-balance"] });
            qc.invalidateQueries({ queryKey: ["course"] });
            qc.invalidateQueries({ queryKey: ["course-modules"] });
            PaymentSession.clear();

            // Immediate Redirect
            if (data.type === "COURSE_PURCHASE" && data.courseSlug) {
                router.replace(`/l/${data.courseSlug}/lesson/start`);
            } else {
                router.replace("/");
            }
        }
    }, [data, qc, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <Loader2 className="size-12 animate-spin text-primary" />
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black tracking-tight">Verifying Payment...</h2>
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Please do not close this window</p>
            </div>
        </div>
    );
}
