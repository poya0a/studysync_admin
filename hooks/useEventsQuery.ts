import { useQuery } from "@tanstack/react-query";
import { getAuth } from "firebase/auth";
import type { Event } from "@/types";

type EventsResponse = {
    data: Event[];
    nextCursor: string | null;
    hasNextPage: boolean;
};

export function useEventsQuery(cursor: string | null) {
    return useQuery<EventsResponse>({
        queryKey: ["events", cursor],
        queryFn: async () => {
            const auth = getAuth();
            const token = await auth.currentUser?.getIdToken();

            const res = await fetch(
                `/api/events${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`,
                {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                }
            );

            if (!res.ok) {
                throw new Error("Failed to fetch events");
            }

            return res.json();
        },
    });
}