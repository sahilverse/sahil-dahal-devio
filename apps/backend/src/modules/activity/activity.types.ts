export interface ActivityLogEntry {
    date: string;
    count: number;
}

export interface ActivityDataResponse {
    year: number;
    activityMap: ActivityLogEntry[];
    totalActivities: number;
}

