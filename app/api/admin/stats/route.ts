import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
    const [users, groups, events] = await Promise.all([
        adminDb.collection("users").count().get(),
        adminDb.collection("groups").count().get(),
        adminDb.collection("events").count().get(),
    ]);

    return NextResponse.json({
        users: users.data().count,
        groups: groups.data().count,
        events: events.data().count,
    });
}