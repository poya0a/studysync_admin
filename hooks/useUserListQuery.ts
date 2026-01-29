import { useQuery } from "@tanstack/react-query";
import { getAuth } from "firebase/auth";
import type { UserData } from "@/types";

type UserListResponse = {
    data: UserData[];
    nextCursor: string | null;
    hasNextPage: boolean;
};

export function useUserListQuery(cursor: string | null) {
    return useQuery<UserListResponse>({
        queryKey: ["userList", cursor],
        queryFn: async () => {
            const auth = getAuth();
            const token = await auth.currentUser?.getIdToken();

            if (!token) {
                throw new Error("Not authenticated");
            }

            const url = cursor
                ? `/api/users?cursor=${encodeURIComponent(cursor)}`
                : `/api/users`;

            const res = await fetch(url, {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("Failed to fetch users");
            }

            return res.json();
        },
    });
}
