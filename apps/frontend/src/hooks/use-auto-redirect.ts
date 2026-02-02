import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UseAutoRedirectProps {
    shouldRedirect: boolean;
    to?: string;
    duration?: number;
}

export function useAutoRedirect({
    shouldRedirect,
    to = "/",
    duration = 3000
}: UseAutoRedirectProps) {
    const router = useRouter();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (shouldRedirect) {
            const interval = 30;
            const steps = duration / interval;
            const increment = 100 / steps;

            const timer = setInterval(() => {
                setProgress((prev) => {
                    const next = prev + increment;
                    if (next >= 100) {
                        clearInterval(timer);
                        return 100;
                    }
                    return next;
                });
            }, interval);

            const redirectTimer = setTimeout(() => {
                router.push(to);
            }, duration);

            return () => {
                clearInterval(timer);
                clearTimeout(redirectTimer);
            };
        }
    }, [shouldRedirect, to, duration, router]);

    return { progress };
}
