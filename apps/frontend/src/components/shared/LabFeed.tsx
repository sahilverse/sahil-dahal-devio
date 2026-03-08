import React from "react";
import { LabCard } from "./LabCard";
import { LabRoom } from "@/api/labService";
import { Loader2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface LabFeedProps {
    rooms?: LabRoom[];
    isLoading: boolean;
    className?: string;
}

export const LabFeed: React.FC<LabFeedProps> = ({ rooms, isLoading, className }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-brand-primary/40" />
                <p className="text-sm font-medium animate-pulse">Scanning the network for vulnerable machines...</p>
            </div>
        );
    }

    if (!rooms || rooms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border/60 rounded-3xl bg-muted/5">
                <div className="bg-brand-primary/10 p-5 rounded-2xl mb-6 flex items-center justify-center">
                    <ShieldAlert className="h-10 w-10 text-brand-primary/60" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No active targets found</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    We couldn't find any labs matching your current criteria. Adjust your radar.
                </p>
            </div>
        );
    }

    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
            {rooms.map((room) => (
                <LabCard key={room.id} room={room} />
            ))}
        </div>
    );
};
