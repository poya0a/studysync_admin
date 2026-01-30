import { useQuery } from "@tanstack/react-query";

export const useEventsTrendQuery = (days: number) =>
    useQuery({
        queryKey: ["admin-events-trend", days],
        queryFn: async () => {
            const res = await fetch(`/api/admin/events-trend?days=${days}`);
            if (!res.ok) throw new Error("trend fetch failed");
            return res.json();
        },
    });