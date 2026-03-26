"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { PaymentGuard } from "@/components/shared/PaymentGuard";
import { VerifyContent } from "@/components/payment/verify/VerifyContent";
import Loading from "./loading";

export default function VerificationPage() {
    return (
        <PaymentGuard>
            <Suspense fallback={<Loading />}>
                <VerifyContent />
            </Suspense>
        </PaymentGuard>
    );
}
