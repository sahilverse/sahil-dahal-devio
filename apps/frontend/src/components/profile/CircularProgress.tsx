"use client";

import { useMemo } from "react";

export interface StatsData {
    total: number;
    easy: number;
    medium: number;
    hard: number;
}

export const DIFFICULTY_CONFIG = [
    { key: "easy", label: "Easy", color: "#22C55E", bgClass: "bg-green-500" },
    { key: "medium", label: "Medium", color: "#F59E0B", bgClass: "bg-amber-500" },
    { key: "hard", label: "Hard", color: "#EF4444", bgClass: "bg-red-500" },
] as const;

const GAP = 0.02;

interface CircularProgressProps {
    stats: StatsData;
    size?: number;
    strokeWidth?: number;
}

export default function CircularProgress({
    stats,
    size = 120,
    strokeWidth = 8,
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    const segments = useMemo(() => {
        if (stats.total === 0) return [];

        const availablePercent = 1 - GAP * 3;
        let currentOffset = 0;

        return DIFFICULTY_CONFIG.map(({ key, color }) => {
            const percent = (stats[key] / stats.total) * availablePercent;
            const segment = { color, percent, offset: currentOffset };
            currentOffset += percent + GAP;
            return segment;
        });
    }, [stats]);

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                className="-rotate-90"
                viewBox={`0 0 ${size} ${size}`}
            >
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-muted/30"
                />
                {segments.map(({ color, percent, offset }) => (
                    <circle
                        key={color}
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${percent * circumference} ${circumference}`}
                        strokeDashoffset={-offset * circumference}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                    />
                ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{stats.total}</span>
                <span className="text-xs text-muted-foreground">Total</span>
            </div>
        </div>
    );
}
