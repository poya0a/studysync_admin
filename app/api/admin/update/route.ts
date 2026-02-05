export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import type { UserData } from "@/types";

type UpdateType = "users" | "groups" | "events";

type UpdateRequestBody = {
    type: UpdateType;
    user: UserData;
    data: Record<string, string | number | string[]>;
};

const sanitizeForFirestore = (
    data: Record<string, unknown>
): Record<string, string | number | string[]> => {
    return Object.entries(data).reduce<Record<string, string | number | string[]>>(
        (acc, [key, value]) => {
            if (value === null || value === undefined) return acc;

            if (Array.isArray(value) && value.every(v => typeof v === "string")) {
                acc[key] = value;
                return acc;
            }

            if (typeof value === "string") {
                acc[key] = value.trim();
                return acc;
            }

            if (typeof value === "number") {
                acc[key] = value;
                return acc;
            }

            return acc;
            },
        {}
    );
};

export async function PATCH(req: NextRequest) {
    try {
        const body = (await req.json()) as Partial<UpdateRequestBody>;
        const { type, user, data } = body;

        if (!type || !user || !data) {
            return NextResponse.json({ message: "Invalid request" }, { status: 400 });
        }

        if (
            (type === "users" && user.role !== "SUPER_ADMIN") ||
            (type === "groups" && user.role === "USER" && data.ownerId !== user.uid) ||
            (type === "events" && user.role === "USER" && data.uid !== user.uid)
        ) {
            return NextResponse.json({ message: "Insufficient permissions" }, { status: 403 });
        }

        const docId = type === "users" ? data.uid : data.id;

        if (typeof docId !== "string") {
            return NextResponse.json({ message: "Invalid docId" }, { status: 400 });
        }

        const ref = adminDb.collection(type).doc(docId);
        const snap = await ref.get();

        if (!snap.exists) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        const prevData = snap.data()!;

        const diffData = Object.entries(data).reduce<
            Record<string, string | number | string[]>
        >((acc, [key, value]) => {
            if (
                (type === "groups" && key === "id") || 
                (type === "events" && key === "id")
            ) return acc;
            const prevValue = prevData[key];
            if (JSON.stringify(prevValue) === JSON.stringify(value)) return acc;
            acc[key] = value;
            return acc;
        }, {});

        if (Object.keys(diffData).length === 0) {
            return NextResponse.json({ ok: false, message: "No changes" });
        }

        const sanitizedData = sanitizeForFirestore(diffData);

        await ref.update({
            ...sanitizedData,
            updatedAt: new Date(),
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
