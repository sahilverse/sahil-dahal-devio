"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PaymentSession } from "@/lib/payment-session";

interface PaymentGuardProps {
    children: React.ReactNode;
}

export function PaymentGuard({ children }: PaymentGuardProps) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!PaymentSession.isValid()) {
            router.replace("/");
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
}
