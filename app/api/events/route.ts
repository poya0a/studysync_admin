import { NextRequest, NextResponse } from "next/server";
import type { Query } from "firebase-admin/firestore";
import admin from "firebase-admin";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { decodeCursor, encodeCursor } from "@/lib/cursor";

const PAGE_SIZE = 10;

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.replace("Bearer ", "");
        const decoded = await adminAuth.verifyIdToken(token);
        const uid = decoded.uid;

        const userSnap = await adminDb.collection("users").doc(uid).get();
        if (!userSnap.exists) {
            return NextResponse.json({ message: "User not found" }, { status: 403 });
        }

        const { role } = userSnap.data() as { role: string };

        const { searchParams } = new URL(req.url);
        const keyword = searchParams.get("keyword")?.toLowerCase() || "";
        const cursorParam = searchParams.get("cursor");

        const cursor = cursorParam
            ? decodeCursor(cursorParam)
            : null;

        let query: Query = adminDb.collection("events");

        if (role === "USER") {
            query = query.where("uid", "==", uid);
        }

        if (cursor) {
            query = query.startAfter(
                new Date(cursor.createdAt),
                cursor.id
            );
        }

        query = query.limit(PAGE_SIZE);

        const snap = await query.get();

        const data = snap.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                uid: d.uid,
                title: d.title,
                color: d.color,
                date: d.date,
                createdAt: d.createdAt.toDate().getTime(),
                groupId: d.groupId ?? null,
                authorName: d.authorName ?? null,
            };
        });

        const lastDoc = snap.docs.at(-1);

        const nextCursor = lastDoc
            ? encodeCursor({
                createdAt: lastDoc.get("createdAt").toDate().getTime(),
                id: lastDoc.id,
                })
            : null;

        return NextResponse.json({
            data,
            nextCursor,
            hasNextPage: snap.size === PAGE_SIZE,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}