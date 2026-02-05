import api from "./axios";

export interface ActivityLogEntry {
    date: string;
    count: number;
}

export interface ActivityDataResponse {
    year: number;
    activityMap: ActivityLogEntry[];
    totalActivities: number;
}

export async function getActivity(username: string, year: number): Promise<ActivityDataResponse> {
    const { data } = await api.get(`/activity/${username}`, { params: { year } });
    return data.result;
}

export async function getAvailableActivityYears(username: string): Promise<number[]> {
    const { data } = await api.get(`/activity/${username}/years`);
    return data.result.years;
}
