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
            const queryParams = new URLSearchParams();
            if (cursor) queryParams.append("cursor", encodeURIComponent(cursor));
            if (keyword) queryParams.append("keyword", keyword);

            const res = await fetch(`/api/events?${queryParams.toString()}`,
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