"use client";

import { useQuery } from "@tanstack/react-query";
import { TopicService } from "@/api/topicService";

export const TOPIC_KEYS = {
    all: ["topics"] as const,
    search: (query: string) => [...TOPIC_KEYS.all, "search", query] as const,
};

export function useSearchTopics(query: string) {
    return useQuery({
        queryKey: TOPIC_KEYS.search(query),
        queryFn: () => TopicService.searchTopics(query),
        enabled: query.length >= 2,
        staleTime: 60 * 1000,
    });
}
