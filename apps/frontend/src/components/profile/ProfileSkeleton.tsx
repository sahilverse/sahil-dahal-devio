import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSkeleton() {
    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
                {/* Header Skeleton */}
                <div className="min-w-0">
                    <div className="flex flex-col relative bg-card rounded-lg border shadow-sm overflow-hidden">
                        {/* Banner */}
                        <Skeleton className="w-full aspect-[4/1] min-h-[120px] max-h-[300px]" />

                        <div className="px-3 lg:px-6 pb-6">
                            {/* Avatar */}
                            <div className="relative flex justify-between items-end -mt-16 mb-4">
                                <Skeleton className="h-24 w-24 rounded-full border-2 border-card" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-2">
                                        {/* Name & Location */}
                                        <Skeleton className="h-6 w-48" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </div>
                                {/* Bio */}
                                <Skeleton className="h-4 w-full max-w-md mt-2" />
                                <Skeleton className="h-4 w-3/4 max-w-md" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Skeleton */}
                <div>
                    <div className="flex-col w-full hidden lg:flex border border-card rounded-lg p-4 pt-2 dark:border-secondary border-gray-700/20">
                        <div className="flex flex-col gap-4 pb-4">
                            <div className="flex justify-between items-center">
                                {/* Username */}
                                <Skeleton className="h-6 w-32" />
                            </div>
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <Skeleton className="h-8 flex-1 rounded-md" />
                                <Skeleton className="h-8 flex-1 rounded-md" />
                            </div>
                        </div>

                        {/* Stats Wrapper */}
                        <div className="pt-4 border-t border-border">
                            <div className="flex flex-col gap-4 pb-4">
                                {/* Follow Stats */}
                                <div className="grid grid-cols-2 gap-3 pb-2 border-b">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                {/* Grid Stats */}
                                <div className="grid grid-cols-2 gap-3">
                                    <Skeleton className="h-16 w-full rounded-md" />
                                    <Skeleton className="h-16 w-full rounded-md" />
                                    <Skeleton className="h-16 w-full rounded-md" />
                                    <Skeleton className="h-16 w-full rounded-md" />
                                </div>
                            </div>
                        </div>

                        {/* Achievements Wrapper */}
                        <div className="pt-4 border-t border-border">
                            <Skeleton className="h-4 w-24 mb-3" />
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-10 w-10 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
