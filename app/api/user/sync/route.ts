export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.replace("Bearer ", "");
        const decoded = await adminAuth.verifyIdToken(token);

        const { uid, email, name } = decoded;

        const userRef = adminDb.collection("users").doc(uid);
        const snap = await userRef.get();

        if (!snap.exists) {
            await userRef.set({
                uid,
                email,
                name,
                role: "USER",
                createdAt: new Date(),
                lastLogin: new Date(),
            });
        } else {
            await userRef.update({
                lastLogin: new Date(),
            });
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}