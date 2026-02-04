"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
            <div className="relative w-full max-w-sm aspect-square">
                <Image
                    src="/devio-404-not-found.png"
                    alt="Page not found"
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            <div className="flex gap-4">
                <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full font-semibold h-11 px-8 gap-2 w-48"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                </Button>

                <Button asChild size="lg" className="rounded-full font-semibold h-11 px-8 gap-2 w-48">
                    <Link href="/">
                        <Home className="w-4 h-4" />
                        Go Back Home
                    </Link>
                </Button>
            </div>
        </div>
    );
}
