import { useQuery } from "@tanstack/react-query";
import { auth } from "@/lib/firebase/client";
import { useUserQuery } from "@/hooks/useUserQuery";
import type { Event } from "@/types";

type EventsResponse = {
    data: Event[];
    nextCursor: string | null;
    hasNextPage: boolean;
};

export function useEventsQuery(cursor: string | null, keyword: string | null) {
    const { data: userData } = useUserQuery();
    return useQuery<EventsResponse>({
        queryKey: ["events", cursor, keyword],
        queryFn: async () => {
            const user = auth.currentUser;
            if (!user) return null;

            const token = await user.getIdToken();

            const res = await fetch(
                `/api/events
                ${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}
                ${cursor && keyword ? "&" : keyword ? "?" : ""}
                ${keyword ? `keyword=${keyword}` : ""}`,
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
        enabled: !!userData,
    });
}