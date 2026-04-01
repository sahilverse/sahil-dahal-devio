import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function CompanyDetailSkeleton() {
    return (
        <div className="container max-w-5xl py-10 space-y-8">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-64 w-full rounded-[2.5rem]" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="space-y-4">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
        </div>
    );
}
