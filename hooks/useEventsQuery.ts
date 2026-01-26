import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "@/services/events";
import type { Event } from "@/types";

export function useEventsQuery(page: number, size = 10, keyword?: string) {
    return useQuery<{ data: Event[]; total: number }>({
        queryKey: ["events", page, size, keyword],
        queryFn: () => fetchEvents(page, size, keyword),
        // keepPreviousData: true,
    });
}