"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
            <div className="relative w-full max-w-sm aspect-square">
                <Image
                    src="/devio-500-server-error.png"
                    alt="Server error"
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            <div className="flex gap-4">
                <Button
                    onClick={reset}
                    size="lg"
                    className="rounded-full font-semibold px-8 gap-2 cursor-pointer"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Try again
                </Button>
            </div>
        </div>
    );
}
