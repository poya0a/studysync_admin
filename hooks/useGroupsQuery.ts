import { useQuery } from "@tanstack/react-query";
import { auth } from "@/lib/firebase/client";
import { useUserQuery } from "@/hooks/useUserQuery";
import type { Group } from "@/types";

type GroupsResponse = {
    data: Group[];
    nextCursor: string | null;
    hasNextPage: boolean;
};

export function useGroupsQuery(cursor: string | null, keyword: string | null) {
    const { data: userData } = useUserQuery();
    return useQuery<GroupsResponse>({
        queryKey: ["groups", cursor, keyword],
        queryFn: async () => {
            const user = auth.currentUser;
            if (!user) return null;

            const token = await user.getIdToken();

            const res = await fetch(
                `/api/groups
                ${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}
                ${cursor && keyword ? "&" : keyword ? "?" : ""}
                ${keyword ? `keyword=${keyword}` : ""}`,
                {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("Failed to fetch groups");
            }

            return res.json();
        },
        enabled: !!userData,
    });
}