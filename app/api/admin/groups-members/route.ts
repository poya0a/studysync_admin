import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
    const snap = await adminDb.collection("groups").get();

    const data = snap.docs.map((doc) => ({
        name: doc.data().name,
        members: doc.data().members?.length ?? 0,
    }));

    return NextResponse.json(data);
}