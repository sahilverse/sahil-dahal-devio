"use client";

export default function CommunitySkeleton() {
    return (
        <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
                {/* Main content */}
                <div className="min-w-0">
                    {/* Header Skeleton */}
                    <div className="bg-card rounded-lg border overflow-hidden">
                        {/* Banner */}
                        <div className="w-full aspect-[4/1] bg-muted" />
                        {/* Icon + Name + Actions */}
                        <div className="px-6 pb-4">
                            <div className="flex justify-between items-end -mt-12 mb-3">
                                <div className="h-20 w-20 rounded-full bg-muted border-2 border-card" />
                                <div className="flex gap-2 pb-1">
                                    <div className="h-8 w-24 bg-muted rounded-lg" />
                                    <div className="h-8 w-16 bg-muted rounded-lg" />
                                </div>
                            </div>
                            <div className="h-7 w-48 bg-muted rounded mb-4" />
                        </div>
                        {/* Tabs */}
                        <div className="flex gap-4 px-6 pb-2 border-b border-border/50">
                            <div className="h-5 w-14 bg-muted rounded" />
                            <div className="h-5 w-20 bg-muted rounded" />
                        </div>
                    </div>

                    {/* Posts skeleton */}
                    <div className="space-y-4 mt-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-card border rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-muted" />
                                    <div className="h-4 w-32 bg-muted rounded" />
                                </div>
                                <div className="h-5 w-3/4 bg-muted rounded" />
                                <div className="h-4 w-full bg-muted rounded" />
                                <div className="h-4 w-2/3 bg-muted rounded" />
                                <div className="flex gap-2 pt-2">
                                    <div className="h-8 w-24 bg-muted rounded-full" />
                                    <div className="h-8 w-20 bg-muted rounded-full" />
                                    <div className="h-8 w-16 bg-muted rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar skeleton */}
                <div className="hidden lg:block">
                    <div className="sticky top-4 w-full">
                        <div className="bg-card border rounded-lg p-4 space-y-4">
                            <div className="h-4 w-full bg-muted rounded" />
                            <div className="h-4 w-3/4 bg-muted rounded" />
                            <div className="h-px bg-border" />
                            <div className="flex gap-2">
                                <div className="h-4 w-20 bg-muted rounded" />
                                <div className="h-4 w-20 bg-muted rounded" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="h-12 bg-muted rounded" />
                                <div className="h-12 bg-muted rounded" />
                            </div>
                            <div className="h-px bg-border" />
                            <div className="h-4 w-24 bg-muted rounded" />
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-8 w-full bg-muted rounded" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
