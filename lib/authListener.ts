import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { queryClient } from "@/lib/react-query";

export function initAuthListener() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            queryClient.setQueryData(["user"], null);
            return;
        }

        const token = await user.getIdToken();

        await fetch("/api/user/sync", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const userDataRes = await fetch("/api/user", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userDataRes.json();

        queryClient.setQueryData(["user"], userData);
    });
}
