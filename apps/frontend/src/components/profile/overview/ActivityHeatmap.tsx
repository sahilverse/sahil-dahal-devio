"use client";

import { useMemo, useState } from "react";
import { ActivityCalendar, ThemeInput } from "react-activity-calendar";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface ActivityHeatmapProps {
    data: { date: string; count: number }[];
}

function calculateLevel(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
    if (count === 0) return 0;
    if (maxCount === 0) return 0;

    const percentage = count / maxCount;
    if (percentage <= 0.25) return 1;
    if (percentage <= 0.5) return 2;
    if (percentage <= 0.75) return 3;
    return 4;
}

function generateFullYearData(
    activityData: { date: string; count: number }[],
    year: number
) {
    const activityMap = new Map<string, number>();
    activityData.forEach((item) => {
        activityMap.set(item.date, item.count);
    });

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const fullData: { date: string; count: number }[] = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split("T")[0];
        fullData.push({
            date: dateString,
            count: activityMap.get(dateString) || 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return fullData;
}

const brandTheme: ThemeInput = {
    light: [
        "#E5E7EB",
        "rgba(88, 101, 242, 0.2)",
        "rgba(88, 101, 242, 0.4)",
        "rgba(88, 101, 242, 0.7)",
        "#5865F2",
    ],
    dark: [
        "#1F1F28",
        "rgba(88, 101, 242, 0.2)",
        "rgba(88, 101, 242, 0.4)",
        "rgba(88, 101, 242, 0.7)",
        "#5865F2",
    ],
};

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
    const { actualTheme } = useSelector((state: RootState) => state.theme);
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const calendarData = useMemo(() => {
        const fullYearData = generateFullYearData(data, selectedYear);
        const maxCount = Math.max(...fullYearData.map((d) => d.count), 1);
        return fullYearData.map((item) => ({
            date: item.date,
            count: item.count,
            level: calculateLevel(item.count, maxCount),
        }));
    }, [data, selectedYear]);

    const canGoNext = selectedYear < currentYear;
    const canGoPrev = selectedYear > currentYear - 5;

    return (
        <div className="w-full rounded-lg shadow-sm bg-card p-4">
            {/* Year Navigation */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    Yearly Activity
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSelectedYear((y) => y - 1)}
                        disabled={!canGoPrev}
                        className="p-1 rounded hover:bg-card-light dark:hover:bg-card-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
                    </button>
                    <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark min-w-12.5 text-center">
                        {selectedYear}
                    </span>
                    <button
                        onClick={() => setSelectedYear((y) => y + 1)}
                        disabled={!canGoNext}
                        className="p-1 rounded hover:bg-card-light dark:hover:bg-card-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
                    </button>
                </div>
            </div>

            {/* Calendar */}
            <div className="overflow-x-auto">
                <ActivityCalendar
                    data={calendarData}
                    theme={brandTheme}
                    colorScheme={actualTheme}
                    blockSize={12}
                    blockMargin={4}
                    blockRadius={2}
                    fontSize={12}
                    showWeekdayLabels
                    renderBlock={(block, activity) => (
                        <g data-tooltip-id="heatmap-tooltip" data-tooltip-content={`${activity.count} events on ${activity.date}`}>
                            {block}
                        </g>
                    )}
                    labels={{
                        totalCount: `{{count}} activities in ${selectedYear}`,
                    }}
                />
            </div>

            {/* Tooltip */}
            <ReactTooltip
                id="heatmap-tooltip"
                className="bg-card-dark! text-text-primary-dark! text-xs! py-1! px-2! rounded!"
            />
        </div>
    );
}
