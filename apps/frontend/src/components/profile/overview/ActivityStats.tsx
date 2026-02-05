"use client";

import ActivityStatCard from "./ActivityStatCard";
import { StatsData } from "./CircularProgress";

interface ActivityStatsProps {
    problemStats: StatsData;
    roomStats: StatsData;
}

export default function ActivityStats({
    problemStats,
    roomStats,
}: ActivityStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActivityStatCard title="Problems Solved" stats={problemStats} />
            <ActivityStatCard title="Rooms Completed" stats={roomStats} />
        </div>
    );
}
