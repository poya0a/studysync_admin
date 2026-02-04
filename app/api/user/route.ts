export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.replace("Bearer ", "");
        const decoded = await adminAuth.verifyIdToken(token);

        const snap = await adminDb.collection("users").doc(decoded.uid).get();
        if (!snap.exists) {
            return NextResponse.json(null);
        }

        const user = {
            uid: snap.id,
            ...snap.data(),
        }
        
        return NextResponse.json(user);
    } catch {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
}