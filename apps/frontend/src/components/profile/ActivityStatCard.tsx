"use client";

import CircularProgress, { StatsData, DIFFICULTY_CONFIG } from "./CircularProgress";
import DifficultyRow from "./DifficultyRow";

interface ActivityStatCardProps {
    title: string;
    stats: StatsData;
}

export default function ActivityStatCard({ title, stats }: ActivityStatCardProps) {
    return (
        <div className="flex-1 bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
                {title}
            </h3>
            <div className="flex items-center gap-6">
                <CircularProgress stats={stats} />
                <div className="flex-1 space-y-3">
                    {DIFFICULTY_CONFIG.map(({ key, label, bgClass }) => (
                        <DifficultyRow
                            key={key}
                            label={label}
                            value={stats[key]}
                            bgClass={bgClass}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
