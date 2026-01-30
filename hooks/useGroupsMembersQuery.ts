import { useQuery } from "@tanstack/react-query";

export const useGroupsMembersQuery = () =>
    useQuery({
        queryKey: ["admin-groups-members"],
        queryFn: async () => {
            const res = await fetch("/api/admin/groups-members");
            if (!res.ok) throw new Error("groups fetch failed");
            return res.json();
        },
    });