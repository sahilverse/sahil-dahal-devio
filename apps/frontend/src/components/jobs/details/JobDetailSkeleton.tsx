import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function JobDetailSkeleton() {
    return (
        <div className="container max-w-6xl py-10 space-y-8">
            <Skeleton className="h-6 w-48 rounded-md" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-3/4 rounded-xl" />
                        <Skeleton className="h-4 w-1/2 rounded-md" />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <Skeleton className="h-20 rounded-2xl" />
                        <Skeleton className="h-20 rounded-2xl" />
                        <Skeleton className="h-20 rounded-2xl" />
                        <Skeleton className="h-20 rounded-2xl" />
                    </div>
                    <Skeleton className="h-[400px] rounded-[2.5rem]" />
                </div>
                <Skeleton className="h-96 rounded-3xl" />
            </div>
        </div>
    );
}
