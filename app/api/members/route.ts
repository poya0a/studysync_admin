export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
    try {
        const groupId = req.nextUrl.searchParams.get("groupId");
        if (!groupId) {
            return NextResponse.json({ message: "groupId is required" }, { status: 400 });
        }

        const groupSnap = await adminDb.collection("groups").doc(groupId).get();
        if (!groupSnap.exists) {
            return NextResponse.json({ message: "Group not found" }, { status: 404 });
        }

        const groupData = groupSnap.data();
        const memberUids: string[] = groupData?.members || [];

        if (memberUids.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        const memberDocRefs = memberUids.map(uid => adminDb.collection("users").doc(uid));

        const memberSnaps = await adminDb.getAll(...memberDocRefs);

        const result = memberSnaps
            .filter(snap => snap.exists)
            .map(snap => ({
                uid: snap.id,
                name: snap.data()?.name || "",
            }));

        return NextResponse.json(result);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}