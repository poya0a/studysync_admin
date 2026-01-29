import { useQuery } from "@tanstack/react-query";
import { auth } from "@/lib/firebase/client";
import type { UserData } from "@/types";

export async function fetchUser(): Promise<UserData | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const token = await user.getIdToken();

    const res = await fetch("/api/user", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
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
        queryFn: fetchUser,
        staleTime: Infinity,
        retry: false,
    });
}