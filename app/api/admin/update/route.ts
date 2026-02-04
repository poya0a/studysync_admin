export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

type UpdateType = "users" | "groups" | "events";

type UpdateRequestBody = {
    type: UpdateType;
    id: string;
    data: Record<string, unknown>;
};

export async function PATCH(req: NextRequest) {
    try {
        const body = (await req.json()) as Partial<UpdateRequestBody>;
        
        const { type, data } = body;

        if (!type || !data) {
            return NextResponse.json(
                { message: "Invalid request" },
                { status: 400 }
            );
        }

        const docId = type === "users"
        ? data.uid
        : data.id;

        if (typeof docId !== "string") {
            return NextResponse.json({ message: "Invalid docId" }, { status: 400 });
        }

        const ref = adminDb.collection(type).doc(docId);
        
        const snap = await ref.get();

        if (!snap.exists) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        const prevData = snap.data()!;

        const sanitizedData = sanitizeForFirestore(data);

        const diffData = Object.entries(sanitizedData).reduce<
            Record<string, string | number | string[]>
        >((acc, [key, value]) => {
            if (JSON.stringify(prevData[key]) === JSON.stringify(value)) {
                return acc;
            }
            acc[key] = value;
            return acc;
        }, {});

        if (Object.keys(diffData).length === 0) {
            return NextResponse.json({ ok: true, changed: false });
        }

        await ref.update({
            ...diffData,
            updatedAt: new Date(),
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}

const sanitizeForFirestore = (
    data: Record<string, unknown>
): Record<string, string | number | string[]> => {
    return Object.entries(data).reduce<Record<string, string | number | string[]>>
    ((acc, [key, value]) => {
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
    }, {});
};