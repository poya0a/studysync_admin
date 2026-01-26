import { useQuery } from "@tanstack/react-query";
import { fetchGroups } from "@/services/events";
import type { Group } from "@/types";

export function useGroupsQuery() {
    return useQuery<Group[]>({
        queryKey: ["groups"],
        queryFn: fetchGroups,
    });
}