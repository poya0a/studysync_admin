import { useQuery } from "@tanstack/react-query";
import type { UserData } from "@/types";

export async function fetchMe(): Promise<UserData | null> {
    const res = await fetch("/api/user", {
        credentials: "include",
    });

    if (!res.ok) {
        if (res.status === 401) return null;
        throw new Error("Failed to fetch user");
    }

    return res.json();
}

export function useUserQuery() {
    return useQuery<UserData | null>({
        queryKey: ["user"],
        queryFn: fetchMe,
        staleTime: Infinity,
        retry: false,
    });
}