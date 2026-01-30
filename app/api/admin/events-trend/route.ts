import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
    const days = Number(req.nextUrl.searchParams.get("days") ?? 7);
    const from = new Date();
    from.setDate(from.getDate() - days);

    const snap = await adminDb
        .collection("events")
        .where("createdAt", ">=", from)
        .get();

    const map: Record<string, number> = {};

    snap.docs.forEach((doc) => {
        const d = doc.data().createdAt.toDate();
        const key = d.toISOString().slice(0, 10);
        map[key] = (map[key] ?? 0) + 1;
    });

    const result = Object.entries(map).map(([date, count]) => ({
        date,
        count,
    }));

    return NextResponse.json(result);
}