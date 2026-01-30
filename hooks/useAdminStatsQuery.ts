import { useQuery } from "@tanstack/react-query";

export const useAdminStatsQuery = () =>
    useQuery({
        queryKey: ["admin-stats"],
        queryFn: async () => {
            const res = await fetch("/api/admin/stats");
            if (!res.ok) throw new Error("stats fetch failed");
            return res.json();
        },
    });